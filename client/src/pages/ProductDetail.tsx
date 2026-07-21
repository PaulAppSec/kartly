import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, type Product, type Review } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../components/Toaster";
import { money } from "../lib/format";

const Stars = ({ n }: { n: number }) => (
  <span className="stars" aria-label={`${n} out of 5`}>
    {"★".repeat(n)}
    {"☆".repeat(5 - n)}
  </span>
);

export function ProductDetail({ onOpenCart }: { onOpenCart: () => void }) {
  const { id } = useParams();
  const { add } = useCart();
  const { user } = useAuth();
  const toast = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [body, setBody] = useState("");
  const [rating, setRating] = useState(5);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let live = true;
    api
      .getProduct(id)
      .then((res) => live && setProduct(res.product))
      .catch(() => live && setNotFound(true));
    api.listReviews(id).then((res) => live && setReviews(res.reviews));
    return () => {
      live = false;
    };
  }, [id]);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setPosting(true);
    try {
      const res = await api.addReview(id, body, rating);
      setReviews((prev) => [res.review, ...prev]);
      setBody("");
      toast("Review posted");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not post review");
    } finally {
      setPosting(false);
    }
  };

  if (notFound) {
    return (
      <div className="page state">
        <h3>Product not found</h3>
        <p>
          It may have sold out or been removed. <Link to="/">Back to the shop</Link>.
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page pdp">
        <div className="skeleton pdp-media" />
        <div>
          <div className="skeleton" style={{ height: 16, width: "30%", marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 40, width: "80%", marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 80, width: "100%" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="crumbs">
        <Link to="/">Shop</Link> &nbsp;/&nbsp; {product.category} &nbsp;/&nbsp; {product.name}
      </div>
      <div className="pdp">
        <div className="pdp-media">
          {product.imageUrl && <img src={product.imageUrl} alt={product.name} />}
        </div>
        <div>
          <span className="card-cat">{product.category}</span>
          <h1>{product.name}</h1>
          <span className="seller-badge">
            <span className="dot" aria-hidden="true" /> Verified maker
          </span>
          <div className="price tnum">{money(product.price)}</div>
          {/* React escapes text by default — XSS-safe render (stored-XSS #8 in Phase 3) */}
          <p className="muted">{product.description}</p>
          <p className="muted">{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</p>
          <div className="hero-cta" style={{ marginTop: 16 }}>
            <button
              className="btn btn-primary"
              disabled={product.stock <= 0}
              onClick={() => {
                add(product);
                toast(`Added “${product.name}” to cart`);
                onOpenCart();
              }}
            >
              Add to cart
            </button>
            <a className="btn btn-ghost" href={`/share/product/${product.id}`} target="_blank" rel="noreferrer">
              Share
            </a>
          </div>
        </div>
      </div>

      {/* ── Reviews ─────────────────────────────────────── */}
      <section className="reviews">
        <h2>Reviews {reviews.length > 0 && <span className="muted tnum">({reviews.length})</span>}</h2>

        {user ? (
          <form className="panel" style={{ marginTop: 16 }} onSubmit={submitReview}>
            <div className="field">
              <label htmlFor="rating">Rating</label>
              <select id="rating" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} star{n > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="body">Your review</label>
              <textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="What did you think?"
                required
              />
            </div>
            <button className="btn btn-primary" disabled={posting}>
              {posting ? "Posting…" : "Post review"}
            </button>
          </form>
        ) : (
          <p className="muted">
            <Link to="/login">Sign in</Link> to leave a review.
          </p>
        )}

        <div style={{ marginTop: 16 }}>
          {reviews.length === 0 ? (
            <p className="muted">No reviews yet — be the first.</p>
          ) : (
            reviews.map((r) => (
              <div className="review" key={r.id}>
                <div className="row-between">
                  <strong>{r.author.name}</strong>
                  <Stars n={r.rating} />
                </div>
                <p className="muted" style={{ margin: "6px 0 0" }}>
                  {r.body}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
