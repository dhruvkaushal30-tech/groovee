import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api, errorMessage } from '../services/api';
import { formatINR } from '../utils/money';

const emptyAddress = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
};

export default function Checkout() {
  const { user } = useAuth();
  const { cart, ready, refresh } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState({
    ...emptyAddress,
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    email: user?.email || '',
    ...(user?.addresses?.[0] || {}),
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function setField(key, value) {
    setAddress((current) => ({ ...current, [key]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await api.post('/orders', { address });
      await refresh();
      navigate(`/orders/${res.data.order._id}`, { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Could not place the order'));
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return <Loader />;
  if (!cart.items.length) {
    return (
      <div className="page-narrow">
        <h1>Checkout</h1>
        <p>Your cart is empty.</p>
        <Link to="/shop">Back to shop</Link>
      </div>
    );
  }

  return (
    <div className="checkout">
      <form onSubmit={submit} className="stack-form">
        <h1>Checkout</h1>
        <p className="muted">Cash on delivery. Pay when the parcel arrives.</p>
        <div className="form-grid">
          {[
            ['firstName', 'First name'],
            ['lastName', 'Last name'],
            ['phone', 'Phone'],
            ['email', 'Email'],
            ['address', 'Address'],
            ['city', 'City'],
            ['state', 'State'],
            ['pincode', 'Pincode'],
            ['country', 'Country'],
          ].map(([key, label]) => (
            <label key={key} className={key === 'address' ? 'wide' : ''}>
              {label}
              <input required value={address[key]} onChange={(e) => setField(key, e.target.value)} />
            </label>
          ))}
        </div>
        {error && <p className="form-error">{error}</p>}
        <button className="btn" type="submit" disabled={busy}>
          {busy ? 'Placing order…' : 'Place COD order'}
        </button>
      </form>
      <aside className="summary">
        {cart.items.map((item) => (
          <p key={item._id}>
            <span>{item.name} × {item.quantity}</span>
            <span>{formatINR(item.price * item.quantity)}</span>
          </p>
        ))}
        <p><span>Shipping</span><span>{cart.shipping ? formatINR(cart.shipping) : 'FREE'}</span></p>
        <p><span>Discount</span><span>{cart.discount ? `−${formatINR(cart.discount)}` : formatINR(0)}</span></p>
        <p className="total"><span>Total</span><span>{formatINR(cart.total)}</span></p>
        <p className="muted">Payment method: COD</p>
      </aside>
    </div>
  );
}
