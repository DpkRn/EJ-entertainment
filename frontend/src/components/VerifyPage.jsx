import { useState } from 'react';
import { useVisitor } from '../context/VisitorContext';

export default function VerifyPage() {
  const { login, loading, error, setError } = useVisitor();
  const [key, setKey] = useState('');
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setError(null);
    const keyTrimmed = key.trim();
    if (!keyTrimmed) {
      setSubmitError('Enter your private key.');
      return;
    }
    const result = await login(keyTrimmed);
    if (result.ok) {
      setKey('');
      return;
    }
    setSubmitError(result.message || 'Verification failed.');
  };

  const displayError = submitError || error;

  return (
    <div className="verify-page">
      <div className="verify-page__card">
        <h1 className="verify-page__title">Verify yourself</h1>
        <p className="verify-page__hint">
          Enter the private key shared with you to access the dashboard.
        </p>
        <form className="verify-page__form" onSubmit={handleSubmit}>
          <label className="verify-page__label" htmlFor="verify-key">
            Private key
          </label>
          <input
            id="verify-key"
            type="text"
            className="verify-page__input"
            placeholder="XXXX-XXXX-XXXX-XXXX-XXXX-XXXX"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            autoComplete="off"
            disabled={loading}
          />
          {(displayError) && (
            <p className="verify-page__error" role="alert">
              {displayError}
            </p>
          )}
          <button type="submit" className="verify-page__btn" disabled={loading}>
            {loading ? 'Verifying…' : 'Verify & continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
