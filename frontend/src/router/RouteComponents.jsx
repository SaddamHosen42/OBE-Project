import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Loading Component
export const SuspenseLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner size="large" />
  </div>
);

// Layout wrapper with Suspense
export const LayoutWrapper = () => (
  <Suspense fallback={<SuspenseLoader />}>
    <MainLayout>
      <Outlet />
    </MainLayout>
  </Suspense>
);

// Auth Layout (without main layout)
export const AuthLayout = () => (
  <Suspense fallback={<SuspenseLoader />}>
    <Outlet />
  </Suspense>
);
