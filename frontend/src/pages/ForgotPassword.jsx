import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../services/api';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const fromAdmin = params.get('from') === 'admin';
  const [form, setForm] = useState({ email: '', phone: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function setField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const user = await resetPassword({
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      if (fromAdmin || user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
        return;
      }
      navigate('/', { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Could not reset password'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="auth-card" onSubmit={submit}>
      <p className="eyebrow">Account</p>
      <h1>Forgot password</h1>
      <p className="muted">Enter the email and phone on your account, then choose a new password.</p>
      <label>
        Email
        <input type="email" required value={form.email} onChange={(e) => setField('email', e.target.value)} />
      </label>
      <label>
        Phone
        <input type="tel" required minLength={8} maxLength={15} value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
      </label>
      <label>
        New password
        <input type="password" required minLength={8} value={form.password} onChange={(e) => setField('password', e.target.value)} />
      </label>
      <label>
        Confirm password
        <input type="password" required minLength={8} value={form.confirm} onChange={(e) => setField('confirm', e.target.value)} />
      </label>
      {error && <p className="form-error">{error}</p>}
      <button className="btn" type="submit" disabled={busy}>Save new password</button>
      <p className="muted">
        <Link to={fromAdmin ? '/admin/login' : '/login'}>Back to login</Link>
      </p>
    </form>
  );
}
