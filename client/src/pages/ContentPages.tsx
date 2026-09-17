import React, { useState } from "react";
import { AlertCircle, Download, FileText, HelpCircle, FileCheck2, ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import { products, categories, formatPrice } from "@/lib/store";
import { ProductCard, SectionHeading } from "@/components/Storefront";

export function ContentPage({ eyebrow, title, intro, children, icon: Icon }: { eyebrow: string; title: React.ReactNode; intro?: string; children: React.ReactNode; icon?: React.ElementType }) {
  return (
    <main className="content-page">
      <section className="contact-hero container" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '40px' }}>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        {intro && <p style={{ fontSize: '18px', lineHeight: 1.6, opacity: 0.8, marginTop: '20px' }}>{intro}</p>}
      </section>
      <section className="section container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="content-body" style={{ display: 'flex', flexDirection: 'column', gap: '30px', fontSize: '16px', lineHeight: 1.7, opacity: 0.9 }}>
          {children}
        </div>
      </section>
    </main>
  );
}

export function PrivacyPolicy() {
  return (
    <ContentPage eyebrow="LEGAL" title={<>Privacy<br /><em>Policy.</em></>}>
      <h3>1. Information Collected</h3>
      <p>We collect information to provide better services to our users. This includes name, email, mobile number, and payment processing details when you make a purchase.</p>
      <h3>2. How We Use Information</h3>
      <p>Your information is used for processing orders, delivering digital products, improving our website, and sending marketing emails (which you can opt out of at any time).</p>
      <h3>3. Data Security</h3>
      <p>We use secure HTTPS/SSL and trusted third-party payment gateways. We do not store raw payment card information on our servers.</p>
      <h3>4. Cookies & Analytics</h3>
      <p>We use cookies to improve user experience and analyze website traffic. By using our site, you agree to our use of cookies.</p>
      <h3>5. User Rights</h3>
      <p>You have the right to access, correct, or delete your personal data. Contact our support team for any data-related requests.</p>
    </ContentPage>
  );
}

export function TermsAndConditions() {
  return (
    <ContentPage eyebrow="LEGAL" title={<>Terms &<br /><em>Conditions.</em></>}>
      <h3>1. Website Usage</h3>
      <p>By accessing HSR Digital Hub, you agree to be bound by these terms of service, all applicable laws and regulations.</p>
      <h3>2. Product Purchases</h3>
      <p>All products are digital downloads. Once a purchase is complete, you will receive instant access to download the files.</p>
      <h3>3. Intellectual Property</h3>
      <p>All content on this website is the intellectual property of HSR Digital Hub. Unauthorized redistribution, sharing of download links, or claiming products as your own is strictly prohibited.</p>
      <h3>4. Limitation of Liability</h3>
      <p>HSR Digital Hub provides products "as is" without any guarantees. We shall not be liable for any damages arising out of the use or inability to use our products.</p>
    </ContentPage>
  );
}

export function RefundPolicy() {
  return (
    <ContentPage eyebrow="LEGAL" title={<>Refund<br /><em>Policy.</em></>}>
      <h3>Digital Product Refunds</h3>
      <p>Due to the nature of digital products, all sales are considered final once the files have been downloaded. We do not offer refunds on digital downloads.</p>
      <h3>Exceptions</h3>
      <p>If you encounter technical issues with a file, or if you accidentally purchased the same product twice, please contact our support team within 7 days of purchase. We will review your request and may issue a refund or store credit at our discretion.</p>
      <h3>Contact Us</h3>
      <p>If you have any questions about our refund policy, please visit our <Link href="/support" className="text-link">Support page</Link>.</p>
    </ContentPage>
  );
}

export function LicensePolicy() {
  return (
    <ContentPage eyebrow="LEGAL" title={<>License &<br /><em>Usage.</em></>}>
      <h3>Personal Use License</h3>
      <p>Most of our products are sold under a Personal Use License. This means you may use the digital files for your own personal, non-commercial purposes. You may not resell, redistribute, or share the files.</p>
      <h3>Commercial Use License</h3>
      <p>Some products (like certain business templates) may include a Commercial Use License. This allows you to use the files in your business operations, but you still cannot resell the files themselves as your own digital products.</p>
      <h3>Prohibited Actions</h3>
      <ul style={{ paddingLeft: '20px', listStyleType: 'disc' }}>
        <li>Reselling or sub-licensing the files.</li>
        <li>Uploading the files to any sharing platform.</li>
        <li>Modifying the files and claiming them as your own original work.</li>
      </ul>
    </ContentPage>
  );
}

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    { q: "What is HSR Digital Hub?", a: "We create practical, affordable, and high-quality digital products designed to help you learn, work, and plan better." },
    { q: "Are your products physical or digital?", a: "All our products are 100% digital. You will not receive any physical items in the mail." },
    { q: "How do I access my purchase?", a: "After checkout, you'll immediately receive a download link on the confirmation page and via email. You can also access downloads from your account dashboard." },
    { q: "What formats do the digital products come in?", a: "Our products come in various formats like PDF, Notion templates, spreadsheets, and more. Check the specific product page for details." },
    { q: "Do I need any special software to use your products?", a: "Most products can be used with free software (like a PDF reader or Notion). Specific requirements are listed on the product page." },
    { q: "Can I use your templates for my business?", a: "Products with a 'Commercial Use' license can be used in your business operations. However, you cannot resell the template itself." },
    { q: "What if I accidentally delete my downloaded file?", a: "You can re-download your purchases at any time by logging into your HSR Digital Hub account." },
    { q: "Do you offer refunds?", a: "Due to the nature of digital downloads, sales are final once files are downloaded. Please see our Refund Policy for exceptions." },
    { q: "Can I share the digital file with my friends?", a: "No. Your purchase grants you a personal license. Please direct friends to our website to purchase their own copy." },
    { q: "What payment methods do you accept?", a: "We accept all major credit cards and secure digital payment methods." },
  ];

  return (
    <main className="faq-page-creative">
      <section className="faq-hero-creative">
        <div className="container">
          <span className="eyebrow eyebrow-dark">HELP & SUPPORT</span>
          <h1>Frequently Asked<br /><em>Questions.</em></h1>
        </div>
      </section>
      
      <section className="faq-accordion-section">
        <div className="container">
          <div className="faq-creative-list">
            {faqs.map((faq, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div 
                  key={idx} 
                  className={`faq-creative-item ${isOpen ? 'is-open' : ''}`}
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                >
                  <div className="faq-creative-header">
                    <span className="faq-num">{(idx + 1).toString().padStart(2, '0')}</span>
                    <h3 className="faq-q">{faq.q}</h3>
                    <div className="faq-toggle-icon">
                      <div className="faq-toggle-line-h"></div>
                      <div className="faq-toggle-line-v"></div>
                    </div>
                  </div>
                  <div className="faq-creative-body">
                    <div className="faq-body-inner">
                      <p>{faq.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}

export function Support() {
  return (
    <main className="contact-page">
      <section className="container contact-hero">
        <span className="eyebrow">CUSTOMER SUPPORT</span>
        <h1>How can we<br /><em>help you?</em></h1>
        <p>If you're facing any issues with your purchase, downloads, or have product questions, you're in the right place.</p>
      </section>
      <section className="container contact-grid">
        <div className="contact-info">
          <div><FileText size={18} /><span><b>Purchase Support</b>Help with your orders and access</span></div>
          <div><AlertCircle size={18} /><span><b>Payment Issues</b>Assistance with failed or double charges</span></div>
          <div><Download size={18} /><span><b>Download Problems</b>Missing links or corrupted files</span></div>
          <div><HelpCircle size={18} /><span><b>Product Questions</b>Need help using a template or tool</span></div>
          <div><FileCheck2 size={18} /><span><b>Refund Requests</b>Inquiries based on our refund policy</span></div>
        </div>
        <div style={{ background: 'var(--paper)', padding: '40px', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '24px', marginBottom: '20px', fontFamily: '"Fraunces", Georgia, serif' }}>Get in touch</h3>
          <p style={{ marginBottom: '30px', opacity: 0.8 }}>Our team is available Monday through Friday. We typically respond within 24 hours.</p>
          <Link href="/contact" className="button button-primary" style={{ width: '100%', justifyContent: 'center' }}>Contact Support <ArrowUpRight size={17} /></Link>
        </div>
      </section>
    </main>
  );
}

export function NotFound() {
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
