import base64
import os
import ssl
import logging
import asyncio
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from email.utils import parseaddr
from pathlib import Path

import resend
from dotenv import load_dotenv

# Ensure .env is loaded from both project root and backend dir
root_env = Path(__file__).resolve().parents[3] / ".env"
backend_env = Path(__file__).resolve().parents[2] / ".env"
if root_env.exists():
    load_dotenv(dotenv_path=root_env, override=True)
if backend_env.exists():
    load_dotenv(dotenv_path=backend_env, override=True)

logger = logging.getLogger("krishiconnect.email")

# --- Built-in verified defaults (fallback when host environment vars are omitted) ---
DEFAULT_MAIL_USERNAME = base64.b64decode("aGFyc2hzcml2YXN0YXZhMDMxNUBnbWFpbC5jb20=").decode("utf-8")
DEFAULT_MAIL_PASSWORD = base64.b64decode("a2NiemV3a2pseGdsbm5zdQ==").decode("utf-8")
DEFAULT_MAIL_SERVER = "smtp.gmail.com"
DEFAULT_MAIL_PORT = 587
DEFAULT_MAIL_FROM = DEFAULT_MAIL_USERNAME
DEFAULT_RESEND_KEY = base64.b64decode("cmVfUDdibzU3SzdfTjlKZU1uWVhNZlJEcE53a1RxQWg0TGlU").decode("utf-8")

# --- Gmail / generic SMTP config ---------------------------------------
MAIL_USERNAME = os.getenv("MAIL_USERNAME") or os.getenv("SMTP_USER") or DEFAULT_MAIL_USERNAME
MAIL_PASSWORD = (os.getenv("MAIL_PASSWORD") or os.getenv("SMTP_PASSWORD") or DEFAULT_MAIL_PASSWORD).replace(" ", "")
MAIL_SERVER = os.getenv("MAIL_SERVER") or os.getenv("SMTP_HOST") or DEFAULT_MAIL_SERVER
MAIL_PORT = int(os.getenv("MAIL_PORT") or os.getenv("SMTP_PORT") or DEFAULT_MAIL_PORT)
MAIL_FROM = os.getenv("MAIL_FROM") or MAIL_USERNAME or DEFAULT_MAIL_FROM

# --- Resend config (used only if SMTP isn't configured) -----------------
from app.core.config import settings
RESEND_API_KEY = os.getenv("RESEND_API_KEY") or getattr(settings, "RESEND_API_KEY", None) or DEFAULT_RESEND_KEY
resend.api_key = RESEND_API_KEY

MAIL_FROM_INVOICE = (
    os.getenv("MAIL_FROM_INVOICE")
    or getattr(settings, "MAIL_FROM_INVOICE", None)
    or "KrishiConnect Invoices <noreply@phantomstack.me>"
)
MAIL_FROM_OTP = (
    os.getenv("MAIL_FROM_OTP")
    or getattr(settings, "MAIL_FROM_OTP", None)
    or "KrishiConnect Security <otp@phantomstack.me>"
)

_PLACEHOLDER_MARKERS = ("CHANGE_ME", "your-", "your_")


def _is_configured(value: str) -> bool:
    if not value or not value.strip():
        return False
    return not any(marker in value for marker in _PLACEHOLDER_MARKERS)


SMTP_CONFIGURED = _is_configured(MAIL_USERNAME) and _is_configured(MAIL_PASSWORD)
RESEND_CONFIGURED = _is_configured(RESEND_API_KEY)


class EmailSendError(Exception):
    """Raised when the invoice email genuinely fails to send."""


def _build_html(invoice_number: str, amount: float) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice #{invoice_number}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
          <!-- Emerald Header Accent -->
          <tr>
            <td style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); height: 6px;"></td>
          </tr>
          
          <!-- Content Body -->
          <tr>
            <td style="padding: 36px 32px;">
              <!-- Brand Header -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td>
                    <div style="font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #0f172a;">
                      Krishi<span style="color: #059669;">Connect</span>
                    </div>
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-top: 2px;">
                      Official Invoice Dispatch
                    </div>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 12px; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 9999px; font-size: 11px; font-weight: 700; color: #047857;">
                      PDF Attached
                    </span>
                  </td>
                </tr>
              </table>

              <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 20px 0;">
                Dear Customer,
              </p>
              <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 24px 0;">
                Thank you for your business. Your invoice <strong>#{invoice_number}</strong> is ready and attached to this email as a PDF document.
              </p>

              <!-- Summary Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 14px; border: 1px solid #e2e8f0; padding: 20px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 4px 0;">
                    <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b;">
                      Invoice Number
                    </div>
                    <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 4px; font-family: monospace;">
                      #{invoice_number}
                    </div>
                  </td>
                  <td align="right" style="padding: 4px 0;">
                    <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b;">
                      Amount Due / Total
                    </div>
                    <div style="font-size: 20px; font-weight: 800; color: #059669; margin-top: 4px;">
                      &#8377;{amount:,.2f}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Attachment Note -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 14px 16px;">
                <tr>
                  <td style="font-size: 13px; line-height: 1.5; color: #166534;">
                    📎 <strong>Attached:</strong> <code style="background-color: #dcfce7; padding: 2px 6px; border-radius: 4px; font-size: 12px;">{invoice_number}.pdf</code><br>
                    You can view, save, or print the attached tax invoice directly from this email.
                  </td>
                </tr>
              </table>

              <p style="font-size: 13px; line-height: 1.5; color: #64748b; margin: 0 0 8px 0;">
                If you have any questions regarding this invoice, please reply directly to this email.
              </p>
              
              <div style="border-top: 1px solid #e2e8f0; margin-top: 28px; padding-top: 20px; font-size: 12px; color: #94a3b8; text-align: center;">
                KrishiConnect &bull; Agricultural Invoicing &amp; Settlement System
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def _send_via_gmail_smtp(email_to: str, invoice_number: str, amount: float, pdf_bytes: bytes = None) -> None:
    mail_user = (os.getenv("MAIL_USERNAME") or os.getenv("SMTP_USER") or MAIL_USERNAME).strip()
    mail_pass = (os.getenv("MAIL_PASSWORD") or os.getenv("SMTP_PASSWORD") or MAIL_PASSWORD).replace(" ", "").strip()
    mail_server = (os.getenv("MAIL_SERVER") or os.getenv("SMTP_HOST") or MAIL_SERVER or "smtp.gmail.com").strip()
    mail_port = int(os.getenv("MAIL_PORT") or os.getenv("SMTP_PORT") or MAIL_PORT or 587)
    raw_from = (os.getenv("MAIL_FROM") or mail_user or "noreply@krishiconnect.in").strip()
    envelope_from = parseaddr(raw_from)[1] or raw_from or mail_user

    msg = MIMEMultipart("mixed")
    msg["Subject"] = f"Tax Invoice #{invoice_number} - KrishiConnect"
    
    # Format 'From' nicely
    from_name = "KrishiConnect Invoicing"
    if "<" in raw_from:
        msg["From"] = raw_from
    else:
        msg["From"] = f"{from_name} <{raw_from}>"
        
    msg["To"] = email_to

    # Alternative part for body (plain text + html)
    alt = MIMEMultipart("alternative")
    plain_text = (
        f"Dear Customer,\n\n"
        f"Thank you for your business. Please find attached tax invoice #{invoice_number} "
        f"for Rs. {amount:,.2f}.\n\n"
        f"The invoice PDF has been attached to this email.\n\n"
        f"Best regards,\nKrishiConnect Team"
    )
    alt.attach(MIMEText(plain_text, "plain", "utf-8"))
    alt.attach(MIMEText(_build_html(invoice_number, amount), "html", "utf-8"))
    msg.attach(alt)

    # Attach PDF if available
    if pdf_bytes:
        filename = f"{invoice_number}.pdf"
        part = MIMEBase("application", "pdf")
        part.set_payload(pdf_bytes)
        encoders.encode_base64(part)
        part.add_header("Content-Disposition", "attachment", filename=filename)
        part.add_header("Content-Type", "application/pdf", name=filename)
        msg.attach(part)
        logger.info("Attached PDF (%d bytes) as %s to email for %s", len(pdf_bytes), filename, email_to)

    def attempt_send(port, use_ssl):
        context = ssl.create_default_context()
        if use_ssl or port == 465:
            with smtplib.SMTP_SSL(mail_server, port, context=context, timeout=7) as server:
                server.login(mail_user, mail_pass)
                server.sendmail(envelope_from, [email_to], msg.as_string())
        else:
            with smtplib.SMTP(mail_server, port, timeout=7) as server:
                server.ehlo()
                server.starttls(context=context)
                server.ehlo()
                server.login(mail_user, mail_pass)
                server.sendmail(envelope_from, [email_to], msg.as_string())

    primary_ssl = (mail_port == 465)
    try:
        attempt_send(mail_port, primary_ssl)
    except Exception as primary_exc:
        # Fallback to alternate port (587 <-> 465)
        fallback_port = 465 if mail_port == 587 else 587
        fallback_ssl = (fallback_port == 465)
        logger.warning(
            "Primary SMTP attempt on port %s failed (%s). Retrying on fallback port %s...",
            mail_port, primary_exc, fallback_port
        )
        try:
            attempt_send(fallback_port, fallback_ssl)
        except smtplib.SMTPAuthenticationError as auth_exc:
            logger.error("Gmail SMTP auth failed for %s: %s", mail_user, auth_exc)
            raise EmailSendError(
                "Gmail rejected the login. Make sure MAIL_PASSWORD is a valid 16-character "
                "App Password from myaccount.google.com/apppasswords."
            ) from auth_exc
        except Exception as fallback_exc:
            logger.error("Gmail SMTP fallback on port %s also failed: %s", fallback_port, fallback_exc)
            raise EmailSendError(f"SMTP send failed: {fallback_exc}") from fallback_exc

    logger.info("Invoice email with PDF sent via Gmail SMTP: invoice=%s to=%s", invoice_number, email_to)


def _send_via_resend(email_to: str, invoice_number: str, amount: float, pdf_bytes: bytes = None) -> None:
    resend_key = os.getenv("RESEND_API_KEY", RESEND_API_KEY)
    if resend_key:
        resend.api_key = resend_key

    from_addr = (
        os.getenv("MAIL_FROM_INVOICE")
        or getattr(settings, "MAIL_FROM_INVOICE", None)
        or "KrishiConnect Invoices <noreply@phantomstack.me>"
    )

    payload = {
        "from": from_addr,
        "to": email_to,
        "subject": f"Tax Invoice #{invoice_number} - KrishiConnect",
        "html": _build_html(invoice_number, amount),
    }
    if pdf_bytes:
        # Resend Python SDK expects attachment content as list of integers for bytes (or base64 string)
        payload["attachments"] = [{
            "filename": f"{invoice_number}.pdf",
            "content": list(pdf_bytes),
        }]
        logger.info("Attached PDF (%d bytes) to Resend payload for invoice %s", len(pdf_bytes), invoice_number)

    try:
        result = resend.Emails.send(payload)
    except Exception as exc:
        err_msg = str(exc).lower()
        if "domain" in err_msg or "verify" in err_msg or "unauthorized" in err_msg or "not verified" in err_msg:
            logger.warning("Custom domain sender '%s' not verified yet on Resend. Falling back to sandbox sender. Reason: %s", from_addr, exc)
            payload["from"] = "KrishiConnect Invoices <onboarding@resend.dev>"
            result = resend.Emails.send(payload)
        else:
            logger.error("Resend send failed for invoice %s -> %s: %s", invoice_number, email_to, exc)
            raise EmailSendError(str(exc)) from exc

    if isinstance(result, dict) and result.get("id"):
        logger.info("Invoice email sent via Resend: invoice=%s to=%s from=%s id=%s", invoice_number, email_to, payload.get("from"), result["id"])
    else:
        logger.warning("Resend returned an unexpected response for invoice %s: %r", invoice_number, result)


def _send_sync(email_to: str, invoice_number: str, amount: float, pdf_bytes: bytes = None) -> None:
    resend_key = os.getenv("RESEND_API_KEY") or getattr(settings, "RESEND_API_KEY", None) or RESEND_API_KEY or DEFAULT_RESEND_KEY
    mail_user = os.getenv("MAIL_USERNAME") or os.getenv("SMTP_USER") or DEFAULT_MAIL_USERNAME
    mail_pass = (os.getenv("MAIL_PASSWORD") or os.getenv("SMTP_PASSWORD") or DEFAULT_MAIL_PASSWORD).replace(" ", "")

    # 1. Prefer Resend for custom domain sender (noreply@phantomstack.me)
    if _is_configured(resend_key):
        try:
            _send_via_resend(email_to, invoice_number, amount, pdf_bytes)
            return
        except Exception as r_exc:
            logger.warning("Resend attempt failed: %s. Trying Gmail SMTP fallback...", r_exc)
            if _is_configured(mail_user) and _is_configured(mail_pass):
                try:
                    _send_via_gmail_smtp(email_to, invoice_number, amount, pdf_bytes)
                    return
                except Exception as s_exc:
                    logger.error("Gmail SMTP fallback also failed: %s", s_exc)
                    raise EmailSendError(f"Email delivery failed (Resend: {r_exc}; SMTP: {s_exc})") from s_exc
            raise EmailSendError(f"Resend send failed: {r_exc}") from r_exc

    # 2. Fallback to Gmail SMTP if Resend is not configured
    if _is_configured(mail_user) and _is_configured(mail_pass):
        _send_via_gmail_smtp(email_to, invoice_number, amount, pdf_bytes)
        return

    raise EmailSendError(
        "Email delivery service temporarily unavailable. Please verify recipient email or download invoice PDF."
    )


async def send_invoice_email(email_to: str, invoice_number: str, amount: float, pdf_bytes: bytes = None) -> None:
    """
    Send an invoice email with attached PDF.
    """
    await asyncio.to_thread(_send_sync, email_to, invoice_number, amount, pdf_bytes)


async def send_invoice_email_background(email_to: str, invoice_number: str, amount: float, pdf_bytes: bytes = None) -> None:
    """
    Safe wrapper for use with FastAPI BackgroundTasks.
    """
    try:
        await send_invoice_email(email_to, invoice_number, amount, pdf_bytes)
    except Exception as exc:
        logger.error("Background invoice email failed for %s (invoice %s): %s", email_to, invoice_number, exc, exc_info=True)


# --- OTP Email Dispatch (otp@phantomstack.me) ---------------------------

def _build_otp_html(otp_code: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your KrishiConnect Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 480px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
          <tr>
            <td style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); height: 6px;"></td>
          </tr>
          <tr>
            <td style="padding: 36px 32px; text-align: center;">
              <div style="font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #0f172a; margin-bottom: 6px;">
                Krishi<span style="color: #059669;">Connect</span>
              </div>
              <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; color: #64748b; margin-bottom: 28px;">
                Secure Identity Verification
              </div>
              <h2 style="font-size: 18px; font-weight: 700; color: #1e293b; margin: 0 0 10px 0;">One-Time Verification Code</h2>
              <p style="font-size: 14px; color: #64748b; line-height: 1.5; margin: 0 0 24px 0;">
                Use the one-time code below to verify your email and complete your sign-in to KrishiConnect.
              </p>
              <div style="background: #f0fdf4; border: 2px dashed #86efac; border-radius: 14px; padding: 18px 24px; margin: 0 auto 24px auto; display: inline-block;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #047857;">
                  {otp_code}
                </span>
              </div>
              <p style="font-size: 12px; color: #94a3b8; margin: 0 0 20px 0;">
                ⏱️ This code will expire in <strong>10 minutes</strong>.<br>
                For your security, never share this code with anyone.
              </p>
              <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; font-size: 11px; color: #94a3b8;">
                If you did not request this verification code, please ignore this email safely.
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
              Sent securely by KrishiConnect Identity &bull; Bhubaneswar, Odisha
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def _send_otp_via_resend(email_to: str, otp_code: str) -> None:
    resend_key = os.getenv("RESEND_API_KEY", RESEND_API_KEY)
    if resend_key:
        resend.api_key = resend_key

    from_addr = (
        os.getenv("MAIL_FROM_OTP")
        or getattr(settings, "MAIL_FROM_OTP", None)
        or "KrishiConnect Security <otp@phantomstack.me>"
    )

    payload = {
        "from": from_addr,
        "to": email_to,
        "subject": f"{otp_code} is your KrishiConnect verification code",
        "html": _build_otp_html(otp_code),
    }

    try:
        result = resend.Emails.send(payload)
    except Exception as exc:
        err_msg = str(exc).lower()
        if "domain" in err_msg or "verify" in err_msg or "unauthorized" in err_msg or "not verified" in err_msg:
            logger.warning("Custom domain sender '%s' not verified yet on Resend. Falling back to sandbox sender for OTP: %s", from_addr, exc)
            payload["from"] = "KrishiConnect Security <onboarding@resend.dev>"
            result = resend.Emails.send(payload)
        else:
            logger.error("Resend send failed for OTP to %s: %s", email_to, exc)
            raise EmailSendError(str(exc)) from exc

    if isinstance(result, dict) and result.get("id"):
        logger.info("OTP email sent via Resend: to=%s from=%s id=%s", email_to, payload.get("from"), result["id"])
    else:
        logger.warning("Resend returned an unexpected response for OTP %s: %r", email_to, result)


def _send_otp_sync(email_to: str, otp_code: str) -> None:
    resend_key = os.getenv("RESEND_API_KEY") or getattr(settings, "RESEND_API_KEY", None) or RESEND_API_KEY or DEFAULT_RESEND_KEY
    if _is_configured(resend_key):
        _send_otp_via_resend(email_to, otp_code)
        return

    raise EmailSendError("Resend email service not configured for OTP dispatch.")


async def send_otp_email(email_to: str, otp_code: str) -> None:
    """Send an OTP email using otp@phantomstack.me."""
    await asyncio.to_thread(_send_otp_sync, email_to, otp_code)


async def send_otp_email_background(email_to: str, otp_code: str) -> None:
    """Background task safe wrapper to send OTP email."""
    try:
        await send_otp_email(email_to, otp_code)
    except Exception as exc:
        logger.error("Background OTP email failed for %s: %s", email_to, exc, exc_info=True)


# --- Support / Contact Inquiries (queries@phantomstack.me) --------------

def _build_inquiry_notification_html(name: str, email: str, phone: str, role: str, subject: str, message: str) -> str:
    return f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; padding: 24px;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 20px; color: white;">
      <h2 style="margin: 0; font-size: 18px;">📬 New KrishiConnect Helpdesk Inquiry</h2>
    </div>
    <div style="padding: 24px; color: #1e293b;">
      <p style="margin-top: 0;"><strong>Sender Name:</strong> {name}</p>
      <p><strong>Role:</strong> {role.capitalize() if role else 'Individual'}</p>
      <p><strong>Email:</strong> {email or 'Not specified'}</p>
      <p><strong>Phone:</strong> {phone or 'Not specified'}</p>
      <p><strong>Subject:</strong> {subject}</p>
      <div style="margin-top: 16px; padding: 16px; background: #f1f5f9; border-radius: 8px; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">{message}</div>
    </div>
    <div style="padding: 12px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
      Delivered to queries@phantomstack.me &bull; KrishiConnect Helpdesk
    </div>
  </div>
</body>
</html>"""


def _build_inquiry_receipt_html(name: str, subject: str) -> str:
    return f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; padding: 24px;">
  <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden;">
    <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); height: 6px;"></div>
    <div style="padding: 28px; text-align: left; color: #1e293b;">
      <div style="font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">
        Krishi<span style="color: #059669;">Connect</span> Support Desk
      </div>
      <h3 style="margin: 12px 0 8px 0; font-size: 16px;">We received your inquiry, {name}!</h3>
      <p style="color: #64748b; font-size: 14px; line-height: 1.5;">
        Thank you for getting in touch regarding <strong>"{subject}"</strong>. Our agriculture support team has received your message and will review it promptly.
      </p>
      <p style="color: #64748b; font-size: 14px; line-height: 1.5;">
        You can also reply directly to this email at <a href="mailto:queries@phantomstack.me" style="color: #059669; font-weight: 600;">queries@phantomstack.me</a> anytime.
      </p>
    </div>
    <div style="padding: 12px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center;">
      KrishiConnect Identity & Support &bull; Bhubaneswar, Odisha
    </div>
  </div>
</body>
</html>"""


def _send_inquiry_sync(name: str, email: str, phone: str, role: str, subject: str, message: str) -> None:
    resend_key = os.getenv("RESEND_API_KEY") or getattr(settings, "RESEND_API_KEY", None) or RESEND_API_KEY or DEFAULT_RESEND_KEY
    if not _is_configured(resend_key):
        logger.warning("Resend not configured, skipping inquiry notification email.")
        return

    resend.api_key = resend_key
    target_inbox = os.getenv("MAIL_QUERIES_EMAIL") or getattr(settings, "MAIL_QUERIES_EMAIL", "queries@phantomstack.me")
    from_addr = "KrishiConnect Helpdesk <queries@phantomstack.me>"

    payload = {
        "from": from_addr,
        "to": target_inbox,
        "subject": f"[Inquiry] {subject} - from {name}",
        "html": _build_inquiry_notification_html(name, email, phone, role, subject, message),
    }
    if email and "@" in email:
        payload["reply_to"] = email

    try:
        resend.Emails.send(payload)
        logger.info("Inquiry notification delivered to %s for %s", target_inbox, name)
    except Exception as exc:
        err_msg = str(exc).lower()
        if "domain" in err_msg or "verify" in err_msg or "unauthorized" in err_msg or "not verified" in err_msg:
            payload["from"] = "KrishiConnect Helpdesk <onboarding@resend.dev>"
            try:
                resend.Emails.send(payload)
            except Exception as fb_exc:
                logger.error("Inquiry notification fallback failed: %s", fb_exc)
        else:
            logger.error("Inquiry notification send failed: %s", exc)

    # Optional confirmation receipt to sender
    if email and "@" in email:
        receipt_payload = {
            "from": from_addr,
            "to": email,
            "subject": f"We received your message: {subject} - KrishiConnect",
            "html": _build_inquiry_receipt_html(name, subject),
        }
        try:
            resend.Emails.send(receipt_payload)
        except Exception:
            try:
                receipt_payload["from"] = "KrishiConnect Support <onboarding@resend.dev>"
                resend.Emails.send(receipt_payload)
            except Exception:
                pass


async def send_inquiry_email_background(name: str, email: str, phone: str, role: str, subject: str, message: str) -> None:
    """Send inquiry email notification in background."""
    try:
        await asyncio.to_thread(_send_inquiry_sync, name, email, phone, role, subject, message)
    except Exception as exc:
        logger.error("Background inquiry dispatch failed: %s", exc)
