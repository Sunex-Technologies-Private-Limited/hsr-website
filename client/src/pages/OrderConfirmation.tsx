import { Link } from "wouter";
import { ArrowUpRight, Check, Download, AlertCircle } from "lucide-react";
import { trpc } from "../lib/trpc";

export default function OrderConfirmation({ params }: { params: { orderId: string } }) {
  const orderId = Number(params.orderId);
  
  const { data: order, isLoading, error } = trpc.orders.getById.useQuery(
    { orderId },
    { enabled: !isNaN(orderId), retry: false }
  );

  if (isLoading) {
    return (
      <main className="utility-page" style={{ padding: '80px 0', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2>Loading order details...</h2>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="utility-page" style={{ padding: '80px 0', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', background: 'var(--red)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 30px' }}>
            <AlertCircle size={40} />
          </div>
          <h2>Order not found</h2>
          <p>We couldn't find details for order #{params.orderId}.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="utility-page" style={{ padding: '80px 0', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', background: 'var(--brand)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 30px' }}>
          <Check size={40} />
        </div>
        
        <span className="eyebrow">ORDER COMPLETE</span>
        <h1 style={{ fontSize: '36px', marginTop: '10px', marginBottom: '20px' }}>Thank you for your purchase!</h1>
        <p style={{ fontSize: '18px', color: 'var(--ink-light)', marginBottom: '40px' }}>
          Order Number: <strong>{order.orderNumber}</strong>
        </p>

        <div style={{ background: 'var(--stone)', padding: '40px', borderRadius: '12px', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>Your digital product is ready.</h2>
          <p style={{ marginBottom: '30px', color: 'var(--ink-light)' }}>
            We've also sent a confirmation email to <strong>{order.customerEmail}</strong> with your download link so you can access it anytime.
          </p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginBottom: "30px" }}>
            {order.items.map((item) => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px", background: "white", borderRadius: "8px" }}>
                <span style={{ fontWeight: 500 }}>{item.productName}</span>
                <a href={item.downloadPath || `/api/downloads/${item.productSlug}`} className="button button-primary" style={{ padding: '8px 16px', fontSize: '14px' }}>
                  <Download size={16} style={{ marginRight: '8px' }} /> Download
                </a>
              </div>
            ))}
          </div>

        </div>

        <Link href="/shop" className="text-link">
          Continue shopping <ArrowUpRight size={16} />
        </Link>
      </div>
    </main>
  );
}
