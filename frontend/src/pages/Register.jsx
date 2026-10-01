import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../services/api';

const fields = [
  ['firstName', 'First name', 'text'],
  ['lastName', 'Last name', 'text'],
  ['email', 'Email', 'email'],
  ['phone', 'Phone', 'tel'],
  ['password', 'Password', 'password'],
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await register(form);
      navigate('/', { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Could not create account'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="auth-card" onSubmit={submit}>
      <p className="eyebrow">Account</p>
      <h1>Create account</h1>
      {fields.map(([key, label, type]) => (
        <label key={key}>
          {label}
          <input
            type={type}
            required
            minLength={key === 'password' ? 8 : undefined}
            value={form[key]}
            onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.value }))}
          />
        </label>
      ))}
      {error && <p className="form-error">{error}</p>}
      <button className="btn" type="submit" disabled={busy}>Register</button>
      <p className="muted">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </form>
  );
}
