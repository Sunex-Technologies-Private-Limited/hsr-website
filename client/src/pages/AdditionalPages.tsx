import React, { useState } from "react";
import { ArrowRight, ArrowUpRight, Check, Heart, LogIn, Mail, MapPin, Phone, ShieldCheck, Sparkles, BookOpen, Cpu, Briefcase, Zap, Compass, Smile, Home, Coffee, CheckSquare, Book, Calendar, PenTool } from "lucide-react";
import { Link, useLocation } from "wouter";
import { categories, formatPrice } from "@/lib/store";
import { ProductCard, SectionHeading, useCart, useFavorites } from "@/components/Storefront";
import { trpc } from "@/lib/trpc";
import type { Product } from "@/lib/store";

export function NewArrivals() {
  const { data: products = [] } = trpc.catalog.list.useQuery();
  const arrivals = products.filter((product) => product.badge === "New" || product.badge === "Popular");
  return <CollectionPage eyebrow="NEW ARRIVALS" title={<>Fresh tools for<br /><em>what’s next.</em></>} intro="Newly added digital products for the projects, plans and possibilities currently taking up space in your head." products={arrivals.length ? arrivals : products.slice(0, 4)} />;
}

export function Deals() {
  const { data: products = [] } = trpc.catalog.list.useQuery();
  const deals = products.filter((product) => product.compareAt || product.badge === "₹9 starter");
  return <main className="collection-page"><section className="collection-hero deals-hero"><div className="container collection-hero-inner"><div><span className="eyebrow eyebrow-light">LIMITED TIME EDIT / HSR DIGITAL HUB</span><h1>Small price.<br /><em>Useful payoff.</em></h1><p>Start with a practical digital solution from ₹9, then keep building from there.</p><Link href="/shop" className="button button-light">Shop the edit <ArrowUpRight size={17} /></Link></div><div className="deal-clock"><span>START SMART</span><strong>₹9</strong><small>digital solutions<br />for the next step</small></div></div></section><section className="section"><div className="container"><SectionHeading eyebrow="THE START SMART EDIT" title="Good things can start small." description="Accessible products for the moments when a little structure, clarity or momentum would help." /><div className="product-grid product-grid-three">{deals.map((product) => <ProductCard product={product as any} key={product.slug} />)}</div></div></section></main>;
}

export function About() {
  return (
    <main className="about-page">
      <section className="about-hero">
        <div className="container about-hero-inner">
          <span className="eyebrow eyebrow-light">ABOUT HSR DIGITAL HUB / 01</span>
          <h1>Useful things<br /><em>for real life.</em></h1>
          <p>Our philosophy is simple: Digital products should solve problems, not create them. HSR Digital Hub creates practical, affordable and high-quality digital products designed to help you learn, work, plan and achieve more.</p>
        </div>
      </section>

      <section className="section about-story">
        <div className="container about-story-grid">
          <div><span className="eyebrow">OUR VISION</span><h2>To become the most trusted<br /><em>destination.</em></h2></div>
          <div><p>To become the most trusted and useful destination for practical digital resources that help people simplify their work and life.</p></div>
        </div>
      </section>

      <section className="section about-story">
        <div className="container about-story-grid">
          <div><span className="eyebrow">OUR MISSION</span><h2>Solve problems,<br /><em>save time.</em></h2></div>
          <div><p>To create digital products that solve real problems, save time, and deliver immediate value—without unnecessary complexity or high costs.</p></div>
        </div>
      </section>

      <section className="about-values-bands">
        <div className="container">
          <div className="about-values-header" style={{ marginBottom: '60px' }}>
            <span className="eyebrow eyebrow-dark">OUR VALUES</span>
          </div>
          
          <div className="values-bands-container">
            
            <div className="value-band">
              <div className="band-bg band-navy"></div>
              <div className="band-content band-navy-content">
                <span className="band-num">01</span>
                <h2 className="band-title">Practicality <br /><em>over theory.</em></h2>
                <div className="band-desc-wrapper">
                  <p className="band-desc">Products you can actually use to solve real problems. No fluff, just tools that work.</p>
                  <ArrowRight size={32} className="band-arrow" strokeWidth={1.5} />
                </div>
              </div>
            </div>
            
            <div className="value-band">
              <div className="band-bg band-paper"></div>
              <div className="band-content band-paper-content">
                <span className="band-num">02</span>
                <h2 className="band-title">Quality <br /><em>over quantity.</em></h2>
                <div className="band-desc-wrapper">
                  <p className="band-desc">Carefully crafted resources. We obsess over the details so you get the best experience.</p>
                  <ArrowRight size={32} className="band-arrow" strokeWidth={1.5} />
                </div>
              </div>
            </div>
            
            <div className="value-band">
              <div className="band-bg band-cobalt"></div>
              <div className="band-content band-cobalt-content">
                <span className="band-num">03</span>
                <h2 className="band-title">Affordability <br /><em>without compromise.</em></h2>
                <div className="band-desc-wrapper">
                  <p className="band-desc">Premium quality digital tools at a price that makes sense for everyone.</p>
                  <ArrowRight size={32} className="band-arrow" strokeWidth={1.5} />
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      <section className="section about-bottom">
        <div className="container">
          <span className="eyebrow">WHY WE EXIST</span>
          <h2>30+ Years of<br /><em>Experience.</em></h2>
          <p style={{ maxWidth: '600px', margin: '20px auto', fontSize: '18px', color: 'var(--ink-light)', lineHeight: 1.6 }}>We believe that learning, planning, and organizing shouldn't be expensive or complicated. With 30+ years of digital experience, we created HSR Digital Hub to offer high-quality digital solutions that you can actually use.</p>
          <Link href="/shop" className="button button-primary">Explore our products <ArrowUpRight size={17} /></Link>
        </div>
      </section>
    </main>
  );
}

export function Favorites() {
  const { favorites } = useFavorites();

  return (
    <main className="utility-page" style={favorites.length > 0 ? { minHeight: 'auto', padding: '120px 0', alignItems: 'flex-start' } : {}}>
      {favorites.length === 0 ? (
        <div className="container utility-inner">
          <span className="utility-icon"><Heart size={24} /></span>
          <span className="eyebrow">YOUR SAVED PRODUCTS</span>
          <h1>A place for<br /><em>good ideas.</em></h1>
          <p>Your saved products will appear here when you find something worth coming back to.</p>
          <Link href="/shop" className="button button-primary">Explore the shop <ArrowUpRight size={17} /></Link>
        </div>
      ) : (
        <div className="container" style={{ padding: '0 20px', width: '100%', maxWidth: '1200px', display: 'block' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span className="eyebrow" style={{ display: 'inline-block', marginBottom: '16px' }}>YOUR SAVED PRODUCTS</span>
            <h1 style={{ fontSize: '64px', margin: 0, lineHeight: 1.1, fontFamily: '"Fraunces", Georgia, serif', letterSpacing: '-0.02em', color: 'var(--navy)' }}>Good ideas.</h1>
          </div>
          <div className="product-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '30px',
            alignItems: 'start'
          }}>
            {favorites.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [, setLocation] = useLocation();
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => { toast.success("Welcome back"); setLocation("/account"); window.location.reload(); },
    onError: (err) => { toast.error(err.message); }
  });
  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => { toast.success("Account created"); setLocation("/account"); window.location.reload(); },
    onError: (err) => { toast.error(err.message); }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email"));
    const password = String(data.get("password"));
    if (isRegister) {
      registerMutation.mutate({ email, password });
    } else {
      loginMutation.mutate({ email, password });
    }
  };

  const isPending = loginMutation.isPending || registerMutation.isPending;

  return (
    <main className="utility-page">
      <div className="container utility-inner login-inner">
        <span className="utility-icon"><LogIn size={24} /></span>
        <span className="eyebrow">HSR DIGITAL HUB ACCOUNT</span>
        <h1>{isRegister ? "Create account." : "Welcome back."}</h1>
        <p>{isRegister ? "Sign up to access your digital downloads." : "Sign in to access your downloads and purchase history."}</p>
        <form className="login-form" onSubmit={handleSubmit}>
          <label>Email address<input name="email" type="email" required placeholder="you@example.com" /></label>
          <label>Password<input name="password" type="password" minLength={8} required placeholder="••••••••" /></label>
          <button className="button button-primary" type="submit" disabled={isPending}>
            {isPending ? "Please wait..." : (isRegister ? "Create account" : "Sign in")} <ArrowUpRight size={17} />
          </button>
        </form>
        <button onClick={() => setIsRegister(!isRegister)} className="text-link" style={{ marginTop: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>
          {isRegister ? "Already have an account? Sign in" : "Need an account? Sign up"}
        </button>
      </div>
    </main>
  );
}

export function Account() {
  const { user, loading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { data: orders = [], isLoading: ordersLoading } = trpc.orders.myOrders.useQuery(undefined, { enabled: !!user });
  
  if (loading) return <main className="utility-page"><div className="container utility-inner"><p>Loading...</p></div></main>;
  if (!user) {
    setLocation("/login");
    return null;
  }
  
  return (
    <main className="account-page" style={{ padding: '60px 0', minHeight: '60vh' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <span className="eyebrow">YOUR ACCOUNT</span>
            <h1 style={{ fontSize: '32px', marginTop: '10px' }}>Hello, {user.name || user.email}</h1>
          </div>
          <button onClick={logout} className="button button-light">Sign out</button>
        </div>
        
        <div style={{ background: 'var(--white)', padding: '40px', borderRadius: '12px', border: '1px solid rgba(23,41,73,.1)' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Your Digital Products</h2>
          <p style={{ color: 'var(--ink-light)', marginBottom: '30px' }}>Access your purchased downloads here.</p>
          
          {ordersLoading ? (
            <p>Loading your products...</p>
          ) : orders.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', background: 'var(--stone)', borderRadius: '8px' }}>
              <p style={{ color: 'var(--ink-light)' }}>No purchases yet. <Link href="/shop" className="text-link">Explore the shop</Link></p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {orders.flatMap(order => order.items).map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', border: '1px solid rgba(23,41,73,.1)', borderRadius: '8px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{item.productName}</h3>
                    <p style={{ color: 'var(--ink-light)', fontSize: '14px', marginTop: '5px' }}>Purchased via order</p>
                  </div>
                  {item.downloadPath ? (
                     <a href={`/api/downloads/${item.productSlug}`} target="_blank" rel="noreferrer" className="button button-primary">
                       Download
                     </a>
                  ) : (
                     <span style={{ color: 'var(--ink-light)', fontSize: '14px' }}>Processing...</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export function Contact() {
  return <main className="contact-page"><section className="container contact-hero"><span className="eyebrow">WE’RE HERE TO HELP</span><h1>Let’s make<br /><em>things clearer.</em></h1><p>Questions about a product, digital access or finding the right next step? Send us a note.</p></section><section className="container contact-grid"><div className="contact-info"><div><Mail size={18} /><span><b>Email</b>hello@hsrdigitalhub.com</span></div><div><Phone size={18} /><span><b>Support</b>Product and access help</span></div><div><MapPin size={18} /><span><b>Online</b>Digital-first, wherever you are</span></div></div><form className="contact-form" onSubmit={(event) => event.preventDefault()}><label>Name<input required placeholder="Your name" /></label><label>Email<input required type="email" placeholder="you@example.com" /></label><label>Order Number (optional)<input placeholder="e.g. #12345" /></label><label>Subject<input required placeholder="What is this regarding?" /></label><label>How can we help?<textarea required rows={5} placeholder="Tell us what you’re working on…" /></label><button className="button button-primary" type="submit">Send message <ArrowUpRight size={17} /></button></form></section></main>;
}

export function CollectionPage({ eyebrow, title, intro, products: collection }: { eyebrow: string; title: React.ReactNode; intro: string; products: any[] }) {
  return <main className="collection-page"><section className="collection-hero"><div className="container collection-hero-inner"><div><span className="eyebrow eyebrow-light">{eyebrow}</span><h1>{title}</h1></div><p>{intro}</p></div></section><section className="section"><div className="container"><div className="collection-meta"><span>{collection.length.toString().padStart(2, "0")} products</span><Link href="/shop" className="text-link">View all products <ArrowUpRight size={16} /></Link></div><div className="product-grid product-grid-three">{collection.map((product) => <ProductCard product={product as any} key={product.slug} />)}</div></div></section></main>;
}

export function BestSellers() {
  const { data: products = [] } = trpc.catalog.list.useQuery();
  const bestsellers = products.filter((product) => product.badge === "Bestseller" || product.badge === "Popular");
  return <CollectionPage eyebrow="OUR BEST SELLERS" title={<>Tried.<br /><em>Tested. True.</em></>} intro="The most loved digital products in our collection, designed to deliver immediate value." products={bestsellers.length ? bestsellers : products.slice(0, 4)} />;
}

export function Bundles() {
  const { data: products = [] } = trpc.catalog.list.useQuery();
  const bundles = products.filter((product) => product.type === "Bundle");
  return <CollectionPage eyebrow="DIGITAL BUNDLES" title={<>Save more.<br /><em>Achieve more.</em></>} intro="Carefully curated collections of our best digital products. Everything you need in one place." products={bundles.length ? bundles : products.slice(0, 2)} />;
}

export function FreeResources() {
  const { data: products = [] } = trpc.catalog.list.useQuery();
  const freeProducts = products.filter((product) => product.price === 0 || product.badge === "Free");
  return <CollectionPage eyebrow="FREE RESOURCES" title={<>Start here.<br /><em>Start free.</em></>} intro="Valuable templates, checklists, and guides to help you get started without any cost." products={freeProducts.length ? freeProducts : products.slice(0, 2)} />;
}

export function Categories() {
  const [activeCategory, setActiveCategory] = useState<string>("Education & Learning");
  const [, setLocation] = useLocation();

  const categoryDetails: Record<string, { icon: React.ReactNode; desc: string }> = {
    "Education & Learning": { icon: <BookOpen size={32} strokeWidth={1.5} />, desc: "Level up your skills with study planners and learning systems." },
    "AI & Technology": { icon: <Cpu size={32} strokeWidth={1.5} />, desc: "Work smarter with ready-to-use AI prompts and tech workflows." },
    "Business": { icon: <Briefcase size={32} strokeWidth={1.5} />, desc: "Templates and kits to run the important parts of your business." },
    "Productivity": { icon: <Zap size={32} strokeWidth={1.5} />, desc: "Calm, repeatable systems for planning and protecting your focus." },
    "Career & Jobs": { icon: <Compass size={32} strokeWidth={1.5} />, desc: "Command centers and tools to track your professional growth." },
    "Personal Development": { icon: <Smile size={32} strokeWidth={1.5} />, desc: "Resources to reflect, grow, and build better habits." },
    "Home Planning": { icon: <Home size={32} strokeWidth={1.5} />, desc: "Organizers for household tasks, meals, and life's details." },
    "Lifestyle": { icon: <Coffee size={32} strokeWidth={1.5} />, desc: "Tools to manage travel, health, and everyday routines." },
    "Templates & Checklists": { icon: <CheckSquare size={32} strokeWidth={1.5} />, desc: "Quick, actionable checklists to get things done fast." },
    "E-books & Guides": { icon: <Book size={32} strokeWidth={1.5} />, desc: "In-depth knowledge and step-by-step digital reads." },
    "Planners & Organizers": { icon: <Calendar size={32} strokeWidth={1.5} />, desc: "Structured canvases for daily, weekly, and monthly clarity." },
    "Digital Tools": { icon: <PenTool size={32} strokeWidth={1.5} />, desc: "Standalone spreadsheets and databases for complex tracking." },
  };

  const activeDetails = categoryDetails[activeCategory] || { icon: <ArrowUpRight size={32} strokeWidth={1.5} />, desc: "Explore our collection of digital products." };
  const activeSlug = activeCategory.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');

  return (
    <main className="collection-page">
      <section className="collection-hero">
        <div className="container collection-hero-inner">
          <div><span className="eyebrow eyebrow-light">BROWSE BY CATEGORY</span><h1>Find what<br /><em>you need.</em></h1></div>
          <p>Explore our practical digital solutions grouped by category to help you learn, work, and plan better.</p>
        </div>
      </section>
      
      <section className="categories-split-section">
        <div className="container">
          <div className="cat-split-layout">
            
            {/* Left side: Sticky Preview Panel */}
            <div className="cat-split-left">
               <div className="cat-preview-card" key={activeCategory}>
                 <div className="cat-preview-icon">
                   {activeDetails.icon}
                 </div>
                 <h2 className="cat-preview-title">{activeCategory}</h2>
                 <p className="cat-preview-desc">{activeDetails.desc}</p>
                 <button onClick={() => setLocation(`/category/${activeSlug}`)} className="button button-light" style={{ width: '100%' }}>
                    Explore Category <ArrowRight size={16} />
                 </button>
               </div>
            </div>
            
            {/* Right side: Interactive Menu */}
            <div className="cat-split-right">
               {categories.map((cat, idx) => {
                 const isActive = activeCategory === cat;
                 const slug = cat.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
                 return (
                   <div 
                     key={cat}
                     className={`cat-menu-item ${isActive ? 'active' : ''}`}
                     onMouseEnter={() => setActiveCategory(cat)}
                     onClick={() => setLocation(`/category/${slug}`)}
                     role="button"
                     tabIndex={0}
                   >
                     <span className="cat-menu-num">{String(idx + 1).padStart(2, '0')}</span>
                     <span className="cat-menu-text">{cat}</span>
                     <ArrowRight size={24} className="cat-menu-arrow" />
                   </div>
                 )
               })}
            </div>
            
          </div>
        </div>
      </section>
    </main>
  );
}
