import { Link, useLocation } from "wouter";
import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { ArrowUpRight, Calendar, Check, ChevronDown, Download, Heart, LogIn, Menu, Minus, Package, Plus, Search, ShoppingBag, Sparkles, Wrench, X, Facebook, Instagram } from "lucide-react";
import { toast } from "sonner";
import { Product, formatPrice, getCoverClass, getProductCoverStyle } from "@/lib/store";
import { trpc } from "@/lib/trpc";

export function CoverIcon({ type }: { type: string }) {
  if (type === "Planner") return <Calendar size={20} strokeWidth={1.5} />;
  if (type === "Toolkit") return <Wrench size={20} strokeWidth={1.5} />;
  if (type === "Bundle") return <Package size={20} strokeWidth={1.5} />;
  return <ArrowUpRight size={20} strokeWidth={1.5} />;
}

type CartContextValue = {
  items: Product[];
  count: number;
  open: boolean;
  add: (product: Product) => void;
  remove: (slug: string) => void;
  setOpen: (open: boolean) => void;
  clear: () => void;
  buyNow: (product: Product) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used within a CartProvider");
  return value;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const count = useMemo(() => items.length, [items]);

  const add = (product: Product) => {
    setItems((prev) => {
      if (prev.find((p) => p.slug === product.slug)) return prev;
      return [...prev, product];
    });
    setOpen(true);
  };

  const remove = (slug: string) => {
    setItems((prev) => prev.filter((p) => p.slug !== slug));
  };

  const clear = () => setItems([]);

  const buyNow = (product: Product) => {
    setItems([product]);
    setOpen(true);
    // We emit a custom event to tell the drawer to switch to checkout state
    window.dispatchEvent(new CustomEvent('hsr:checkout'));
  };

  return (
    <CartContext.Provider value={{ items, count, open, add, remove, setOpen, clear, buyNow }}>
      {children}
    </CartContext.Provider>
  );
}

type FavoritesContextValue = {
  favorites: Product[];
  toggleFavorite: (product: Product) => void;
  isFavorite: (slug: string) => boolean;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function useFavorites() {
  const value = useContext(FavoritesContext);
  if (!value) throw new Error("useFavorites must be used within a FavoritesProvider");
  return value;
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Product[]>([]);

  const toggleFavorite = (product: Product) => {
    setFavorites((prev) => {
      if (prev.some((p) => p.slug === product.slug)) {
        return prev.filter((p) => p.slug !== product.slug);
      }
      return [...prev, product];
    });
  };

  const isFavorite = (slug: string) => {
    return favorites.some((p) => p.slug === slug);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function BrandMark({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link href="/" className={`brand-mark ${inverse ? "brand-mark-inverse" : ""}`} aria-label="HSR Digital Hub home">
      <span className="brand-mark-symbol">h</span>
      <span className="brand-mark-word">hsr<span>digital hub</span></span>
    </Link>
  );
}

export function SiteHeader() {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { count, setOpen } = useCart();
  const isShop = location === "/shop" || location.startsWith("/product");
  const go = (href: string) => {
    setMenuOpen(false);
    window.setTimeout(() => (window.location.href = href), 0);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div className="announcement-bar">
        <span>SMART PRODUCTS. REAL VALUE. BETTER YOU.</span>
        <span className="announcement-center">Digital products from ₹9</span>
        <span className="announcement-link">Instant access <ArrowUpRight size={13} /></span>
      </div>
      <header className={`site-header ${location === "/" && !scrolled ? "site-header-home" : ""} ${scrolled ? "scrolled" : ""}`}>
        <div className="container header-inner">
          <BrandMark inverse={location === "/" && !scrolled} />
          <nav className={`main-nav ${menuOpen ? "main-nav-open" : ""}`} aria-label="Primary navigation">
            <Link href="/" className={location === "/" ? "active" : ""} onClick={() => setMenuOpen(false)}>HOME</Link>
            <Link href="/categories" className={location === "/categories" ? "active" : ""} onClick={() => setMenuOpen(false)}>CATEGORIES</Link>
            <Link href="/about" className={location === "/about" ? "active" : ""} onClick={() => setMenuOpen(false)}>ABOUT US</Link>
            <Link href="/faq" className={location === "/faq" ? "active" : ""} onClick={() => setMenuOpen(false)}>FAQ</Link>
            <Link href="/contact" className={location === "/contact" ? "active" : ""} onClick={() => setMenuOpen(false)}>CONTACT</Link>
          </nav>
          <div className="header-actions">
            <Link href="/shop" className="button button-primary" style={{ padding: '8px 16px', fontSize: '12px' }}>EXPLORE PRODUCTS</Link>
            <button className="icon-button search-button" aria-label="Search" onClick={() => setSearchOpen((value) => !value)}><Search size={18} /></button>
            <Link href="/favorites" className="icon-button account-button" aria-label="Favorites"><Heart size={17} /></Link>
            <Link href="/login" className="icon-button account-button" aria-label="Login"><LogIn size={17} /></Link>
            <button className="cart-button" aria-label={`Open bag with ${count} items`} onClick={() => setOpen(true)}><ShoppingBag size={17} /><span className="cart-label">Bag</span>{count > 0 && <b>{count}</b>}</button>
            <button className="menu-button icon-button" aria-label="Toggle navigation" onClick={() => setMenuOpen((value) => !value)}>{menuOpen ? <X size={21} /> : <Menu size={21} />}</button>
          </div>
        </div>
        {searchOpen && (
          <div className="search-panel">
            <div className="container search-panel-inner">
              <Search size={20} />
              <input autoFocus placeholder="Search planners, templates, toolkits…" onKeyDown={(event) => event.key === "Enter" && go(`/shop?search=${encodeURIComponent(event.currentTarget.value)}`)} />
              <span>Press Enter</span>
              <button aria-label="Close search" onClick={() => setSearchOpen(false)}><X size={18} /></button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

export function SiteFooter() {
  const subscribe = trpc.newsletter.subscribe.useMutation({ onSuccess: () => toast.success("You’re on the list", { description: "Watch your inbox for something useful." }), onError: () => toast.error("Please try again", { description: "We couldn’t save your email right now." }) });
  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <div className="footer-brand"><BrandMark inverse /><p>Practical digital solutions for learning, productivity, career, business and everyday life.</p><div className="footer-socials"><a href="https://www.facebook.com/profile.php?id=61590198495302" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Facebook size={14} /></a><a href="https://www.instagram.com/hsrdigitalhub/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram size={14} /></a></div></div>
        <div className="footer-column"><h3>SHOP</h3><Link href="/shop">All Products</Link><Link href="/best-sellers">Best Sellers</Link><Link href="/new-arrivals">New Arrivals</Link><Link href="/bundles">Bundles</Link><Link href="/free-resources">Free Resources</Link></div>
        <div className="footer-column"><h3>CATEGORIES</h3><Link href="/shop?category=Education%20%26%20Learning">Education</Link><Link href="/shop?category=AI%20%26%20Technology">AI & Technology</Link><Link href="/shop?category=Business">Business</Link><Link href="/shop?category=Productivity">Productivity</Link><Link href="/shop?category=Career%20%26%20Jobs">Career</Link><Link href="/shop?category=Lifestyle">Lifestyle</Link></div>
        <div className="footer-column"><h3>COMPANY</h3><Link href="/about">About Us</Link><Link href="/blog">Blog</Link><Link href="/contact">Contact</Link><Link href="/faq">FAQ</Link><Link href="/support">Support</Link></div>
        <div className="footer-column"><h3>LEGAL</h3><Link href="/privacy-policy">Privacy Policy</Link><Link href="/terms-and-conditions">Terms & Conditions</Link><Link href="/refund-policy">Refund Policy</Link><Link href="/license">License Policy</Link></div>
      </div>
      <div className="container footer-bottom"><span>© 2025 HSR Digital Hub</span><span>Smart Products. Real Value. Better You.</span><span className="footer-legal"></span></div>
    </footer>
  );
}

export function SectionHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: React.ReactNode }) {
  return <div className="section-heading"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div>{description && <p>{description}</p>}{action}</div>;
}

export function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { add } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const liked = isFavorite(product.slug);

  return (
    <article className={`product-card ${compact ? "product-card-compact" : ""}`}>
      <Link href={`/product/${product.slug}`} className={`product-visual ${getCoverClass(product.accent)} ${product.imagePath ? 'has-image' : ''}`} style={getProductCoverStyle(product as any)}>
        {!product.imagePath && <span className="cover-pattern" />}
        {!product.imagePath && <span className="cover-index"><CoverIcon type={product.type} /></span>}
        <span className="cover-label">{product.coverLabel}</span>
        <span className="cover-type">{product.type} / HSR</span>
        {product.imagePath && <span className="image-shade" />}
        {product.badge && <span className="product-badge">{product.badge}</span>}
        <button 
          className={`wishlist-button ${liked ? "liked" : ""}`} 
          aria-label={liked ? "Remove from wishlist" : "Add to wishlist"} 
          onClick={(event) => { event.preventDefault(); toggleFavorite(product); }}
        >
          {liked ? <Check size={15} /> : <Heart size={15} />}
        </button>
        <span className="quick-view">View product <ArrowUpRight size={14} /></span>
      </Link>
      <div className="product-meta"><div><span className="product-category">{product.category}</span><Link href={`/product/${product.slug}`} className="product-name">{product.name}</Link></div><button className="add-mini" aria-label={`Add ${product.name} to bag`} onClick={() => add(product as any)}><Plus size={17} /></button></div>
      {!compact && <p className="product-description">{product.description}</p>}
      <div className="price-row"><span className="price">{formatPrice(product.price)}</span>{product.compareAt && <span className="compare-price">{formatPrice(product.compareAt)}</span>}<span className="format-pill">{product.format}</span></div>
    </article>
  );
}


import { useAuth } from "@/hooks/useAuth";

export function CartDrawer() {
  const { items, open, setOpen, remove, clear } = useCart();
  const [checkoutState, setCheckoutState] = useState<"cart" | "checkout" | "success">("cart");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState("upi");
  
  const [lastOrder, setLastOrder] = useState<any>(null);

  useEffect(() => {
    const handleCheckout = () => setCheckoutState("checkout");
    window.addEventListener('hsr:checkout', handleCheckout);
    return () => window.removeEventListener('hsr:checkout', handleCheckout);
  }, []);

  const simulatePayment = trpc.orders.simulatePayment.useMutation({
    onSuccess: () => {
      setOpen(false);
      clear();
      setCheckoutState("cart");
      if (lastOrder?.orderId) {
        setLocation(`/order-confirmation/${lastOrder.orderId}`);
      }
    },
    onError: () => toast.error("Payment failed", { description: "Could not process payment simulation." })
  });

  const createOrder = trpc.orders.create.useMutation({ 
    onSuccess: (result) => { 
      toast.info("Order created, processing payment...");
      setLastOrder(result);
      if (result.orderId) simulatePayment.mutate({ orderId: result.orderId });
    }, 
    onError: (err) => toast.error("Couldn’t create the order", { description: err.message }) 
  });
  
  if (!open) return null;
  return <div className="drawer-backdrop" onClick={() => { setOpen(false); if (checkoutState === "success") { clear(); setCheckoutState("cart"); setLocation("/account"); } }}><aside className="cart-drawer" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Your bag"><div className="drawer-head"><div><span className="eyebrow">{checkoutState === "success" ? "ORDER COMPLETE" : "YOUR BAG"}</span><h2>{checkoutState === "success" ? "Payment Successful 🎉" : "Ready when you are."}</h2></div><button className="icon-button" onClick={() => { setOpen(false); if (checkoutState === "success") { clear(); setCheckoutState("cart"); setLocation("/account"); } }} aria-label="Close bag"><X size={20} /></button></div>{checkoutState === "success" ? <div className="success-state" style={{ padding: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', justifyContent: 'center' }}><div style={{ width: '60px', height: '60px', background: 'var(--brand)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}><Check size={30} /></div><p style={{ fontSize: '16px', lineHeight: 1.6 }}>Thank you for your purchase!<br/>Order Number: <strong>#{lastOrder?.orderId}</strong></p><div style={{ background: 'var(--stone)', padding: '20px', borderRadius: '8px' }}><p style={{ marginBottom: '15px' }}>Your digital product is ready for instant download.</p><button className="button button-primary button-full" onClick={() => { setOpen(false); clear(); setCheckoutState("cart"); setLocation("/account"); }}>Go to Download <ArrowUpRight size={17} /></button></div><small style={{ color: 'var(--ink-light)' }}>We've also sent a confirmation email with your download link.</small></div> : items.length === 0 ? <div className="empty-bag"><div className="empty-icon"><ShoppingBag size={28} /></div><h3>Your bag is waiting.</h3><p>Add a practical product and it will show up here. No shipping, no waiting — just digital access.</p><Link href="/shop" className="button button-primary" onClick={() => setOpen(false)}>Explore products <ArrowUpRight size={16} /></Link></div> : <><div className="drawer-items">{items.map((product) => <div className="drawer-item" key={product.slug}><div className={`drawer-thumb ${getCoverClass(product.accent)}`} style={getProductCoverStyle(product)}>{!product.imagePath && <span><CoverIcon type={product.type} /></span>}</div><div><span className="product-category">{product.category}</span><h3>{product.name}</h3><strong>{formatPrice(product.price)}</strong></div><button className="remove-item" onClick={() => remove(product.slug)} aria-label={`Remove ${product.name}`}><X size={15} /></button></div>)}</div><div className="drawer-checkout"><div className="drawer-total"><span>Subtotal</span><strong>{formatPrice(items.reduce((total, item) => total + item.price, 0))}</strong></div><div className="drawer-total" style={{ marginTop: '-10px' }}><span>Discount</span><strong>₹0</strong></div><div className="drawer-total" style={{ borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '15px', marginTop: '5px' }}><span>Total</span><strong>{formatPrice(items.reduce((total, item) => total + item.price, 0))}</strong></div>{checkoutState === "checkout" ? <form className="checkout-form" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); createOrder.mutate({ name: String(data.get("name")), email: String(data.get("email")), items: items.map((item) => ({ slug: item.slug, quantity: 1 })) }); }}><input name="name" defaultValue={user?.name || ""} required placeholder="Your name" aria-label="Your name" /><input name="email" type="email" defaultValue={user?.email || ""} required placeholder="Email for digital access" aria-label="Email for digital access" /><input name="mobile" type="tel" required placeholder="Mobile Number" aria-label="Mobile Number" /><textarea name="billing" placeholder="Billing details (optional)" aria-label="Billing details" rows={2} style={{ width: '100%', padding: '12px 16px', background: 'var(--stone)', border: '1px solid transparent', borderRadius: '8px', fontSize: '15px' }}></textarea>
<div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
  <span style={{ fontSize: '14px', fontWeight: 600 }}>Payment Method</span>
  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', cursor: 'pointer' }}><input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'} onChange={(e) => setPaymentMethod(e.target.value)} /> UPI / QR</label>
  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', cursor: 'pointer' }}><input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={(e) => setPaymentMethod(e.target.value)} /> Debit / Credit Card</label>
  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', cursor: 'pointer' }}><input type="radio" name="payment" value="netbanking" checked={paymentMethod === 'netbanking'} onChange={(e) => setPaymentMethod(e.target.value)} /> Net Banking</label>
</div>
<button className="button button-primary button-full" type="submit" disabled={createOrder.isPending || simulatePayment.isPending} style={{ marginTop: '20px' }}>{(createOrder.isPending || simulatePayment.isPending) ? "Processing secure checkout…" : "Complete Purchase"} <ArrowUpRight size={16} /></button><button className="checkout-back" type="button" onClick={() => setCheckoutState("cart")}>Back to bag</button></form> : <button className="button button-primary button-full" onClick={() => setCheckoutState("checkout")}>Proceed to Checkout <ArrowUpRight size={16} /></button>}<p><Check size={13} /> Secure payment · instant digital access</p></div></>}</aside></div>;
}

export function TrustStrip() {
  const items = [[<Sparkles size={18} />, "Practical products", "Made to be used"], [<span className="rupee-mark">₹</span>, "Fair prices", "Value without the noise"], [<Download size={18} />, "Instant access", "Digital, ready when you are"], [<Check size={18} />, "Simple & secure", "A clear way to buy"]];
  return <div className="trust-strip">{items.map(([icon, title, detail]) => <div className="trust-item" key={title as string}><span className="trust-icon">{icon}</span><span><strong>{title}</strong><small>{detail}</small></span></div>)}</div>;
}
