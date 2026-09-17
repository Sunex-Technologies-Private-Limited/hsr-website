import { AlertCircle, ArrowUpRight } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <main className="utility-page">
      <div className="container utility-inner" style={{ textAlign: 'center' }}>
        <span className="utility-icon" style={{ margin: '0 auto' }}><AlertCircle size={24} /></span>
        <span className="eyebrow">404 ERROR</span>
        <h1>Oops! This Page Took a<br /><em>Digital Detour.</em></h1>
        <p>The page you're looking for doesn't exist or may have moved.</p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '20px' }}>
          <Link href="/" className="button button-outline">Go Home</Link>
          <Link href="/shop" className="button button-primary">Explore Products <ArrowUpRight size={17} /></Link>
        </div>
      </div>
    </main>
  );
}
