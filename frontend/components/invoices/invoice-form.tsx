// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCreateInvoice } from "@/hooks/use-invoices";
import { useCustomers, useCreateCustomer } from "@/hooks/use-customers";
import { useProducts } from "@/hooks/use-products";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Trash2, QrCode, Banknote, Clock, Info, CheckCircle2, UserCheck, Edit3, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { PaymentQR } from "@/components/invoices/payment-qr";

export function InvoiceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { businessProfile } = useAuth();
  const { data: customers } = useCustomers();
  const { data: products } = useProducts();
  const { mutateAsync: createInvoice } = useCreateInvoice();
  const createCustomerMutation = useCreateCustomer();
  const { toast } = useToast();

  // Workflow State
  const [step, setStep] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<string>("upi");
  const [upiPaymentConfirmed, setUpiPaymentConfirmed] = useState(false);

  // Customer State: Direct Name Input by default + Saved Selection
  const [customerMode, setCustomerMode] = useState<"write" | "select">("write");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerId, setCustomerId] = useState("");

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState("");
  const [discount, setDiscount] = useState(0);

  const [items, setItems] = useState([
    { id: Date.now().toString(), product_id: "", description: "", quantity: 1, unit_price: 0, gst_rate: 18 }
  ]);

  // Read URL query parameters to pre-fill bid winning details
  useEffect(() => {
    if (!searchParams) return;
    const buyerParam = searchParams.get("customer") || searchParams.get("buyer");
    const cropParam = searchParams.get("crop") || searchParams.get("product") || searchParams.get("name");
    const priceParam = searchParams.get("price") || searchParams.get("rate");
    const qtyParam = searchParams.get("qty") || searchParams.get("quantity");
    const unitParam = searchParams.get("unit") || "Quintal";

    if (buyerParam) {
      setCustomerName(buyerParam);
      setCustomerMode("write");
    }

    if (cropParam || priceParam || qtyParam) {
      const parsedPrice = priceParam ? parseFloat(priceParam) : 0;
      const parsedQty = qtyParam ? parseFloat(qtyParam) : 1;
      setItems([
        {
          id: Date.now().toString(),
          product_id: "",
          description: cropParam ? `${cropParam} (${unitParam})` : "Agricultural Produce",
          quantity: parsedQty,
          unit_price: parsedPrice,
          gst_rate: 0,
        },
      ]);
    }
  }, [searchParams]);

  const calculateSubtotal = () => items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const calculateGstTotal = () => items.reduce((sum, item) => sum + (item.quantity * item.unit_price * (item.gst_rate / 100)), 0);
  const subtotal = calculateSubtotal();
  const gstTotal = calculateGstTotal();
  const grandTotal = subtotal + gstTotal - discount;

  const addItem = () => setItems([...items, { id: Date.now().toString(), product_id: "", description: "", quantity: 1, unit_price: 0, gst_rate: 18 }]);
  const removeItem = (id: string) => setItems(items.filter(item => item.id !== id));

  const updateItem = (id: string, field: string, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'product_id' && products) {
          const product = products.find(p => p.id === value);
          if (product) {
            updated.description = product.name;
            updated.unit_price = product.price;
            updated.gst_rate = product.gst_rate;
          }
        }
        return updated;
      }
      return item;
    }));
  };

  const handleNextStep = () => {
    const trimmedName = customerName.trim();
    if (!trimmedName && !customerId) {
      return toast({
        title: "Validation Error",
        description: "Please enter customer or buyer name",
        variant: "destructive"
      });
    }
    if (items.length === 0) {
      return toast({
        title: "Validation Error",
        description: "Please add at least one item",
        variant: "destructive"
      });
    }
    if (items.some(item => !item.description || item.unit_price <= 0)) {
      return toast({
        title: "Validation Error",
        description: "Please complete all item details",
        variant: "destructive"
      });
    }
    setStep(2);
  };

  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
    setUpiPaymentConfirmed(false);
    if (method !== "postpaid") {
      setDueDate("");
    }
  };

  const onSubmit = async (e: any) => {
    e.preventDefault();

    if (step === 1) {
      handleNextStep();
      return;
    }

    if (paymentMethod === "postpaid" && !dueDate) {
      return toast({
        title: "Validation Error",
        description: "Please select a due date for unpaid invoices",
        variant: "destructive"
      });
    }

    try {
      // 1. Resolve Customer ID (Find existing or automatically register new customer)
      let resolvedCustomerId = customerId;
      const trimmedName = customerName.trim();

      if (!resolvedCustomerId && trimmedName) {
        const existing = customers?.find(
          c => c.name.toLowerCase() === trimmedName.toLowerCase()
        );
        if (existing) {
          resolvedCustomerId = existing.id;
        } else {
          const newCust = await createCustomerMutation.mutateAsync({
            name: trimmedName,
            phone: customerPhone.trim() || undefined,
          });
          resolvedCustomerId = newCust.id;
        }
      }

      if (!resolvedCustomerId) {
        return toast({
          title: "Validation Error",
          description: "Customer could not be resolved. Please enter a valid customer name.",
          variant: "destructive"
        });
      }

      let finalStatus = "unpaid";
      if (paymentMethod === "cash") finalStatus = "paid";
      if (paymentMethod === "upi") finalStatus = upiPaymentConfirmed ? "paid" : "unpaid";
      if (paymentMethod === "postpaid" || paymentMethod === "later") finalStatus = "unpaid";

      const invoiceData = {
        customer_id: resolvedCustomerId,
        date,
        due_date: (paymentMethod === "postpaid" || paymentMethod === "later") ? dueDate : date,
        items: items.map(({ id, ...rest }) => rest),
        discount_type: discount > 0 ? "fixed" : null,
        discount_value: discount > 0 ? discount : null,
        payment_method: paymentMethod,
        status: finalStatus
      };

      const created = await createInvoice(invoiceData);
      toast({ title: "Success", description: "Invoice created successfully" });
      router.push('/invoices');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.detail || error.message || "Failed to create invoice",
        variant: "destructive"
      });
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8 max-w-5xl mx-auto">
      {/* Progress Tracker */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <div className={`flex items-center gap-3 ${step >= 1 ? 'opacity-100' : 'opacity-40'}`}>
          <span className={`w-8 h-8 flex items-center justify-center rounded-xl text-sm font-bold ${step === 1 ? 'btn-liquid-glass-primary shadow-[0_0_12px_rgba(20,122,77,0.4)]' : 'btn-liquid-glass text-muted-foreground'}`}>1</span>
          <span className="text-base font-bold text-foreground">Invoice Details</span>
        </div>
        <div className="flex-1 h-px bg-white/10 mx-6"></div>
        <div className={`flex items-center gap-3 ${step >= 2 ? 'opacity-100' : 'opacity-40'}`}>
          <span className={`w-8 h-8 flex items-center justify-center rounded-xl text-sm font-bold ${step === 2 ? 'btn-liquid-glass-primary shadow-[0_0_12px_rgba(20,122,77,0.4)]' : 'btn-liquid-glass text-muted-foreground'}`}>2</span>
          <span className="text-base font-bold text-foreground">Payment Method</span>
        </div>
      </div>

      {/* STEP 1: INVOICE DETAILS */}
      {step === 1 && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Customer / Buyer Name Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="customer-name" className="text-sm font-semibold">Customer / Buyer Name</Label>
                {customers && customers.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const nextMode = customerMode === "write" ? "select" : "write";
                      setCustomerMode(nextMode);
                    }}
                    className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
                  >
                    {customerMode === "write" ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Choose from saved buyers</span>
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Type customer name</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {customerMode === "write" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input
                    id="customer-name"
                    placeholder="Enter customer or buyer name..."
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      const match = customers?.find(
                        c => c.name.toLowerCase() === e.target.value.toLowerCase().trim()
                      );
                      if (match) {
                        setCustomerId(match.id);
                        if (!customerPhone && match.phone) setCustomerPhone(match.phone);
                      } else {
                        setCustomerId("");
                      }
                    }}
                    required
                    className="bg-card"
                  />
                  <Input
                    type="tel"
                    placeholder="Mobile number (optional)"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="bg-card font-mono text-sm"
                  />
                </div>
              ) : (
                <Select
                  value={customerId}
                  onValueChange={(val) => {
                    setCustomerId(val);
                    const selected = customers?.find(c => c.id === val);
                    if (selected) {
                      setCustomerName(selected.name);
                      setCustomerPhone(selected.phone || "");
                    }
                  }}
                >
                  <SelectTrigger className="bg-card">
                    <SelectValue placeholder="Select saved customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers?.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} {c.phone ? `(${c.phone})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoice-date" className="text-sm font-semibold">Invoice Date</Label>
              <Input
                id="invoice-date"
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="bg-card"
              />
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-24">Qty</TableHead>
                  <TableHead className="w-32">Price</TableHead>
                  <TableHead className="w-24">GST %</TableHead>
                  <TableHead className="w-32">Amount</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Select value={item.product_id || ""} onValueChange={(v) => updateItem(item.id, "product_id", v)}>
                        <SelectTrigger><SelectValue placeholder="Custom Item" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Custom Item</SelectItem>
                          {products?.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell><Input value={item.description} onChange={e => updateItem(item.id, "description", e.target.value)} placeholder="Description" required /></TableCell>
                    <TableCell><Input type="number" min="1" value={item.quantity} onChange={e => updateItem(item.id, "quantity", Number(e.target.value))} required /></TableCell>
                    <TableCell><Input type="number" min="0" value={item.unit_price} onChange={e => updateItem(item.id, "unit_price", Number(e.target.value))} required /></TableCell>
                    <TableCell><Input type="number" min="0" max="100" value={item.gst_rate} onChange={e => updateItem(item.id, "gst_rate", Number(e.target.value))} required /></TableCell>
                    <TableCell>{formatCurrency(item.quantity * item.unit_price)}</TableCell>
                    <TableCell>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="p-4 bg-muted/30 border-t">
              <Button type="button" variant="outline" onClick={addItem}><Plus className="mr-2 h-4 w-4" /> Add Item</Button>
            </div>
          </div>

          <div className="flex justify-end">
            <div className="w-full md:w-1/3 space-y-3">
              <div className="flex justify-between"><span>Subtotal:</span> <span>{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between"><span>GST:</span> <span>{formatCurrency(gstTotal)}</span></div>
              <div className="flex justify-between items-center">
                <span>Discount:</span>
                <Input type="number" className="w-32 text-right" value={discount} onChange={e => setDiscount(Number(e.target.value))} />
              </div>
              <div className="flex justify-between font-bold text-lg pt-3 border-t"><span>Total:</span> <span>{formatCurrency(grandTotal)}</span></div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="button" onClick={handleNextStep}>Proceed to Payment</Button>
          </div>
        </div>
      )}

      {/* STEP 2: PAYMENT OPTIONS */}
      {step === 2 && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => handlePaymentMethodChange("cash")}
              className={`liquid-glass flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-200 cursor-pointer ${paymentMethod === 'cash' ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-[1.02]' : 'border-white/10 text-muted-foreground hover:border-emerald-500/50 hover:text-foreground'}`}
            >
              <Banknote className="w-8 h-8 mb-2 text-emerald-400" />
              <span className="font-semibold text-base">Cash</span>
              <span className="text-[11px] font-normal text-muted-foreground mt-0.5">Paid in Hand</span>
            </button>

            <button
              type="button"
              onClick={() => handlePaymentMethodChange("upi")}
              className={`liquid-glass flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-200 cursor-pointer ${paymentMethod === 'upi' ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-[1.02]' : 'border-white/10 text-muted-foreground hover:border-emerald-500/50 hover:text-foreground'}`}
            >
              <QrCode className="w-8 h-8 mb-2 text-emerald-400" />
              <span className="font-semibold text-base">UPI</span>
              <span className="text-[11px] font-normal text-muted-foreground mt-0.5">GPay / PhonePe / QR</span>
            </button>

            <button
              type="button"
              onClick={() => handlePaymentMethodChange("postpaid")}
              className={`liquid-glass flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-200 cursor-pointer ${paymentMethod === 'postpaid' ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-bold shadow-[0_0_20px_rgba(245,158,11,0.3)] scale-[1.02]' : 'border-white/10 text-muted-foreground hover:border-amber-500/50 hover:text-foreground'}`}
            >
              <Clock className="w-8 h-8 mb-2 text-amber-400" />
              <span className="font-semibold text-base">Pay Later</span>
              <span className="text-[11px] font-normal text-muted-foreground mt-0.5">Pay after delivery / Ledger</span>
            </button>
          </div>

          {paymentMethod === 'upi' && (
            <div className="liquid-glass p-6 rounded-3xl border border-white/15 bg-black/40 backdrop-blur-2xl flex flex-col items-center justify-center gap-4 shadow-xl">
              <PaymentQR
                amount={grandTotal}
                invoiceNumber="DRAFT"
                onPaymentSuccess={() => setUpiPaymentConfirmed(true)}
              />

              {!upiPaymentConfirmed ? (
                <div className="w-full pt-4 border-t border-white/10 flex flex-col items-center gap-3">
                  <p className="text-xs text-muted-foreground text-center">
                    Invoice will stay <strong className="text-amber-400">Unpaid</strong> until you confirm payment has been received.
                  </p>
                  <button
                    type="button"
                    onClick={() => setUpiPaymentConfirmed(true)}
                    className="btn-liquid-glass-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-[0_0_15px_rgba(20,122,77,0.4)]"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Payment Received</span>
                  </button>
                </div>
              ) : (
                <div className="w-full pt-4 border-t border-white/10 flex items-center justify-center gap-2 text-emerald-400 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Payment confirmed: invoice will be stamped as Paid</span>
                </div>
              )}
            </div>
          )}

          {paymentMethod === 'postpaid' && (
            <div className="space-y-4">
              <div className="liquid-glass p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-amber-300 text-xs">
                <Info className="w-5 h-5 mt-0.5 text-amber-400 shrink-0" />
                <p className="leading-relaxed">
                  This invoice will be marked as <strong className="font-bold underline text-white">Unpaid</strong> and added to your Receivables ledger balance. You can log the payment whenever received.
                </p>
              </div>
              <div className="space-y-1.5 max-w-xs">
                <Label className="text-xs font-semibold text-muted-foreground">Due Date</Label>
                <Input type="date" required value={dueDate} onChange={e => setDueDate(e.target.value)} className="bg-black/40 border border-white/15 rounded-xl" />
              </div>
            </div>
          )}

          {paymentMethod === 'cash' && (
            <div className="liquid-glass p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3 text-emerald-300 text-xs">
              <CheckCircle2 className="w-5 h-5 mt-0.5 text-emerald-400 shrink-0" />
              <p className="leading-relaxed">
                Funds assumed received in hand. Invoice will be securely stamped as <strong className="font-bold text-white">Paid</strong> in your customer ledger.
              </p>
            </div>
          )}

          <div className="flex justify-between items-center pt-6 border-t border-white/10 mt-8">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="btn-liquid-glass px-4 py-2.5 rounded-xl text-xs font-semibold text-foreground hover:text-white transition-all"
            >
              Back to Details
            </button>
            <button
              type="submit"
              className="btn-liquid-glass-primary px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-[0_0_20px_rgba(20,122,77,0.4)] transition-all cursor-pointer"
            >
              {paymentMethod === 'postpaid'
                ? 'Save as Pay Later (Unpaid)'
                : paymentMethod === 'upi'
                  ? (upiPaymentConfirmed ? 'Complete & Mark as Paid (UPI)' : 'Save as Unpaid (UPI)')
                  : 'Complete & Mark as Paid (Cash)'}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
