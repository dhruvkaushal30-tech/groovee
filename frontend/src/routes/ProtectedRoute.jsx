import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

export default function ProtectedRoute({ children, admin = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader />;
  if (!user) {
    return <Navigate to={admin ? '/admin/login' : '/login'} replace state={{ from: location.pathname }} />;
  }
  if (admin && user.role !== 'ADMIN') return <Navigate to="/" replace />;
  return children;
}
