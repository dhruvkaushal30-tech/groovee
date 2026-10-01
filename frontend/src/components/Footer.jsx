import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <p className="footer-brand" aria-label="CONCEPT Groove">
          <span>CONCEPT</span>
          <span>Groove</span>
        </p>
      </div>
      <div>
        <h4>Visit</h4>
        <Link to="/about">About</Link>
        <Link to="/faq">FAQ</Link>
        <Link to="/contact">Contact</Link>
      </div>
      <div>
        <h4>Policies</h4>
        <Link to="/shipping">Shipping</Link>
        <Link to="/returns">Returns</Link>
        <Link to="/privacy">Privacy</Link>
        <Link to="/terms">Terms</Link>
      </div>
      <div>
        <h4>Studio</h4>
        <p>hello@groove.store</p>
        <p>Instagram</p>
        <p>Facebook</p>
      </div>
    </footer>
  );
}
