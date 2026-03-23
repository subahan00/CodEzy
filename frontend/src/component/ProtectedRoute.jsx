// client/src/components/layout/ProtectedRoute.jsx (Future Step)
import { useAuth } from '../context/authContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated } = useAuth();
  console.log('useeer-',user);
  console.log('requiredRole-',requiredRole);

  if (!isAuthenticated) return <Navigate to="/" />;
  // RBAC Check
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" />; // Or a "Access Denied" page
  }

  return children;
};

export default ProtectedRoute;
