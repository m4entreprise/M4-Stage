import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useIsFetching } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { Spinner } from '@/components/ui/spinner';

export const ProtectedRoute = () => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const isFetchingMe = useIsFetching({ queryKey: ['me'] }) > 0;
  const location = useLocation();

  if (isFetchingMe) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Spinner />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (token && !user && !isFetchingMe) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
