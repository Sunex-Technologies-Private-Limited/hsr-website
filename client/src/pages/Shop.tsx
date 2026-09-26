import { useMemo, useState } from "react";
import { ArrowUpRight, ChevronDown, Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { categories } from "@/lib/store";
import { ProductCard, SectionHeading } from "@/components/Storefront";
import { trpc } from "@/lib/trpc";

export default function Shop() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  
  const query = searchParams.get("search") || "";
  const category = searchParams.get("category") || "All products";
  const filter = searchParams.get("filter") || null;
  const sort = searchParams.get("sort") || "Featured";
  const maxPrice = parseInt(searchParams.get("maxPrice") || "1000");
  const minRating = parseInt(searchParams.get("minRating") || "0");

  const updateFilters = (updates: Record<string, string | null>, push = false) => {
    const newParams = new URLSearchParams(window.location.search);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) newParams.delete(key);
      else newParams.set(key, value);
    });
    const newUrl = `/shop${newParams.toString() ? `?${newParams.toString()}` : ''}`;
    setLocation(newUrl, { replace: !push });
  };

  const [filtersOpen, setFiltersOpen] = useState(false);
  const { data: products = [] } = trpc.catalog.list.useQuery();

  const filtered = useMemo(() => {
    const result = products.filter((product) => {
      const matchesCategory = category === "All products" || product.category === category;
      const haystack = `${product.name} ${product.description} ${product.category} ${product.type}`.toLowerCase();
      const matchesPrice = (product.price / 100) <= maxPrice;
      const matchesRating = (product.averageRating || 0) >= minRating;
      const matchesFilter = filter !== "starter" || product.price <= 900;
      return matchesCategory && haystack.includes(query.toLowerCase()) && matchesPrice && matchesRating && matchesFilter;
    });
    if (sort === "Price: Low to High") return [...result].sort((a, b) => a.price - b.price);
    if (sort === "Price: High to Low") return [...result].sort((a, b) => b.price - a.price);
    if (sort === "Newest") return [...result].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    if (sort === "Best Selling") return [...result].sort((a, b) => (b.badge === 'Bestseller' ? 1 : 0) - (a.badge === 'Bestseller' ? 1 : 0));
    return result;
  }, [category, query, sort, maxPrice, minRating, filter, products]);
  return <main className="shop-page"><section className="shop-hero"><div className="container shop-hero-inner"><div><span className="eyebrow">THE HSR DIGITAL HUB / SHOP</span><h1>Find something<br /><em>useful.</em></h1></div><p>Templates, planners, toolkits and digital resources designed to help you learn better, work smarter and make progress with less friction.</p></div></section><div className="container shop-content"><div className="shop-toolbar"><div className="shop-count"><strong>{filtered.length.toString().padStart(2, "0")}</strong><span>products to explore</span></div><div className="shop-controls"><label className="shop-search"><Search size={17} /><input value={query} onChange={(event) => updateFilters({ search: event.target.value || null }, false)} placeholder="Search products" aria-label="Search products" />{query && <button onClick={() => updateFilters({ search: null })} aria-label="Clear search"><X size={14} /></button>}</label><button className="filter-toggle" onClick={() => setFiltersOpen((value) => !value)}><SlidersHorizontal size={16} /> Filters</button><label className="sort-control"><span>Sort by</span><select value={sort} onChange={(event) => updateFilters({ sort: event.target.value === "Featured" ? null : event.target.value }, true)} aria-label="Sort products"><option>Featured</option><option>Newest</option><option>Best Selling</option><option>Price: Low to High</option><option>Price: High to Low</option></select><ChevronDown size={15} /></label></div></div><div className={`shop-layout ${filtersOpen ? "filters-open" : ""}`}><aside className="filter-panel"><div className="filter-head"><span className="eyebrow">FILTER BY</span><button onClick={() => setFiltersOpen(false)} aria-label="Close filters"><X size={17} /></button></div><div className="filter-group"><span className="filter-label">Category</span>{["All products", ...categories].map((item) => <button key={item} className={category === item ? "selected" : ""} onClick={() => { updateFilters({ category: item === "All products" ? null : item }, true); setFiltersOpen(false); }}>{item}<span>{item === "All products" ? products.length : products.filter((product) => product.category === item).length}</span></button>)}</div><div className="filter-group"><span className="filter-label">Max Price: ₹{maxPrice}</span><input type="range" min="0" max="1000" step="50" value={maxPrice} onChange={(e) => updateFilters({ maxPrice: e.target.value === "1000" ? null : e.target.value }, false)} style={{ width: '100%' }} /></div><div className="filter-group"><span className="filter-label">Minimum Rating</span><div style={{ display: 'flex', gap: '10px' }}><label><input type="radio" name="rating" checked={minRating === 0} onChange={() => updateFilters({ minRating: null }, true)} /> All</label><label><input type="radio" name="rating" checked={minRating === 4} onChange={() => updateFilters({ minRating: "4" }, true)} /> 4+ Stars</label></div></div><div className="filter-note"><span className="eyebrow">GOOD TO KNOW</span><p>Every product is digital. You’ll see the format and access details before you buy.</p><Link href="/#how-it-works">How it works <ArrowUpRight size={14} /></Link></div></aside><div className="shop-results"><div className="active-filter-row">{category !== "All products" && <button className="active-filter" onClick={() => updateFilters({ category: null }, true)}>{category} <X size={13} /></button>}{query && <button className="active-filter" onClick={() => updateFilters({ search: null })}>“{query}” <X size={13} /></button>}{(maxPrice < 1000) && <button className="active-filter" onClick={() => updateFilters({ maxPrice: null })}>Under ₹{maxPrice} <X size={13} /></button>}{(minRating > 0) && <button className="active-filter" onClick={() => updateFilters({ minRating: null })}>{minRating}+ Stars <X size={13} /></button>}{filter === "starter" && <button className="active-filter" onClick={() => updateFilters({ filter: null }, true)}>₹9 Edit <X size={13} /></button>}</div>{filtered.length > 0 ? <div className="product-grid product-grid-three">{filtered.map((product) => <ProductCard product={product} key={product.slug} />)}</div> : <div className="no-results" style={{ textAlign: "center", padding: "60px 20px", background: "var(--stone)", borderRadius: "12px" }}><span>Nothing here yet.</span><h2>{filter === "starter" ? "No ₹9 products available right now." : "Try a different search."}</h2><p>{filter === "starter" ? "Check back later as we rotate our starter edit." : "Or browse all products to find your next useful thing."}</p><button className="button button-primary" onClick={() => { updateFilters({ search: null, category: null, maxPrice: null, minRating: null, sort: null, filter: null }, true); }}>Clear filters <ArrowUpRight size={16} /></button></div>}</div></div></div></main>;
}
