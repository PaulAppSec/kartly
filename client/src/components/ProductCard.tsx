import type { Product } from "../api/client";

const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export function ProductCard({ product, onAdd }: { product: Product; onAdd: (p: Product) => void }) {
  return (
    <article className="card">
      <div className="card-media">
        {product.imageUrl && (
          <img src={product.imageUrl} alt={product.name} loading="lazy" width={400} height={400} />
        )}
        <button
          className="quick-add"
          onClick={() => onAdd(product)}
          aria-label={`Add ${product.name} to cart`}
        >
          Quick add
        </button>
      </div>
      <div className="card-body">
        <span className="card-cat">{product.category}</span>
        <h3 className="card-name">{product.name}</h3>
        <div className="card-foot">
          <span className="card-price tnum">{money(product.price)}</span>
          <span className="seller-badge">
            <span className="dot" aria-hidden="true" />
            Verified maker
          </span>
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <article className="card" aria-hidden="true">
      <div className="skeleton card-media" />
      <div className="card-body">
        <div className="skeleton" style={{ height: 12, width: "40%" }} />
        <div className="skeleton" style={{ height: 18, width: "80%" }} />
        <div className="skeleton" style={{ height: 16, width: "30%", marginTop: 12 }} />
      </div>
    </article>
  );
}
