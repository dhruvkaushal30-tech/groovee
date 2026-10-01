import { useState } from 'react';
import { Link } from 'react-router-dom';
import CartItem from '../components/CartItem';
import { useCart } from '../context/CartContext';
import { errorMessage } from '../services/api';
import { formatINR, FREE_SHIPPING_AT } from '../utils/money';

export default function Cart() {
  const { cart, updateItem, removeItem, applyCoupon } = useCart();
  const [code, setCode] = useState(cart.couponCode || '');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function change(id, quantity) {
    setBusy(true);
    setMessage('');
    try {
      await updateItem(id, quantity);
    } catch (err) {
      setMessage(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    setBusy(true);
    try {
      await removeItem(id);
    } catch (err) {
      setMessage(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function submitCoupon(event) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      await applyCoupon(code.trim());
      setMessage(code.trim() ? 'Coupon applied' : 'Coupon removed');
    } catch (err) {
      setMessage(errorMessage(err, 'Coupon could not be applied'));
    } finally {
      setBusy(false);
    }
  }

  if (!cart.items.length) {
    return (
      <div className="page-narrow">
        <h1>Your cart</h1>
        <p className="empty">Your cart is empty.</p>
        <Link to="/shop" className="btn">Continue shopping</Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Your cart</h1>
      <div className="cart-layout">
        <div>
          {cart.items.map((item) => (
            <CartItem key={item._id} item={item} busy={busy} onUpdate={change} onRemove={remove} />
          ))}
        </div>
        <aside className="summary">
          <form onSubmit={submitCoupon} className="coupon-row">
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Coupon code" />
            <button type="submit" className="btn btn-ghost" disabled={busy}>Apply</button>
          </form>
          {message && <p className="muted">{message}</p>}
          <p><span>Subtotal</span><span>{formatINR(cart.subtotal)}</span></p>
          <p><span>Shipping</span><span>{cart.shipping ? formatINR(cart.shipping) : 'FREE'}</span></p>
          <p><span>Discount</span><span>{cart.discount ? `−${formatINR(cart.discount)}` : formatINR(0)}</span></p>
          <p className="total"><span>Total</span><span>{formatINR(cart.total)}</span></p>
          <p className="muted">Shipping is free over {formatINR(FREE_SHIPPING_AT)}.</p>
          <Link to="/checkout" className="btn">Proceed to checkout</Link>
        </aside>
      </div>
    </div>
  );
}
