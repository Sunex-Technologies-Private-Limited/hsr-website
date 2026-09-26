import { useEffect, useState } from "react";
import { useCart } from "../components/Storefront";
import { formatPrice } from "../lib/store";
import { trpc } from "../lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";

export default function Checkout() {
  const { items, clear } = useCart();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");

  useEffect(() => {
    if (items.length === 0) {
      setLocation("/shop");
    }
  }, [items.length, setLocation]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const verifyPayment = trpc.orders.verifyPayment.useMutation();
  const createOrder = trpc.orders.create.useMutation({
    onSuccess: async (data) => {
      const res = await loadRazorpayScript();
      if (!res) {
        toast.error("Razorpay SDK failed to load. Are you online?");
        setIsProcessing(false);
        return;
      }

      const options = {
        key: data.razorpayKeyId,
        amount: data.totalAmount,
        currency: data.currency,
        name: "HSR Digital Hub",
        description: "Secure Purchase",
        order_id: data.razorpayOrderId,
        handler: async function (response: any) {
          try {
            await verifyPayment.mutateAsync({
              orderId: data.orderId!,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });
            clear();
            setLocation(`/order-confirmation/${data.accessToken}`);
          } catch (err: any) {
            toast.error("Payment verification failed", { description: err.message });
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: (document.querySelector('input[name="mobile"]') as HTMLInputElement)?.value || "9999999999"
        },
        theme: {
          color: "#0d2142"
        }
      };

      const rzp1 = new (window as any).Razorpay(options);
      rzp1.on('payment.failed', function (response: any){
        toast.error("Payment failed", { description: response.error.description });
        setIsProcessing(false);
      });
      rzp1.open();
    },
    onError: (err) => {
      toast.error("Error creating order", { description: err.message });
      setIsProcessing(false);
    }
  });

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);
    const data = new FormData(e.currentTarget);
    createOrder.mutate({
      name: String(data.get("name")),
      email: String(data.get("email")),
      phone: String(data.get("mobile")),
      country: String(data.get("country") || "India"),
      gstin: String(data.get("gstin") || ""),
      items: items.map(item => ({ slug: item.slug, quantity: 1 }))
    });
  };

  const total = items.reduce((sum, item) => sum + item.price, 0);

  if (items.length === 0) return null;

  return (
    <main className="utility-page" style={{ padding: "80px 20px", minHeight: "80vh" }}>
      <div className="container" style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem" }}>
          <span className="eyebrow">SECURE CHECKOUT</span>
          <h1 style={{ fontSize: "2.5rem", marginTop: "10px" }}>Complete your order</h1>
        </div>
        
        <div className="checkout-grid">
          
          <div style={{ background: "var(--stone)", padding: "30px", borderRadius: "12px" }}>
            <h2 style={{ marginBottom: "1.5rem", fontSize: "1.2rem" }}>Billing Details</h2>
            <form id="checkout-form" onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: 500 }}>Full Name</label>
                <input name="name" defaultValue={user?.name || ""} required style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.1)" }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: 500 }}>Email Address (For Delivery)</label>
                <input name="email" type="email" defaultValue={user?.email || ""} required style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.1)" }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: 500 }}>Mobile Number</label>
                <input name="mobile" type="tel" required style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.1)" }} />
              </div>
              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: 500 }}>Country</label>
                  <select name="country" required defaultValue="India" style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.1)", background: "white" }}>
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Australia">Australia</option>
                    <option value="Canada">Canada</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: 500 }}>GSTIN (Optional)</label>
                  <input name="gstin" placeholder="For B2B invoice" style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.1)" }} />
                </div>
              </div>

              <div style={{ marginTop: "1rem" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "10px" }}>Payment Method</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "8px", cursor: "pointer", background: paymentMethod === "card" ? "white" : "transparent" }}>
                    <input type="radio" name="payment" value="card" checked={paymentMethod === "card"} onChange={(e) => setPaymentMethod(e.target.value)} /> 
                    Debit / Credit Card
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "8px", cursor: "pointer", background: paymentMethod === "upi" ? "white" : "transparent" }}>
                    <input type="radio" name="payment" value="upi" checked={paymentMethod === "upi"} onChange={(e) => setPaymentMethod(e.target.value)} /> 
                    UPI / QR
                  </label>
                </div>
              </div>
            </form>
          </div>

          <div style={{ border: "1px solid var(--stone)", padding: "30px", borderRadius: "12px", background: "white" }}>
            <h2 style={{ marginBottom: "1.5rem", fontSize: "1.2rem" }}>Order Summary</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
              {items.map(item => (
                <div key={item.slug} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "14px" }}>{item.name}</span>
                  <strong style={{ fontSize: "14px" }}>{formatPrice(item.price)}</strong>
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid rgba(0,0,0,0.1)", paddingTop: "1.5rem", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Total</span>
              <strong style={{ fontSize: "1.2rem" }}>{formatPrice(total)}</strong>
            </div>
            <button form="checkout-form" className="button button-primary button-full" type="submit" disabled={isProcessing} style={{ padding: "16px" }}>
              {isProcessing ? "Processing..." : `Pay Securely`}
            </button>
            <p style={{ fontSize: "12px", color: "var(--ink-light)", textAlign: "center", marginTop: "1rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              Payments processed securely by Razorpay
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}
