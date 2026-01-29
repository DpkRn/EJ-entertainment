import { useVisitor } from '../context/VisitorContext';
import VerifyPage from './VerifyPage';
import UserDashboard from './UserDashboard';

/**
 * Protects the dashboard: show VerifyPage until visitor is verified by private key.
 * After first-time verify we store device ID; next time we recognize by device and show dashboard directly.
 */
export default function VisitorGate() {
  const { isAuthenticated, loading } = useVisitor();

  if (loading) {
    return (
      <div className="app">
        <div className="loading loading--full">
          <span className="loading__spinner" />
          <span>Checking access…</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="app">
        <VerifyPage />
      </div>
    );
  }

  return (
    <div className="app">
      <UserDashboard />
    </div>
  );
}
