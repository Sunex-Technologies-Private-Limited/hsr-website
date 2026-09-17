import { Link } from "wouter";
import { ArrowRight, ArrowUpRight, Check, ChevronDown, Download, FileText, Heart, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { formatPrice, getCoverClass, getProductCoverStyle } from "@/lib/store";
import { useCart, useFavorites, CoverIcon, ProductCard } from "@/components/Storefront";
import { trpc } from "@/lib/trpc";

export default function Product({ params }: { params: { slug: string } }) {
  const { data: product, isLoading } = trpc.catalog.bySlug.useQuery({ slug: params.slug });
  const { data: allProducts = [] } = trpc.catalog.list.useQuery();
  const { data: reviews = [] } = trpc.reviews.list.useQuery({ slug: params.slug }, { enabled: !!product });
  const { add, buyNow } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  if (isLoading) return <div className="container not-found"><h2>Loading...</h2></div>;
  if (!product) return <div className="container not-found"><h2>Product not found.</h2><Link href="/shop" className="text-link">Back to shop <ArrowUpRight size={15} /></Link></div>;
  
  const saved = isFavorite(product.slug);
  const related = allProducts.filter((p) => p.category === product.category && p.slug !== product.slug).slice(0, 3);
  let includedItems: string[] = [];
  try {
    includedItems = JSON.parse(product.included as string);
  } catch (e) {
    includedItems = [];
  }

  return <main className="product-page"><div className="container product-breadcrumb"><Link href="/shop">Shop</Link><ArrowRight size={14} /><span>{product.category}</span><ArrowRight size={14} /><strong>{product.name}</strong></div><section className="container product-hero"><div className={`product-detail-visual ${getCoverClass(product.accent)} ${product.imagePath ? 'has-image' : ''}`} style={getProductCoverStyle(product as any)}>{!product.imagePath && <span className="cover-pattern" />}{!product.imagePath && <span className="cover-index"><CoverIcon type={product.type} /></span>}<span className="cover-label">{product.coverLabel}</span><span className="cover-type">{product.type} / HSR</span>{product.imagePath && <span className="image-shade" />}<span className="product-badge">{product.badge}</span><span className="detail-visual-note"><FileText size={15} /> {product.format}</span></div><div className="product-detail-copy"><span className="eyebrow">{product.category} / {product.type}</span><h1>{product.name}</h1><p className="detail-lede">{product.description}</p><div className="detail-price"><strong>{formatPrice(product.price)}</strong>{product.compareAt && <span>{formatPrice(product.compareAt)}</span>}{product.compareAt && <em>Save {Math.round((1 - product.price / product.compareAt) * 100)}%</em>}</div><div className="detail-actions"><button className="button button-primary" onClick={() => add(product as any)}>Add to bag <ArrowUpRight size={17} /></button><button className={`save-button ${saved ? "saved" : ""}`} onClick={() => toggleFavorite(product as any)} aria-label={saved ? "Remove from wishlist" : "Save product for later"}><Heart size={18} fill={saved ? "currentColor" : "none"} /> {saved ? "Saved" : "Save for later"}</button></div><div className="detail-promises"><span><Download size={17} /><b>Instant access</b><small>Download right after purchase</small></span><span><ShieldCheck size={17} /><b>Digital product</b><small>No shipping or waiting</small></span><span><Sparkles size={17} /><b>Made to use</b><small>Simple, practical, clear</small></span></div></div></section><section className="container product-info-grid"><div className="product-info-main"><div className="detail-section"><span className="eyebrow">KEY BENEFITS</span><h2>Why this product<br /><em>works for you.</em></h2><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Check size={18} color="var(--brand)" /> <span>Easy to use</span></div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Check size={18} color="var(--brand)" /> <span>Ready to use</span></div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Check size={18} color="var(--brand)" /> <span>Saves time</span></div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Check size={18} color="var(--brand)" /> <span>Practical</span></div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Check size={18} color="var(--brand)" /> <span>Affordable</span></div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Check size={18} color="var(--brand)" /> <span>Instant digital access</span></div>
  </div></div><div className="detail-section"><span className="eyebrow">WHAT’S INCLUDED?</span><h2>Built to be useful<br /><em>from the first page.</em></h2><p>This is a practical resource, not a pile of information. Use it as a starting point, a weekly companion or a simple system you can return to whenever you need a little more clarity.</p><div className="included-grid">{includedItems.map((item, index) => <div key={item}><span>0{index + 1}</span><p>{item}</p><Check size={15} /></div>)}</div></div><div className="detail-section"><span className="eyebrow">WHO IS THIS FOR?</span><h2>A good fit if you’re<br /><em>ready to make progress.</em></h2><p>{product.forWho}</p></div></div><aside className="product-info-aside"><div className="aside-card"><span className="eyebrow">PRODUCT DETAILS</span><div><span>Format</span><strong>{product.format}</strong></div><div><span>Access</span><strong>Instant digital download</strong></div><div><span>Category</span><strong>{product.category}</strong></div><div><span>License</span><strong>For personal use</strong></div><div className="aside-divider" /><p><Check size={15} /> Clear product information before you buy.</p></div></aside></section><section className="container faq-section"><div className="faq-intro"><span className="eyebrow">PRODUCT FAQS</span><h2>Good questions<br /><em>deserve clear answers.</em></h2></div><div className="faq-list">{["How do I get my product?", "Can I use it on my phone or tablet?", "What if I need help?"].map((question, index) => <div className={`faq-item ${openFaq === index ? "open" : ""}`} key={question}><button onClick={() => setOpenFaq(openFaq === index ? null : index)}><span>0{index + 1}</span><strong>{question}</strong><ChevronDown size={18} /></button>{openFaq === index && <p>{index === 0 ? "After purchase, you’ll receive access to your digital product instantly on the confirmation page and via email." : index === 1 ? "Yes. Product formats are shown above so you can choose what works best for your setup." : "Reach out through our support page and we’ll help you resolve any issues."}</p>}</div>)}</div></section>
<section className="container reviews-section" style={{ marginTop: '60px', borderTop: '1px solid rgba(23,41,73,.1)', paddingTop: '60px' }}>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' }}>
    <div>
      <span className="eyebrow">CUSTOMER REVIEWS</span>
      <h2 style={{ fontSize: '28px', fontFamily: '"Fraunces", Georgia, serif' }}>What others are saying.</h2>
    </div>
  </div>
  {reviews.length > 0 ? (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
      {reviews.map((review: any) => (
        <div key={review.id} style={{ background: 'var(--white)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(23,41,73,.1)' }}>
          <div style={{ display: 'flex', gap: '5px', color: 'var(--brand)', marginBottom: '10px' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} style={{ opacity: i < review.rating ? 1 : 0.3 }}>★</span>
            ))}
          </div>
          <h4 style={{ fontWeight: 600, fontSize: '16px', marginBottom: '10px' }}>{review.title}</h4>
          <p style={{ fontSize: '14px', lineHeight: 1.6, opacity: 0.8, marginBottom: '15px' }}>"{review.body}"</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', opacity: 0.6 }}>
            <strong>{review.reviewerName}</strong>
            {review.verifiedPurchase === 1 && <span>• Verified Buyer</span>}
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div style={{ padding: '40px', background: 'var(--stone)', borderRadius: '12px', textAlign: 'center' }}>
      <p style={{ opacity: 0.7 }}>No reviews yet. Be the first to review this product!</p>
    </div>
  )}
</section>
<section className="section related-section"><div className="container"><div className="related-head"><div><span className="eyebrow">KEEP EXPLORING</span><h2>More useful things.</h2></div><Link href="/shop" className="text-link">View all products <ArrowUpRight size={16} /></Link></div><div className="product-grid product-grid-three">{related.map((item) => <ProductCard product={item as any} compact key={item.slug} />)}</div></div></section></main>;
}
