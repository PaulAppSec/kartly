import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useTheme } from "../hooks/useTheme";
import { Cart, Moon, Search, Sun } from "./Icons";

export function Header({ onOpenCart }: { onOpenCart: () => void }) {
  const { theme, toggle } = useTheme();
  const { user } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    if (term) navigate(`/search?q=${encodeURIComponent(term)}`);
  };

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
          <form className="header-search" role="search" onSubmit={onSearch}>
            <span className="header-search-icon" aria-hidden="true">
              <Search width={18} height={18} />
            </span>
            <input
              type="search"
              aria-label="Search products"
              placeholder="Search products…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </form>
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
