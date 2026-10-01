import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../services/api';

export default function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      await updateProfile(form);
      setMessage('Profile updated');
    } catch (err) {
      setMessage('');
      setError(errorMessage(err));
    }
  }

  return (
    <form className="auth-card" onSubmit={submit}>
      <p className="eyebrow">Account</p>
      <h1>Profile</h1>
      <p className="muted">{user.email}</p>
      <label>
        First name
        <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
      </label>
      <label>
        Last name
        <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
      </label>
      <label>
        Phone
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
      </label>
      {message && <p className="form-ok">{message}</p>}
      {error && <p className="form-error">{error}</p>}
      <button className="btn" type="submit">Save</button>
      <button className="btn btn-ghost" type="button" onClick={logout}>Logout</button>
    </form>
  );
}
