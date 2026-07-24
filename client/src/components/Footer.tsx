import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="wordmark" style={{ marginBottom: 12 }}>
              <span className="glyph" aria-hidden="true" />
              Kartly
            </div>
            <p style={{ maxWidth: "34ch" }}>
              A modern local marketplace — small-batch makers, everyday goods, and the people
              behind them.
            </p>
          </div>
          <div>
            <h4>Shop</h4>
            <Link to="/#catalog">New arrivals</Link>
            <Link to="/#catalog">Best sellers</Link>
            <Link to="/?category=Kitchen">Kitchen</Link>
            <Link to="/?category=Home">Home &amp; living</Link>
          </div>
          <div>
            <h4>Makers</h4>
            <Link to="/seller">Become a seller</Link>
            <a href="/">Seller stories</a>
            <a href="/">Wholesale</a>
          </div>
          <div>
            <h4>Support</h4>
            <a href="/">Help center</a>
            <a href="/">Shipping &amp; returns</a>
            <a href="/">Contact</a>
          </div>
        </div>
        <div className="footer-note">
          <span>© {new Date().getFullYear()} Kartly. A demo storefront.</span>
          <span className="warn-banner">LOCAL DEMO — DO NOT DEPLOY</span>
        </div>
      </div>
    </footer>
  );
}
