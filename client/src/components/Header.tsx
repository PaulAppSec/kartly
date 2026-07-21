import { useTheme } from "../hooks/useTheme";
import { Cart, Moon, Search, Sun } from "./Icons";

export function Header({ cartCount = 0 }: { cartCount?: number }) {
  const { theme, toggle } = useTheme();
  return (
    <header className="site-header">
      <div className="container header-row">
        <a href="/" className="wordmark" aria-label="Kartly home">
          <span className="glyph" aria-hidden="true" />
          Kartly
        </a>
        <nav className="main-nav" aria-label="Primary">
          <a href="/">Shop</a>
          <a href="/">Makers</a>
          <a href="/">Collections</a>
          <a href="/">Journal</a>
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
          <a href="/" className="cart-pill">
            <Cart width={18} height={18} />
            Cart
            <span className="count tnum">{cartCount}</span>
          </a>
        </div>
      </div>
    </header>
  );
}
