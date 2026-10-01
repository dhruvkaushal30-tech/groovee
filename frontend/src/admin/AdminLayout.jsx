import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  ['/admin/dashboard', 'Dashboard'],
  ['/admin/products', 'Products'],
  ['/admin/orders', 'Orders'],
  ['/admin/users', 'Users'],
  ['/admin/coupons', 'Coupons'],
];

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  async function signOut() {
    await logout();
    navigate('/admin/login');
  }

  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <p className="logo">Groove</p>
        <p className="eyebrow">Admin</p>
        {links.map(([to, label]) => (
          <NavLink key={to} to={to}>
            {label}
          </NavLink>
        ))}
        <button type="button" className="text-btn" onClick={signOut}>
          Logout
        </button>
        <NavLink to="/">View store</NavLink>
      </aside>
      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  );
}
