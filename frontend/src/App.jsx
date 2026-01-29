import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAdmin } from './context/AdminContext';
import VisitorGate from './components/VisitorGate';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

function App() {
  const { isAuthenticated: adminAuthenticated } = useAdmin();
  const navigate = useNavigate();

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<VisitorGate />} />
        <Route
          path="/admin"
          element={
            adminAuthenticated ? (
              <AdminDashboard onBack={() => navigate('/')} />
            ) : (
              <AdminLogin onSuccess={() => {}} />
            )
          }
        />
      </Routes>
    </div>
  );
}

export default App;
