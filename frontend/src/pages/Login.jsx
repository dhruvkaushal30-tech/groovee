import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../services/api';

export default function Login({ admin = false, panel = false, onDone }) {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function setField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const user = await login(form);
      if (admin && user.role !== 'ADMIN') {
        await logout();
        setError('This account does not have admin access.');
        return;
      }
      if (onDone) onDone();
      if (panel && !location.state?.from) return;
      const dest = admin ? '/admin/dashboard' : location.state?.from || '/';
      navigate(dest, { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Could not sign in'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={panel ? 'login-pop-form' : 'auth-card'} onSubmit={submit}>
      <p className="eyebrow">{admin ? 'Admin' : 'Account'}</p>
      <h1>{admin ? 'Admin login' : 'Login'}</h1>
      <label>
        Email
        <input type="email" required value={form.email} onChange={(e) => setField('email', e.target.value)} />
      </label>
      <label>
        Password
        <input type="password" required value={form.password} onChange={(e) => setField('password', e.target.value)} />
      </label>
      {error && <p className="form-error">{error}</p>}
      <button className="btn" type="submit" disabled={busy}>Sign in</button>
      <p className="muted">
        <Link to={admin ? '/forgot-password?from=admin' : '/forgot-password'} onClick={() => onDone?.()}>
          Forgot password?
        </Link>
      </p>
      {!admin && (
        <p className="muted">
          New here? <Link to="/register" onClick={() => onDone?.()}>Create an account</Link>
        </p>
      )}
    </form>
  );
}
