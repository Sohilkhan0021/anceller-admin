import { ReactElement } from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import { ScreenLoader } from '@/components/loaders';
import { useAuthContext } from '@/auth';
import { Login } from '@/auth/pages/jwt';
import { AuthBrandedLayout } from '@/layouts/auth-branded';

/**
 * Root Route Guard Component
 * 
 * Handles the root path `/`:
 * - If authenticated: redirects to `/admin-dashboard`
 * - If not authenticated: shows Login component using AuthBrandedLayout
 * - URL remains `/` (no redirect for unauthenticated users)
 */
const RootRouteGuard = (): ReactElement => {
  const { auth, loading } = useAuthContext();

  // Show loader while checking authentication
  if (loading) {
    return <ScreenLoader />;
  }

  // If authenticated, redirect to dashboard
  if (auth) {
    return <Navigate to="/admin-dashboard" replace />;
  }

  // If not authenticated, show Login at root path using Route structure
  // This allows AuthBrandedLayout to use <Outlet /> properly
  return (
    <Routes>
      <Route element={<AuthBrandedLayout />}>
        <Route index element={<Login />} />
      </Route>
    </Routes>
  );
};

export { RootRouteGuard };

