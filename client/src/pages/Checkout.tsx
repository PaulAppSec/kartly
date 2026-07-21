import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { money } from "../lib/format";

export function Checkout() {
  const { user } = useAuth();
  const { lines, subtotal, clear } = useCart();
  const [coupon, setCoupon] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const placeOrder = async () => {
    setError("");
    setBusy(true);
    try {
      const res = await api.checkout(
        lines.map((l) => ({ productId: l.product.id, qty: l.qty })),
        coupon.trim() || undefined,
      );
      clear();
      // Land on the server-rendered order confirmation.
      window.location.href = `/order-confirmation/${res.order.id}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setBusy(false);
    }
  };

  if (!user) {
    return (
      <div className="auth-wrap">
        <div className="panel" style={{ textAlign: "center" }}>
          <h2>Sign in to check out</h2>
          <p className="muted">You'll need an account to place your order.</p>
          <Link className="btn btn-primary" to="/login?returnTo=%2Fcheckout">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="page state">
        <h3>Your cart is empty</h3>
        <p>
          <Link to="/">Find something to love</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className="page" style={{ maxWidth: 720 }}>
      <h1>Checkout</h1>
      <div className="panel" style={{ marginTop: 16 }}>
        {lines.map((l) => (
          <div className="row-between" key={l.product.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
            <span>
              {l.product.name} <span className="muted">× {l.qty}</span>
            </span>
            <span className="tnum">{money(l.product.price * l.qty)}</span>
          </div>
        ))}

        <div className="field" style={{ marginTop: 16 }}>
          <label htmlFor="coupon">Coupon code</label>
          <input
            id="coupon"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value.toUpperCase())}
            placeholder="e.g. WELCOME10"
          />
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="row-between" style={{ marginTop: 12 }}>
          <span className="muted">Subtotal (before coupon)</span>
          <span className="total tnum">{money(subtotal)}</span>
        </div>
        <p className="muted" style={{ fontSize: ".84rem" }}>
          Final total, including any coupon, is calculated securely on the server.
        </p>

        <button className="btn btn-primary" style={{ width: "100%", marginTop: 8 }} onClick={placeOrder} disabled={busy}>
          {busy ? "Placing order…" : `Place order`}
        </button>
      </div>
    </div>
  );
}
