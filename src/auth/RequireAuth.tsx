import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { ScreenLoader } from '@/components/loaders';

import { useAuthContext } from './useAuthContext';

const RequireAuth = () => {
  const { auth, loading } = useAuthContext();
  const location = useLocation();

  if (loading) {
    return <ScreenLoader />;
  }

  // If not authenticated, redirect to root path (which shows login)
  // Preserve the intended destination so user can be redirected after login
  return auth ? <Outlet /> : <Navigate to="/" state={{ from: location }} replace />;
};

export { RequireAuth };
