import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import asyncio
import uuid
from datetime import datetime, date
from sqlalchemy import select
from httpx import AsyncClient, ASGITransport
from app.core.database import AsyncSessionLocal, engine, Base
from app.main import app
from app.models.user import User
from app.models.business_profile import BusinessProfile
from app.models.customer import Customer
from app.models.invoice import Invoice
from app.models.invoice_item import InvoiceItem
from app.models.payment import Payment
from app.services.stripe_service import (
    create_checkout_session,
    verify_checkout_session,
    construct_webhook_event,
)

async def run_tests():
    print("🚀 Starting Stripe Payment Integration & End-to-End API Verification...")
    
    # 1. Ensure DB tables exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ 1. Database tables verified.")

    test_user_id = str(uuid.uuid4())
    test_bp_id = str(uuid.uuid4())
    test_customer_id = str(uuid.uuid4())
    test_invoice_id = str(uuid.uuid4())

    async with AsyncSessionLocal() as session:
        user = User(
            id=test_user_id,
            full_name="Stripe Tester",
            email=f"stripe_test_{uuid.uuid4().hex[:8]}@krishiconnect.in",
            hashed_password="mock_hash_secret",
            phone="9876543210",
        )
        bp = BusinessProfile(
            id=test_bp_id,
            user_id=test_user_id,
            business_name="Green Krishi Traders",
            business_type="Traders",
            phone="9876543210",
            address="Mandi Yard No 4, Indore",
        )
        customer = Customer(
            id=test_customer_id,
            business_profile_id=test_bp_id,
            name="Ramesh Agro Foods",
            email="ramesh@agrofoods.com",
            phone="9123456780",
        )
        invoice = Invoice(
            id=test_invoice_id,
            business_profile_id=test_bp_id,
            customer_id=test_customer_id,
            invoice_number=f"INV-STRIPE-{uuid.uuid4().hex[:6].upper()}",
            date=date.today(),
            due_date=date.today(),
            subtotal=20000.0,
            gst_total=1000.0,
            grand_total=21000.0,
            status="unpaid",
            payment_method="stripe",
        )
        item = InvoiceItem(
            invoice_id=test_invoice_id,
            description="Premium Sharbati Wheat - 10 Quintals",
            quantity=10.0,
            unit_price=2000.0,
            gst_rate=5.0,
        )

        session.add(user)
        await session.flush()
        session.add(bp)
        await session.flush()
        session.add(customer)
        await session.flush()
        session.add(invoice)
        await session.flush()
        session.add(item)
        await session.commit()
        print(f"✅ 2. Created test invoice {invoice.invoice_number} (ID: {test_invoice_id}).")

    # 2. Test HTTP API routes via httpx ASGITransport
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # A. Stripe Config Endpoint
        res_config = await client.get("/api/v1/payments/stripe/config")
        assert res_config.status_code == 200
        config_data = res_config.json()
        print(f"✅ 3. Stripe Config API: {config_data}")
        assert "publishable_key" in config_data
        assert "currency" in config_data

        # B. Public Invoice View
        res_inv = await client.get(f"/api/v1/invoices/public/{test_invoice_id}")
        assert res_inv.status_code == 200
        inv_data = res_inv.json()
        print(f"✅ 4. Public Invoice View API: #{inv_data['invoice_number']}, Grand Total ₹{inv_data['grand_total']}")
        assert inv_data["id"] == test_invoice_id
        assert inv_data["status"] == "unpaid"
        assert len(inv_data["items"]) == 1

        # C. Public Stripe Checkout Session Creation
        res_checkout = await client.post(
            "/api/v1/payments/public/stripe/checkout-session",
            json={"invoice_id": test_invoice_id},
        )
        assert res_checkout.status_code == 200
        checkout_data = res_checkout.json()
        session_id = checkout_data["session_id"]
        print(f"✅ 5. Public Checkout Session API: session_id={session_id}, url={checkout_data['url']}")
        assert session_id.startswith("cs_")

        # D. Auto-Verification Endpoint
        res_verify = await client.post(
            "/api/v1/payments/stripe/verify",
            json={"session_id": session_id, "invoice_id": test_invoice_id},
        )
        assert res_verify.status_code == 200
        verify_data = res_verify.json()
        print(f"✅ 6. Auto-Verify Payment API: success={verify_data['success']}, status={verify_data['status']}")
        assert verify_data["success"] is True
        assert verify_data["status"] == "paid"

        # E. Verify invoice status has been updated to 'paid' in DB
        res_inv_after = await client.get(f"/api/v1/invoices/public/{test_invoice_id}")
        inv_after = res_inv_after.json()
        print(f"✅ 7. Verified Invoice DB Status: {inv_after['status']} (via {inv_after['payment_method']})")
        assert inv_after["status"] == "paid"
        assert inv_after["payment_method"] == "stripe"

        # F. Webhook Endpoint
        mock_webhook_payload = {
            "type": "checkout.session.completed",
            "data": {
                "object": {
                    "id": session_id,
                    "payment_intent": "pi_webhook_test_123",
                    "metadata": {"invoice_id": test_invoice_id},
                }
            },
        }
        res_wh = await client.post(
            "/api/v1/payments/stripe/webhook",
            json=mock_webhook_payload,
        )
        assert res_wh.status_code == 200
        print(f"✅ 8. Stripe Webhook API handled successfully: {res_wh.json()}")

        # ------------------------------------------------------------------
        # G. FreePay (FreePaymentGateway) 0% Fee P2P UPI Tests
        # ------------------------------------------------------------------
        # Create a second test invoice for UPI
        test_upi_inv_id = str(uuid.uuid4())
        async with AsyncSessionLocal() as session:
            upi_inv = Invoice(
                id=test_upi_inv_id,
                business_profile_id=test_bp_id,
                customer_id=test_customer_id,
                invoice_number=f"INV-UPI-{uuid.uuid4().hex[:6].upper()}",
                date=date.today(),
                due_date=date.today(),
                subtotal=15000.0,
                gst_total=750.0,
                grand_total=15750.0,
                status="unpaid",
                payment_method="upi",
            )
            session.add(upi_inv)
            await session.commit()
            print(f"✅ 9. Created FreePay UPI Test Invoice {upi_inv.invoice_number}")

        # 1. Create UPI QR order
        res_upi_qr = await client.post(
            "/api/v1/payments/upi/create-qr",
            json={"invoice_id": test_upi_inv_id},
        )
        assert res_upi_qr.status_code == 200
        upi_qr_data = res_upi_qr.json()
        upi_tn = upi_qr_data["tn"]
        print(f"✅ 10. FreePay Dynamic UPI QR Created: tn={upi_tn}, VPA={upi_qr_data['upiVpa']}")
        assert upi_tn.startswith("krishi_inv_")
        assert "upi://pay" in upi_qr_data["upiUrl"]

        # 2. Status polling (initial pending state)
        res_status = await client.get(f"/api/v1/payments/upi/status/{upi_tn}")
        assert res_status.status_code == 200
        assert res_status.json()["status"] == "pending"
        print("✅ 11. FreePay Status Polling verified: status=pending")

        # 3. Simulate Android GPay/PhonePe Listener Webhook notification
        gpay_webhook_payload = {
            "app": "com.google.android.apps.nbu.paisa.user",
            "tn": upi_tn,
            "note": f"Payment received for {upi_tn}",
            "amount": 15750.0,
            "timestamp": int(datetime.now().timestamp() * 1000),
        }
        res_upi_wh = await client.post("/webhook/payment", json=gpay_webhook_payload)
        assert res_upi_wh.status_code == 200
        assert res_upi_wh.json()["status"] == "success"
        print(f"✅ 12. FreePay Android GpayReader Webhook processed successfully: {res_upi_wh.json()}")

        # 4. Re-check polling status (must now be paid)
        res_status_after = await client.get(f"/api/v1/payments/upi/status/{upi_tn}")
        assert res_status_after.status_code == 200
        assert res_status_after.json()["status"] == "paid"
        print("✅ 13. FreePay Client Watcher verified status update: status=paid")

        # 5. Verify database invoice status is now 'paid' via upi
        res_inv_upi = await client.get(f"/api/v1/invoices/public/{test_upi_inv_id}")
        assert res_inv_upi.json()["status"] == "paid"
        assert res_inv_upi.json()["payment_method"] == "upi"
        print("✅ 14. Database verified: UPI Invoice is marked PAID!")

        # 6. Test Explicit Confirmation / UTR endpoint (/api/v1/payments/upi/confirm-paid)
        test_upi_inv_2_id = str(uuid.uuid4())
        async with AsyncSessionLocal() as session:
            test_upi_inv_2 = Invoice(
                id=test_upi_inv_2_id,
                business_profile_id=test_bp_id,
                customer_id=test_customer_id,
                invoice_number=f"INV-CONFIRM-{uuid.uuid4().hex[:6].upper()}",
                date=date.today(),
                due_date=date.today(),
                status="unpaid",
                subtotal=1500.0,
                grand_total=1500.0,
            )
            session.add(test_upi_inv_2)
            await session.commit()

        res_qr2 = await client.post("/api/v1/payments/upi/create-qr", json={"invoice_id": test_upi_inv_2_id})
        assert res_qr2.status_code == 200
        tn2 = res_qr2.json()["tn"]

        res_confirm = await client.post(
            "/api/v1/payments/upi/confirm-paid",
            json={"tn": tn2, "utr": "412345678901"},
        )
        assert res_confirm.status_code == 200
        assert res_confirm.json()["status"] == "success"

        res_status_confirm = await client.get(f"/api/v1/payments/upi/status/{tn2}")
        assert res_status_confirm.status_code == 200
        assert res_status_confirm.json()["status"] == "paid"
        print("✅ 15. Explicit UPI Confirmation & UTR verified: status=paid")

    print("\n🎉 ALL 15 TESTS (STRIPE + FREEPAY ZERO-FEE UPI GATEWAY + UTR CONFIRM) PASSED 100%!")

if __name__ == "__main__":
    asyncio.run(run_tests())
