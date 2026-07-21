import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type Product } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toaster";
import { money } from "../lib/format";

export function SellerDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [announcement, setAnnouncement] = useState("");

  const [form, setForm] = useState({ name: "", description: "", price: "", stock: "", category: "General" });

  useEffect(() => {
    if (!user || (user.role !== "SELLER" && user.role !== "ADMIN")) return;
    api.sellerProducts().then((r) => setProducts(r.products)).catch(() => {});
    api.getAnnouncement().then((r) => setAnnouncement(r.template)).catch(() => {});
  }, [user]);

  if (!user) {
    return (
      <div className="auth-wrap">
        <div className="panel" style={{ textAlign: "center" }}>
          <h2>Sign in required</h2>
          <Link className="btn btn-primary" to="/login?returnTo=%2Fseller">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  if (user.role !== "SELLER" && user.role !== "ADMIN") {
    return (
      <div className="page state">
        <h3>Seller access only</h3>
        <p>This dashboard is for makers selling on Kartly.</p>
      </div>
    );
  }

  const createProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createProduct({
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        category: form.category || "General",
      });
      setProducts((p) => [...p, res.product]);
      setForm({ name: "", description: "", price: "", stock: "", category: "General" });
      toast("Product created");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not create product");
    }
  };

  const saveAnnouncement = async () => {
    try {
      await api.setAnnouncement(announcement);
      toast("Announcement saved");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not save");
    }
  };

  return (
    <div className="page">
      <div className="row-between">
        <h1>Seller dashboard</h1>
        <a className="btn btn-ghost" href={`/store/${user.id}`} target="_blank" rel="noreferrer">
          View my store
        </a>
      </div>

      <div className="pdp" style={{ marginTop: 16, alignItems: "start" }}>
        <form className="panel" onSubmit={createProduct}>
          <h3 style={{ marginTop: 0 }}>Add a product</h3>
          <div className="field">
            <label>Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div className="field" style={{ flex: 1 }}>
              <label>Price</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>Stock</label>
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="field">
            <label>Category</label>
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </div>
          <button className="btn btn-primary">Create product</button>
        </form>

        <div className="panel">
          <h3 style={{ marginTop: 0 }}>Store announcement</h3>
          <p className="muted" style={{ fontSize: ".86rem" }}>
            Shown at the top of your public store page.
          </p>
          <div className="field">
            <textarea value={announcement} onChange={(e) => setAnnouncement(e.target.value)} maxLength={2000} />
          </div>
          <button className="btn btn-primary" onClick={saveAnnouncement}>
            Save announcement
          </button>
        </div>
      </div>

      <h3 style={{ marginTop: 32 }}>Your products ({products.length})</h3>
      {products.length === 0 ? (
        <p className="muted">No products yet — add your first above.</p>
      ) : (
        products.map((p) => (
          <div className="list-card" key={p.id}>
            <div>
              <strong>{p.name}</strong>
              <div className="muted" style={{ fontSize: ".86rem" }}>
                {p.category} · {p.stock} in stock
              </div>
            </div>
            <span className="tnum">{money(p.price)}</span>
          </div>
        ))
      )}
    </div>
  );
}
