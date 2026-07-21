import { Link } from "react-router-dom";
import type { Product } from "../api/client";
import { useCart } from "../context/CartContext";
import { useToast } from "./Toaster";
import { money } from "../lib/format";

export function ProductCard({ product, onAdded }: { product: Product; onAdded?: () => void }) {
  const { add } = useCart();
  const toast = useToast();

  const quickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    add(product);
    toast(`Added “${product.name}” to cart`);
    onAdded?.();
  };

  return (
    <article className="card">
      <Link to={`/product/${product.id}`} className="card-media" aria-label={product.name}>
        {product.imageUrl && (
          <img src={product.imageUrl} alt={product.name} loading="lazy" width={400} height={400} />
        )}
        <button className="quick-add" onClick={quickAdd} aria-label={`Add ${product.name} to cart`}>
          Quick add
        </button>
      </Link>
      <div className="card-body">
        <span className="card-cat">{product.category}</span>
        <Link to={`/product/${product.id}`}>
          <h3 className="card-name">{product.name}</h3>
        </Link>
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
