import { Link } from "wouter";
import { ArrowUpRight, Check, Download } from "lucide-react";

export default function OrderConfirmation({ params }: { params: { orderId: string } }) {
  return (
    <main className="utility-page" style={{ padding: '80px 0', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', background: 'var(--brand)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 30px' }}>
          <Check size={40} />
        </div>
        
        <span className="eyebrow">ORDER COMPLETE</span>
        <h1 style={{ fontSize: '36px', marginTop: '10px', marginBottom: '20px' }}>Thank you for your purchase!</h1>
        <p style={{ fontSize: '18px', color: 'var(--ink-light)', marginBottom: '40px' }}>
          Order Number: <strong>#{params.orderId}</strong>
        </p>

        <div style={{ background: 'var(--stone)', padding: '40px', borderRadius: '12px', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>Your digital product is ready.</h2>
          <p style={{ marginBottom: '30px', color: 'var(--ink-light)' }}>
            We've also sent a confirmation email with your download link so you can access it anytime.
          </p>
          
          <Link href="/account" className="button button-primary" style={{ padding: '16px 32px', fontSize: '16px', width: '100%' }}>
            <Download size={20} style={{ marginRight: '8px' }} /> Access Your Downloads
          </Link>
        </div>

        <Link href="/shop" className="text-link">
          Continue shopping <ArrowUpRight size={16} />
        </Link>
      </div>
    </main>
  );
}
