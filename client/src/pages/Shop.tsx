import { useMemo, useState } from "react";
import { ArrowUpRight, ChevronDown, Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { categories } from "@/lib/store";
import { ProductCard, SectionHeading } from "@/components/Storefront";
import { trpc } from "@/lib/trpc";

export default function Shop() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split("?")[1] || "");
  const [query, setQuery] = useState(params.get("search") || "");
  const [category, setCategory] = useState(params.get("category") || "All products");
  const [sort, setSort] = useState("Featured");
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [minRating, setMinRating] = useState<number>(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { data: products = [] } = trpc.catalog.list.useQuery();

  const filtered = useMemo(() => {
    const result = products.filter((product) => {
      const matchesCategory = category === "All products" || product.category === category;
      const haystack = `${product.name} ${product.description} ${product.category} ${product.type}`.toLowerCase();
      const matchesPrice = product.price <= maxPrice;
      const mockRating = 5; // Fallback since rating isn't on product yet
      const matchesRating = mockRating >= minRating;
      return matchesCategory && haystack.includes(query.toLowerCase()) && matchesPrice && matchesRating;
    });
    if (sort === "Price: Low to High") return [...result].sort((a, b) => a.price - b.price);
    if (sort === "Price: High to Low") return [...result].sort((a, b) => b.price - a.price);
    if (sort === "Newest") return [...result].reverse();
    if (sort === "Best Selling") return [...result].sort((a, b) => (b.badge === 'Bestseller' ? 1 : 0) - (a.badge === 'Bestseller' ? 1 : 0));
    return result;
  }, [category, query, sort, maxPrice, minRating, products]);
  return <main className="shop-page"><section className="shop-hero"><div className="container shop-hero-inner"><div><span className="eyebrow">THE HSR DIGITAL HUB / SHOP</span><h1>Find something<br /><em>useful.</em></h1></div><p>Templates, planners, toolkits and digital resources designed to help you learn better, work smarter and make progress with less friction.</p></div></section><div className="container shop-content"><div className="shop-toolbar"><div className="shop-count"><strong>{filtered.length.toString().padStart(2, "0")}</strong><span>products to explore</span></div><div className="shop-controls"><label className="shop-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" aria-label="Search products" />{query && <button onClick={() => setQuery("")} aria-label="Clear search"><X size={14} /></button>}</label><button className="filter-toggle" onClick={() => setFiltersOpen((value) => !value)}><SlidersHorizontal size={16} /> Filters</button><label className="sort-control"><span>Sort by</span><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort products"><option>Featured</option><option>Newest</option><option>Best Selling</option><option>Price: Low to High</option><option>Price: High to Low</option></select><ChevronDown size={15} /></label></div></div><div className={`shop-layout ${filtersOpen ? "filters-open" : ""}`}><aside className="filter-panel"><div className="filter-head"><span className="eyebrow">FILTER BY</span><button onClick={() => setFiltersOpen(false)} aria-label="Close filters"><X size={17} /></button></div><div className="filter-group"><span className="filter-label">Category</span>{["All products", ...categories].map((item) => <button key={item} className={category === item ? "selected" : ""} onClick={() => { setCategory(item); setFiltersOpen(false); }}>{item}<span>{item === "All products" ? products.length : products.filter((product) => product.category === item).length}</span></button>)}</div><div className="filter-group"><span className="filter-label">Max Price: ₹{maxPrice}</span><input type="range" min="0" max="1000" step="50" value={maxPrice} onChange={(e) => setMaxPrice(parseInt(e.target.value))} style={{ width: '100%' }} /></div><div className="filter-group"><span className="filter-label">Minimum Rating</span><div style={{ display: 'flex', gap: '10px' }}><label><input type="radio" name="rating" checked={minRating === 0} onChange={() => setMinRating(0)} /> All</label><label><input type="radio" name="rating" checked={minRating === 4} onChange={() => setMinRating(4)} /> 4+ Stars</label></div></div><div className="filter-group"><span className="filter-label">Product type</span><button>Planners <span>03</span></button><button>Templates <span>02</span></button><button>Toolkits <span>01</span></button><button>Bundles <span>01</span></button></div><div className="filter-note"><span className="eyebrow">GOOD TO KNOW</span><p>Every product is digital. You’ll see the format and access details before you buy.</p><Link href="/#how-it-works">How it works <ArrowUpRight size={14} /></Link></div></aside><div className="shop-results"><div className="active-filter-row">{category !== "All products" && <button className="active-filter" onClick={() => setCategory("All products")}>{category} <X size={13} /></button>}{query && <button className="active-filter" onClick={() => setQuery("")}>“{query}” <X size={13} /></button>}{(maxPrice < 1000) && <button className="active-filter" onClick={() => setMaxPrice(1000)}>Under ₹{maxPrice} <X size={13} /></button>}{(minRating > 0) && <button className="active-filter" onClick={() => setMinRating(0)}>{minRating}+ Stars <X size={13} /></button>}</div>{filtered.length > 0 ? <div className="product-grid product-grid-three">{filtered.map((product) => <ProductCard product={product} key={product.slug} />)}</div> : <div className="no-results"><span>Nothing here yet.</span><h2>Try a different search.</h2><p>Or browse all products to find your next useful thing.</p><button className="button button-primary" onClick={() => { setQuery(""); setCategory("All products"); setMaxPrice(1000); setMinRating(0); }}>Clear filters <ArrowUpRight size={16} /></button></div>}</div></div></div></main>;
}
