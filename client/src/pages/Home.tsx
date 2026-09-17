import { ArrowDown, ArrowRight, ArrowUpRight, Check, Download, Play, Sparkles, Gem, Clock, CreditCard, History, Rocket, BookOpen, CalendarCheck, TrendingUp, Wallet, Zap, Target, Briefcase, Bot, LineChart, Home as HomeIcon, Coffee } from "lucide-react";
import { Link } from "wouter";
import { categories } from "@/lib/store";
import { ProductCard, SectionHeading, TrustStrip, useCart } from "@/components/Storefront";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Home() {

  const { add } = useCart();
  const { data: allProducts = [] } = trpc.catalog.list.useQuery();
  const subscribe = trpc.newsletter.subscribe.useMutation({ onSuccess: () => toast.success("You’re on the list", { description: "Watch your inbox for something useful." }), onError: () => toast.error("Please try again", { description: "We couldn’t save your email right now." }) });
  const featured = allProducts.slice(0, 4);
  
  const whatWeOffer = [
    { title: "Learning & Education", desc: "E-books, study resources, guides, worksheets and learning materials.", icon: BookOpen },
    { title: "Business & Productivity", desc: "Business templates, planners, checklists, workflows and productivity resources.", icon: Briefcase },
    { title: "AI-Powered Tools", desc: "AI prompts, AI resources, productivity tools and practical AI solutions.", icon: Bot },
    { title: "Career & Professional Growth", desc: "Career guides, interview resources, resume resources and professional development tools.", icon: LineChart },
    { title: "Home & Planning", desc: "Home planning resources, organizers, checklists and household management tools.", icon: HomeIcon },
    { title: "Lifestyle", desc: "Lifestyle planners, personal development resources and everyday digital solutions.", icon: Coffee }
  ];

  return (
    <main>
      <section className="hero-section">
        <div className="hero-orb hero-orb-one" /><div className="hero-orb hero-orb-two" />
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow hero-eyebrow">THE HSR DIGITAL HUB / 01</span>
            <h1>SMART DIGITAL PRODUCTS<br /><em>FOR A SMARTER LIFE</em></h1>
            <p>Practical, affordable and thoughtfully designed digital products that help you learn, work, plan and achieve more.</p>
            <div className="hero-actions">
              <Link href="/shop" className="button button-primary">Explore Products <ArrowUpRight size={17} /></Link>
              <Link href="/new-arrivals" className="text-link">Discover What's New <ArrowDown size={16} /></Link>
            </div>
            <div className="hero-note">
              <span className="hero-note-dot" /><span>Instant Digital Access • Practical Solutions • Affordable Prices</span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-image-frame">
              <img src="/assets/hero-workspace.jpg" alt="Laptop and tablet displaying digital planning products" />
              <div className="hero-image-caption"><span>01 / Digital resources</span><span className="flex items-center gap-1">Ready when you are <ArrowUpRight size={14} /></span></div>
            </div>
            <div className="hero-float-card">
              <span className="float-card-icon"><Sparkles size={17} /></span><span><b>Small tools.</b><br />Real momentum.</span>
            </div>
            <div className="hero-scribble">scroll to explore <ArrowDown size={15} /></div>
          </div>
        </div>
      </section>
      
      <div className="container">
        <TrustStrip />
      </div>

      <section className="section" style={{ background: 'var(--white)' }}>
        <div className="container">
          <SectionHeading eyebrow="WHY HSR DIGITAL HUB?" title="Designed for real value." />
          <div className="bento-grid">
            <div className="bento-item bento-tall" style={{ gridRow: 'span 2' }}>
              <div className="bento-icon"><Gem size={22} /></div>
              <h3 className="bento-title">PREMIUM QUALITY</h3>
              <p className="bento-desc">Premium value without premium pricing. Thoughtfully designed and thoroughly tested products.</p>
            </div>
            
            <div className="bento-item">
              <div className="bento-icon"><Clock size={22} /></div>
              <h3 className="bento-title">INSTANT ACCESS</h3>
              <p className="bento-desc">No shipping, no waiting. Download and start using immediately.</p>
            </div>

            <div className="bento-item">
              <div className="bento-icon"><History size={22} /></div>
              <h3 className="bento-title">30+ YEARS EXP</h3>
              <p className="bento-desc">Built on decades of hands-on digital experience.</p>
            </div>

            <div className="bento-item" style={{ gridColumn: 'span 2' }}>
              <div className="bento-icon"><Rocket size={22} /></div>
              <h3 className="bento-title">EMPOWERING YOU</h3>
              <p className="bento-desc">Helping you learn, grow, plan and achieve more.</p>
            </div>
          </div>
          <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'center' }}><Link href="/shop" className="button button-primary" style={{ padding: '16px 32px', fontSize: '16px' }}>Explore Our Products <ArrowRight size={18} style={{ marginLeft: '10px' }} /></Link></div>
        </div>
      </section>

      <section className="section category-section" id="categories">
        <div className="container">
          <SectionHeading eyebrow="WHAT WE OFFER" title="Browse by what you’re solving." />
          <div className="category-grid">
            {whatWeOffer.map((item, index) => {
              const colors = ["category-blue", "category-cream", "category-navy", "category-sky"];
              const colorClass = colors[index % colors.length];
              const Icon = item.icon;
              return (
              <Link href={`/shop?category=${encodeURIComponent(item.title)}`} className={`category-card ${colorClass}`} key={item.title}>
                <div className="category-watermark"><Icon size={180} strokeWidth={0.5} /></div>
                <div className="category-content">
                  <span className="category-number">0{index + 1}</span>
                  <div><h3>{item.title}</h3><p>{item.desc}</p></div>
                </div>
                <span className="category-arrow"><ArrowUpRight size={19} /></span>
              </Link>
            )})}
          </div>
          <div style={{ marginTop: '40px', textAlign: 'center' }}><Link href="/categories" className="button button-light">View All Categories</Link></div>
        </div>
      </section>

      <section className="section section-featured">
        <div className="container">
          <SectionHeading eyebrow="START HERE" title="Featured Digital Products" description="Thoughtfully made resources for planning, learning, working and moving forward." action={<Link href="/shop" className="text-link heading-link">View all products <ArrowUpRight size={16} /></Link>} />
          <div className="product-grid product-grid-four">{featured.map((product) => <ProductCard product={product} key={product.slug} />)}</div>
        </div>
      </section>

      <section className="section process-section" id="how-it-works">
        <div className="container">
          <SectionHeading eyebrow="HOW IT WORKS" title="Instant Access in 3 Steps" />
          <div className="process-grid">
            <div className="process-step">
              <span className="process-number">01</span><span className="process-icon"><Sparkles size={21} /></span>
              <h3>CHOOSE</h3><p>Browse the collection and select the product you need.</p>
            </div>
            <div className="process-connector"><ArrowRight size={18} /></div>
            <div className="process-step">
              <span className="process-number">02</span><span className="process-icon"><Check size={21} /></span>
              <h3>PURCHASE</h3><p>Complete your secure online payment.</p>
            </div>
            <div className="process-connector"><ArrowRight size={18} /></div>
            <div className="process-step">
              <span className="process-number">03</span><span className="process-icon"><Download size={21} /></span>
              <h3>DOWNLOAD</h3><p>Get instant access to your digital product and start using it.</p>
            </div>
          </div>
          <div style={{ marginTop: '40px', textAlign: 'center' }}><Link href="/shop" className="button button-primary">Start Exploring <ArrowRight size={16} style={{ marginLeft: '8px' }} /></Link></div>
        </div>
      </section>
      
      <section className="section story-section" id="story">
        <div className="container story-grid">
          <div className="story-index"><span>02</span><span className="story-line" /></div>
          <div className="story-copy">
            <span className="eyebrow">OUR PROMISE</span>
            <h2>We Don't Sell Information.<br /><em>We Create Solutions.</em></h2>
            <p>Every HSR Digital Hub product is created with one goal: to provide something genuinely useful. We focus on practical resources that can save time, simplify work, improve productivity and help people move closer to their goals.</p>
            <br/>
            <h3>Experience You Can Trust</h3>
            <p>Our products are developed using 30+ years of hands-on experience in education, technology, digital solutions and practical problem-solving.</p>
          </div>
          <div className="story-art">
            <div className="story-card story-card-back"><span>MAKE SPACE<br />FOR WHAT<br />MATTERS</span><b><ArrowUpRight size={32} /></b></div>
            <div className="story-card story-card-front"><span className="card-number">HSR / 02</span><strong>Better systems<br /><i>feel lighter.</i></strong><span className="card-arrow"><ArrowRight size={21} /></span></div>
            <span className="story-caption">Thoughtful resources<br />for real life.</span>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--stone)' }}>
        <div className="container">
          <SectionHeading eyebrow="CUSTOMER BENEFITS" title="What’s in it for you?" />
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon" style={{ background: 'var(--sky)', color: 'var(--navy)' }}><Clock size={24} strokeWidth={1.5} /></div>
              <h3>Save Time</h3>
              <p>Skip the setup phase. Our resources are ready-to-use instantly, giving you back hours of your day.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon" style={{ background: 'var(--cream)', color: 'var(--navy)' }}><Rocket size={24} strokeWidth={1.5} /></div>
              <h3>Work Smarter</h3>
              <p>Practical tools and proven templates that streamline your workflow and eliminate unnecessary friction.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon" style={{ background: 'var(--navy)', color: 'var(--white)' }}><BookOpen size={24} strokeWidth={1.5} /></div>
              <h3>Learn Better</h3>
              <p>Simple, clear, and actionable learning resources designed to help you master new skills quickly.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon" style={{ background: 'var(--navy)', color: 'var(--white)' }}><CalendarCheck size={24} strokeWidth={1.5} /></div>
              <h3>Plan Better</h3>
              <p>Organize your personal and professional life with systems that actually make sense for your brain.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon" style={{ background: 'var(--sky)', color: 'var(--navy)' }}><TrendingUp size={24} strokeWidth={1.5} /></div>
              <h3>Grow Faster</h3>
              <p>Accelerate your career and business with resources built on 30+ years of real-world experience.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon" style={{ background: 'var(--cream)', color: 'var(--navy)' }}><Wallet size={24} strokeWidth={1.5} /></div>
              <h3>Spend Less</h3>
              <p>Premium digital solutions that deliver massive value without the expensive subscription fees.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="campaign-section">
        <div className="container campaign-grid">
          <div className="campaign-copy">
            <span className="eyebrow eyebrow-light">Start for Just ₹9</span>
            <h2>Useful digital resources shouldn't have to be expensive.</h2>
            <Link href="/shop?filter=starter" className="button button-light">Explore ₹9 Digital Products <ArrowRight size={17} style={{ marginLeft: '8px' }} /></Link>
          </div>
          <div className="campaign-art">
            <div className="campaign-sticker">FROM<br /><strong>₹9</strong></div>
            <div className="campaign-sheet"><span className="sheet-kicker">THE START SMART EDIT</span><strong>small steps<br /><i>matter</i></strong><span className="sheet-lines"><i /><i /><i /></span><span className="sheet-footer">HSR / 2025</span></div>
            <div className="campaign-circle">01</div>
          </div>
        </div>
      </section>

      <section className="section final-cta">
        <div className="container final-cta-inner">
          <div><span className="eyebrow">READY WHEN YOU ARE</span><h2>Make the next step<br /><em>a little easier.</em></h2></div>
          <Link href="/shop" className="button button-primary">Explore the shop <ArrowUpRight size={17} /></Link>
        </div>
      </section>
    </main>
  );
}
