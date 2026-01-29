import { useState } from 'react';
import axios from 'axios';
import { useAdmin } from '../context/AdminContext';

export default function AdminLogin({ onSuccess }) {
  const { setApiKey, authError, clearAuthError } = useAdmin();
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = key.trim();
    if (!trimmed) {
      setError('Enter your admin API key.');
      return;
    }
    setError('');
    clearAuthError();
    setLoading(true);
    try {
      await axios.get('/api/admin/categories', {
        headers: { 'X-Admin-Key': trimmed },
      });
      setApiKey(trimmed);
      onSuccess?.();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Invalid key.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login__card">
        <h2 className="admin-login__title">Admin access</h2>
        <p className="admin-login__hint">
          Enter the admin API key (set <code>ADMIN_API_KEY</code> in backend <code>.env</code>).
        </p>
        <form className="admin-login__form" onSubmit={handleSubmit}>
          <label className="admin-login__label" htmlFor="admin-key">
            API key
          </label>
          <input
            id="admin-key"
            type="password"
            className="admin-login__input"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Your admin API key"
            autoComplete="off"
            disabled={loading}
          />
          {(error || authError) && (
            <p className="admin-login__error" role="alert">
              {error || authError}
            </p>
          )}
          <button type="submit" className="admin-login__btn" disabled={loading}>
            {loading ? 'Checking…' : 'Access Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}
