import { useEffect, useState } from 'react';
import Loader from '../components/Loader';
import { api, errorMessage } from '../services/api';

const blank = { code: '', discountPercent: 10, minOrder: 999, expiry: '2026-12-31', usageLimit: 100 };

export default function CouponList() {
  const [coupons, setCoupons] = useState(null);
  const [form, setForm] = useState(blank);
  const [error, setError] = useState('');

  function load() {
    api.get('/coupons').then((res) => setCoupons(res.data.coupons));
  }

  useEffect(load, []);

  async function create(event) {
    event.preventDefault();
    setError('');
    try {
      await api.post('/coupons', form);
      setForm(blank);
      load();
    } catch (err) {
      setError(errorMessage(err, 'Could not create coupon'));
    }
  }

  async function toggle(coupon) {
    await api.patch(`/coupons/${coupon._id}`, { isActive: !coupon.isActive });
    load();
  }

  async function remove(id) {
    await api.delete(`/coupons/${id}`);
    load();
  }

  if (!coupons) return <Loader />;

  return (
    <div>
      <h1>Coupons</h1>
      <form className="form-grid coupon-form" onSubmit={create}>
        <label>Code<input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></label>
        <label>Discount %<input required type="number" min="1" max="90" value={form.discountPercent} onChange={(e) => setForm({ ...form, discountPercent: Number(e.target.value) })} /></label>
        <label>Minimum order<input required type="number" min="0" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) })} /></label>
        <label>Expiry<input required type="date" value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} /></label>
        <label>Usage limit<input required type="number" min="1" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })} /></label>
        <button className="btn" type="submit">Add coupon</button>
      </form>
      {error && <p className="form-error">{error}</p>}
      <table className="data-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Discount</th>
            <th>Min</th>
            <th>Expiry</th>
            <th>Used</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {coupons.map((coupon) => (
            <tr key={coupon._id}>
              <td>{coupon.code}</td>
              <td>{coupon.discountPercent}%</td>
              <td>₹{coupon.minOrder}</td>
              <td>{new Date(coupon.expiry).toLocaleDateString('en-IN')}</td>
              <td>{coupon.usedCount}/{coupon.usageLimit}</td>
              <td className="row-actions">
                <button type="button" className="text-btn" onClick={() => toggle(coupon)}>
                  {coupon.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button type="button" className="text-btn" onClick={() => remove(coupon._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
