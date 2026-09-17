import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Plus, Package, Edit, Trash, X } from "lucide-react";
import { toast } from "sonner";
import { categories } from "@/lib/store";

export default function AdminDashboard() {
  const [location, setLocation] = useLocation();
  const { data: products, isLoading, refetch } = trpc.catalog.list.useQuery();
  const updateProductFile = trpc.admin.updateProductFile.useMutation();
  const createProduct = trpc.admin.createProduct.useMutation({
    onSuccess: () => { toast.success("Product saved!"); refetch(); setEditingProduct(null); setIsModalOpen(false); },
    onError: (err) => toast.error(err.message)
  });
  const updateProduct = trpc.admin.updateProduct.useMutation({
    onSuccess: () => { toast.success("Product updated!"); refetch(); setEditingProduct(null); setIsModalOpen(false); },
    onError: (err) => toast.error(err.message)
  });
  const deleteProduct = trpc.admin.deleteProduct.useMutation({
    onSuccess: () => { toast.success("Product deleted!"); refetch(); },
    onError: (err) => toast.error(err.message)
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  if (isLoading) {
    return <main className="utility-page"><div className="container" style={{ textAlign: 'center' }}>Loading Admin...</div></main>;
  }

  return (
    <main className="collection-page" style={{ padding: '60px 0' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <span className="eyebrow">ADMIN DASHBOARD</span>
            <h1 style={{ fontSize: '32px', fontFamily: '"Fraunces", Georgia, serif' }}>Product Management</h1>
          </div>
          <Button className="button-primary" onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}>
            <Plus size={16} style={{ marginRight: '8px' }} /> Add Product
          </Button>
        </div>

        <div style={{ background: 'var(--white)', border: '1px solid rgba(23,41,73,.1)', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(251,248,242,1)', borderBottom: '1px solid rgba(23,41,73,.1)' }}>
                <th style={{ padding: '16px 20px', fontWeight: 600 }}>Product Name</th>
                <th style={{ padding: '16px 20px', fontWeight: 600 }}>Category</th>
                <th style={{ padding: '16px 20px', fontWeight: 600 }}>Price</th>
                <th style={{ padding: '16px 20px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '16px 20px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products?.map((product) => (
                <tr key={product.id} style={{ borderBottom: '1px solid rgba(23,41,73,.05)' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Package size={18} opacity={0.5} />
                      <span style={{ fontWeight: 500 }}>{product.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', opacity: 0.8 }}>{product.category}</td>
                  <td style={{ padding: '16px 20px' }}>₹{product.price}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ display: 'inline-block', padding: '4px 10px', background: product.active ? '#e6f4ea' : '#fce8e6', color: product.active ? '#137333' : '#c5221f', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
                      {product.active ? 'Active' : 'Draft'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <label style={{ cursor: 'pointer', marginRight: '15px', color: 'var(--brand)', fontSize: '14px' }}>
                      Upload File
                      <input type="file" style={{ display: 'none' }} onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const formData = new FormData();
                        formData.append("file", file);
                        try {
                          const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
                          const data = await res.json();
                          if (data.path) {
                            updateProductFile.mutate({ slug: product.slug, filename: data.path }, {
                              onSuccess: () => alert("File uploaded and linked successfully!")
                            });
                          } else {
                            alert("Upload failed.");
                          }
                        } catch (err) {
                          alert("Upload error.");
                        }
                      }} />
                    </label>
                    <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', opacity: 0.6, marginRight: '10px' }} onClick={() => { setEditingProduct(product); setIsModalOpen(true); }}><Edit size={16} /></button>
                    <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', opacity: 0.6, color: 'var(--brand)' }} onClick={() => { if (window.confirm("Are you sure you want to delete this product?")) { deleteProduct.mutate({ slug: product.slug }); } }}><Trash size={16} /></button>
                  </td>
                </tr>
              ))}
              {!products?.length && (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', opacity: 0.5 }}>No products found in the database.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(23,41,73,.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'var(--white)', padding: '40px', borderRadius: '12px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => { setIsModalOpen(false); setEditingProduct(null); }} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            <h2 style={{ fontSize: '24px', marginBottom: '30px' }}>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const payload = {
                name: String(formData.get("name")),
                slug: String(formData.get("slug")),
                category: String(formData.get("category")),
                type: String(formData.get("type")),
                description: String(formData.get("description")),
                price: Number(formData.get("price")),
                compareAt: Number(formData.get("compareAt")) || null,
                badge: String(formData.get("badge")) || null,
                accent: String(formData.get("accent")),
                imagePath: editingProduct?.imagePath || "/assets/products/placeholder.jpg",
                coverLabel: String(formData.get("coverLabel")),
                format: String(formData.get("format")),
                included: JSON.stringify(String(formData.get("included")).split(",").map(i => i.trim())),
                forWho: String(formData.get("forWho")),
                active: formData.get("active") === "on" ? 1 : 0
              };

              if (editingProduct) {
                updateProduct.mutate(payload as any);
              } else {
                createProduct.mutate(payload as any);
              }
            }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <label>Product Name<input name="name" required defaultValue={editingProduct?.name || ""} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.1)' }} /></label>
                <label>Slug (URL)<input name="slug" required defaultValue={editingProduct?.slug || ""} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.1)' }} disabled={!!editingProduct} /></label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <label>Category
                  <select name="category" required defaultValue={editingProduct?.category || categories[0]} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.1)' }}>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
                <label>Type
                  <select name="type" required defaultValue={editingProduct?.type || "Planner"} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.1)' }}>
                    <option>Planner</option><option>Template</option><option>Toolkit</option><option>Bundle</option>
                  </select>
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <label>Price (₹)<input type="number" name="price" required defaultValue={editingProduct?.price || ""} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.1)' }} /></label>
                <label>Compare At Price (₹) (Optional)<input type="number" name="compareAt" defaultValue={editingProduct?.compareAt || ""} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.1)' }} /></label>
              </div>

              <label>Description<textarea name="description" required rows={3} defaultValue={editingProduct?.description || ""} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.1)' }} /></label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <label>Format (e.g. PDF + Notion)<input name="format" required defaultValue={editingProduct?.format || ""} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.1)' }} /></label>
                <label>Cover Label<input name="coverLabel" required defaultValue={editingProduct?.coverLabel || "MAKE PROGRESS"} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.1)' }} /></label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <label>Badge (e.g. Bestseller, New)<input name="badge" defaultValue={editingProduct?.badge || ""} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.1)' }} /></label>
                <label>Accent Color
                  <select name="accent" required defaultValue={editingProduct?.accent || "blue"} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.1)' }}>
                    <option>blue</option><option>navy</option><option>sky</option><option>cream</option>
                  </select>
                </label>
              </div>

              <label>Included Items (comma separated)<input name="included" required defaultValue={editingProduct ? JSON.parse(editingProduct.included).join(", ") : ""} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.1)' }} /></label>
              
              <label>Who is this for?<input name="forWho" required defaultValue={editingProduct?.forWho || ""} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.1)' }} /></label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" name="active" defaultChecked={editingProduct ? editingProduct.active === 1 : true} /> Active / Published
              </label>

              <Button type="submit" disabled={createProduct.isPending || updateProduct.isPending} style={{ marginTop: '10px' }}>
                {editingProduct ? 'Update Product' : 'Create Product'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
