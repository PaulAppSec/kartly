import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { money } from "../lib/format";

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { lines, subtotal, setQty, remove, count } = useCart();
  const navigate = useNavigate();

  const goCheckout = () => {
    onClose();
    navigate("/checkout");
  };

  return (
    <>
      <div
        className={`drawer-scrim ${open ? "show" : ""}`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside className={`drawer ${open ? "open" : ""}`} aria-hidden={!open} aria-label="Shopping cart">
        <div className="drawer-head">
          <h3>Your cart {count > 0 && <span className="muted tnum">({count})</span>}</h3>
          <button className="btn-icon" onClick={onClose} aria-label="Close cart">
            ✕
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="state" style={{ padding: "32px 8px" }}>
            <h3>Your cart is empty</h3>
            <p>Add something lovely from the shelves.</p>
          </div>
        ) : (
          <>
            <div className="drawer-lines">
              {lines.map((l) => (
                <div className="drawer-line" key={l.product.id}>
                  <div className="thumb">
                    {l.product.imageUrl && <img src={l.product.imageUrl} alt={l.product.name} />}
                  </div>
                  <div className="line-info">
                    <strong>{l.product.name}</strong>
                    <span className="muted tnum">{money(l.product.price)}</span>
                    <div className="qty">
                      <button onClick={() => setQty(l.product.id, l.qty - 1)} aria-label="Decrease">
                        −
                      </button>
                      <span className="tnum">{l.qty}</span>
                      <button onClick={() => setQty(l.product.id, l.qty + 1)} aria-label="Increase">
                        +
                      </button>
                      <button className="link-danger" onClick={() => remove(l.product.id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="drawer-foot">
              <div className="row-between">
                <span className="muted">Subtotal</span>
                <span className="total tnum">{money(subtotal)}</span>
              </div>
              <button className="btn btn-primary" style={{ width: "100%" }} onClick={goCheckout}>
                Checkout
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
