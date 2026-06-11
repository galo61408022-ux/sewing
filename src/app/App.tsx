import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { AppShell } from './components/layout/AppShell';
import { canAccess } from './lib/permissions';
import type { Role } from './lib/types';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CustomersPage from './pages/CustomersPage';
import CustomerDetailPage from './pages/CustomerDetailPage';
import MeasurementsPage from './pages/MeasurementsPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import PaymentsPage from './pages/PaymentsPage';
import InventoryPage from './pages/InventoryPage';
import StaffPage from './pages/StaffPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

function RequireAuth({ children, path }: { children: React.ReactNode; path: string }) {
  const { user, role } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!canAccess(role as Role, path)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function Root() {
  return (
    <AuthProvider>
      <DataProvider>
        <Outlet />
      </DataProvider>
    </AuthProvider>
  );
}

function AuthRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? '/dashboard' : '/login'} replace />;
}

function RootIndex() {
  return <AuthRedirect />;
}

const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      { path: '/', element: <RootIndex /> },
      { path: '/login', element: <LoginPage /> },
      {
        element: <AppShell />,
        children: [
          { path: '/dashboard', element: <RequireAuth path="/dashboard"><DashboardPage /></RequireAuth> },
          { path: '/customers', element: <RequireAuth path="/customers"><CustomersPage /></RequireAuth> },
          { path: '/customers/:id', element: <RequireAuth path="/customers"><CustomerDetailPage /></RequireAuth> },
          { path: '/measurements', element: <RequireAuth path="/measurements"><MeasurementsPage /></RequireAuth> },
          { path: '/orders', element: <RequireAuth path="/orders"><OrdersPage /></RequireAuth> },
          { path: '/orders/:id', element: <RequireAuth path="/orders"><OrderDetailPage /></RequireAuth> },
          { path: '/payments', element: <RequireAuth path="/payments"><PaymentsPage /></RequireAuth> },
          { path: '/inventory', element: <RequireAuth path="/inventory"><InventoryPage /></RequireAuth> },
          { path: '/staff', element: <RequireAuth path="/staff"><StaffPage /></RequireAuth> },
          { path: '/reports', element: <RequireAuth path="/reports"><ReportsPage /></RequireAuth> },
          { path: '/settings', element: <RequireAuth path="/settings"><SettingsPage /></RequireAuth> },
        ],
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
