import { useEffect, useMemo, useState } from "react";
import { api, type Product } from "../api/client";
import { ProductCard, ProductCardSkeleton } from "../components/ProductCard";
import { Arrow, Leaf, Shield, Truck } from "../components/Icons";
import { useToast } from "../components/Toaster";

const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export function Home({ onAdd }: { onAdd: (p: Product) => void }) {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState(false);
  const [active, setActive] = useState("All");
  const toast = useToast();

  useEffect(() => {
    let live = true;
    api
      .listProducts()
      .then((res) => live && setProducts(res.products))
      .catch(() => live && setError(true));
    return () => {
      live = false;
    };
  }, []);

  const categories = useMemo(() => {
    if (!products) return [];
    return ["All", ...Array.from(new Set(products.map((p) => p.category)))];
  }, [products]);

  const featured = products?.find((p) => p.category === "Lighting") ?? products?.[0];
  const visible =
    products?.filter((p) => (active === "All" ? true : p.category === active)) ?? [];

  const add = (p: Product) => {
    onAdd(p);
    toast(`Added “${p.name}” to cart`);
  };

  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="container hero">
        <div className="hero-copy">
          <span className="hero-eyebrow">The modern local marketplace</span>
          <h1>
            Goods with a <span className="em">maker</span> behind them.
          </h1>
          <p className="hero-lede">
            Kartly is where small studios sell the things they'd keep for themselves — thrown,
            stitched, pressed, and shipped in small batches.
          </p>
          <div className="hero-cta">
            <a href="/" className="btn btn-primary">
              Shop the catalog <Arrow width={18} height={18} />
            </a>
            <a href="/" className="btn btn-ghost">
              Meet the makers
            </a>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <b className="tnum">240+</b>
              <span>Independent makers</span>
            </div>
            <div className="stat">
              <b className="tnum">12k</b>
              <span>Orders shipped</span>
            </div>
            <div className="stat">
              <b className="tnum">4.9★</b>
              <span>Average rating</span>
            </div>
          </div>
        </div>

        <div className="hero-media">
          <div className="frame">
            {featured?.imageUrl ? (
              <img src={featured.imageUrl} alt={featured.name} width={640} height={800} />
            ) : (
              <div className="skeleton" style={{ width: "100%", height: "100%" }} />
            )}
          </div>
          {featured && (
            <div className="price-tag">
              {money(featured.price)}
              <small>{featured.name}</small>
            </div>
          )}
        </div>
      </section>

      {/* ── Assurances ───────────────────────────────────── */}
      <section className="assurances">
        <div className="container row">
          <div className="item">
            <span className="ic">
              <Truck />
            </span>
            <div>
              <b>Free carbon-neutral shipping</b>
              <span>On orders over $75</span>
            </div>
          </div>
          <div className="item">
            <span className="ic">
              <Shield />
            </span>
            <div>
              <b>Buyer protection</b>
              <span>Every order, guaranteed</span>
            </div>
          </div>
          <div className="item">
            <span className="ic">
              <Leaf />
            </span>
            <div>
              <b>Made to last</b>
              <span>Repair-friendly by design</span>
            </div>
          </div>
          <div className="item">
            <span className="ic">
              <Arrow />
            </span>
            <div>
              <b>30-day returns</b>
              <span>No questions, prepaid label</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Catalog ──────────────────────────────────────── */}
      <section className="container section">
        <div className="section-head">
          <div>
            <span className="eyebrow">Fresh on the shelves</span>
            <h2>This week's picks</h2>
          </div>
          <a href="/" className="btn btn-ghost">
            View all <Arrow width={16} height={16} />
          </a>
        </div>

        {categories.length > 0 && (
          <div className="aisles" role="group" aria-label="Filter by category">
            {categories.map((c) => (
              <button
                key={c}
                className="chip"
                aria-pressed={active === c}
                onClick={() => setActive(c)}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {error ? (
          <div className="state">
            <h3>We couldn't load the catalog</h3>
            <p>The shop is having a moment. Refresh the page to try again.</p>
          </div>
        ) : !products ? (
          <div className="product-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="state">
            <h3>Nothing here yet</h3>
            <p>No products in this aisle. Try another category.</p>
          </div>
        ) : (
          <div className="product-grid">
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={add} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
