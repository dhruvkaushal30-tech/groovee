import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Login from '../pages/Login';
import SearchBar from './SearchBar';

const links = [
  { to: '/shop?category=new-in', label: 'New In' },
  { to: '/shop?category=hoodies', label: 'Oversized Hoodies' },
  { to: '/shop?category=bottoms', label: 'Bottoms' },
  { to: '/shop?category=t-shirts', label: 'Oversized T-shirts' },
];

export default function Navbar() {
  const { user } = useAuth();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/register') {
      setLoginOpen(false);
      return;
    }
    if (location.state?.openLogin && !user) setLoginOpen(true);
  }, [location.pathname, location.state, user]);

  function close() {
    setOpen(false);
  }

  return (
    <header className="site-header">
      <div className="nav-bar">
        <button className="icon-btn menu-btn" type="button" aria-label="Open menu" onClick={() => setOpen(true)}>
          ☰
        </button>
        <nav className="desktop-nav">
          {links.map((link) => (
            <NavLink key={link.label} to={link.to}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <p className="nav-brand" aria-label="CONCEPT Groove">
          <span>CONCEPT</span>
          <span className="nav-brand-name">Groove</span>
        </p>
        <div className="nav-actions">
          <button className="icon-btn search-btn" type="button" aria-label="Search" onClick={() => setSearchOpen((value) => !value)}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" />
              <path d="M16 16.5L20 20.5" />
            </svg>
          </button>
          <div className="account-slot">
            <button
              className="icon-btn search-btn"
              type="button"
              aria-label={user ? 'Account' : 'Login'}
              aria-expanded={loginOpen}
              onClick={() => {
                if (user) {
                  setLoginOpen(false);
                  navigate('/profile');
                  return;
                }
                setSearchOpen(false);
                setLoginOpen((value) => !value);
              }}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="8" r="3.2" />
                <path d="M5.5 19.5c1.3-3.1 3.5-4.6 6.5-4.6s5.2 1.5 6.5 4.6" />
              </svg>
            </button>
          </div>
          <Link to="/cart" className="icon-btn cart-link" aria-label={count > 0 ? `Cart, ${count} items` : 'Cart'}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6.5 8h11l-.8 11H7.3L6.5 8z" />
              <path d="M9 8V7a3 3 0 0 1 6 0v1" />
            </svg>
            {count > 0 ? <span>{count}</span> : null}
          </Link>
        </div>
      </div>
      {loginOpen && !user && createPortal(
        <div className="login-backdrop" onClick={() => setLoginOpen(false)}>
          <div className="login-pop" onClick={(event) => event.stopPropagation()}>
            <Login panel onDone={() => setLoginOpen(false)} />
          </div>
        </div>,
        document.body
      )}
      {searchOpen && (
        <div className="nav-search">
          <SearchBar onSubmit={() => setSearchOpen(false)} />
        </div>
      )}
      {open && (
        <div className="drawer-backdrop" onClick={close}>
          <aside className="drawer" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="text-btn" onClick={close}>
              Close
            </button>
            {links.map((link) => (
              <Link key={link.label} to={link.to} onClick={close}>
                {link.label}
              </Link>
            ))}
            {user ? (
              <Link to="/profile" onClick={close}>Account</Link>
            ) : (
              <button
                type="button"
                className="text-btn drawer-login"
                onClick={() => {
                  close();
                  setLoginOpen(true);
                }}
              >
                Login
              </button>
            )}
            <Link to="/about" onClick={close}>About</Link>
            <Link to="/contact" onClick={close}>Contact</Link>
            <Link to="/faq" onClick={close}>FAQ</Link>
          </aside>
        </div>
      )}
    </header>
  );
}
