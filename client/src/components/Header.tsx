import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useTheme } from "../hooks/useTheme";
import { Cart, Moon, Search, Sun } from "./Icons";

export function Header({ onOpenCart }: { onOpenCart: () => void }) {
  const { theme, toggle } = useTheme();
  const { user } = useAuth();
  const { count } = useCart();

  return (
    <header className="site-header">
      <div className="container header-row">
        <Link to="/" className="wordmark" aria-label="Kartly home">
          <span className="glyph" aria-hidden="true" />
          Kartly
        </Link>
        <nav className="main-nav" aria-label="Primary">
          <Link to="/">Shop</Link>
          <Link to="/">Makers</Link>
          <Link to="/">Collections</Link>
          <Link to="/">Journal</Link>
        </nav>
        <span className="header-spacer" />
        <div className="header-actions">
          <button className="btn-icon" aria-label="Search products">
            <Search />
          </button>
          <button
            className="btn-icon"
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
            onClick={toggle}
          >
            {theme === "light" ? <Moon /> : <Sun />}
          </button>
          {user ? (
            <Link to="/account" className="btn btn-ghost">
              {user.name.split(" ")[0]}
            </Link>
          ) : (
            <Link to="/login" className="btn btn-ghost">
              Sign in
            </Link>
          )}
          <button className="cart-pill" onClick={onOpenCart} aria-label="Open cart">
            <Cart width={18} height={18} />
            Cart
            <span className="count tnum">{count}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
