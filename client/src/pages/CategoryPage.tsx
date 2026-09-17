import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import { ProductCard, SectionHeading } from "@/components/Storefront";
import { trpc } from "@/lib/trpc";
import { categories } from "@/lib/store";

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const { data: products = [] } = trpc.catalog.list.useQuery();
  
  // Try to find the matching category name from the slug
  const decodedSlug = decodeURIComponent(params.slug);
  const categoryName = categories.find(c => 
    c.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-') === decodedSlug
  ) || decodedSlug;

  const categoryProducts = products.filter(p => p.category === categoryName);

  return (
    <main className="collection-page">
      <section className="collection-hero">
        <div className="container collection-hero-inner">
          <div>
            <span className="eyebrow eyebrow-light">CATEGORY / {categoryName.toUpperCase()}</span>
            <h1>Explore<br /><em>{categoryName}.</em></h1>
          </div>
          <p>Practical digital resources and tools for {categoryName.toLowerCase()}, designed to help you make progress with less friction.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="collection-meta">
            <span>{categoryProducts.length.toString().padStart(2, "0")} products</span>
          </div>
          
          {categoryProducts.length > 0 ? (
            <div className="product-grid product-grid-three">
              {categoryProducts.map((product) => (
                <ProductCard product={product as any} key={product.slug} />
              ))}
            </div>
          ) : (
            <div className="no-results" style={{ padding: '60px 0', textAlign: 'center' }}>
              <span>Nothing here yet.</span>
              <h2>Check back soon.</h2>
              <p>We're adding new products to this category.</p>
              <Link href="/shop" className="button button-primary" style={{ marginTop: '20px', display: 'inline-flex' }}>
                Explore all products <ArrowUpRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
