import { createBrowserRouter, RouterProvider, Navigate, Outlet, useLocation } from 'react-router';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { AppShell } from './components/layout/AppShell';
import { canAccess, getRoleHomePath } from './lib/permissions';
import { buildRolePath, stripRolePrefix } from './lib/router';
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
  const stripped = stripRolePrefix(path);
  if (!canAccess(role as Role, stripped)) return <Navigate to={getRoleHomePath(role as Role)} replace />;
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
  const { user, role } = useAuth();
  if (user) return <Navigate to={getRoleHomePath(role as Role)} replace />;
  return <Navigate to="/login" replace />;
}

function RootIndex() {
  return <AuthRedirect />;
}

function LegacyRedirect() {
  const { user, role } = useAuth();
  const { pathname } = useLocation();

  if (!user) return <Navigate to="/login" replace />;

  const basePath = pathname.split('/').slice(0, 2).join('/');
  const allowedPath = basePath === '' ? '/' : pathname;

  if (!canAccess(role as Role, stripRolePrefix(allowedPath))) {
    return <Navigate to={getRoleHomePath(role as Role)} replace />;
  }

  return <Navigate to={buildRolePath(role as Role, stripRolePrefix(allowedPath))} replace />;
}

const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      { path: '/', element: <RootIndex /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/dashboard', element: <LegacyRedirect /> },
      { path: '/customers', element: <LegacyRedirect /> },
      { path: '/customers/:id', element: <LegacyRedirect /> },
      { path: '/measurements', element: <LegacyRedirect /> },
      { path: '/orders', element: <LegacyRedirect /> },
      { path: '/orders/:id', element: <LegacyRedirect /> },
      { path: '/payments', element: <LegacyRedirect /> },
      { path: '/inventory', element: <LegacyRedirect /> },
      { path: '/staff', element: <LegacyRedirect /> },
      { path: '/reports', element: <LegacyRedirect /> },
      { path: '/settings', element: <LegacyRedirect /> },
      // Admin routes
      {
        path: '/admin/*',
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <RequireAuth path="/dashboard"><DashboardPage /></RequireAuth> },
          { path: 'customers', element: <RequireAuth path="/customers"><CustomersPage /></RequireAuth> },
          { path: 'customers/:id', element: <RequireAuth path="/customers"><CustomerDetailPage /></RequireAuth> },
          { path: 'measurements', element: <RequireAuth path="/measurements"><MeasurementsPage /></RequireAuth> },
          { path: 'orders', element: <RequireAuth path="/orders"><OrdersPage /></RequireAuth> },
          { path: 'orders/:id', element: <RequireAuth path="/orders"><OrderDetailPage /></RequireAuth> },
          { path: 'payments', element: <RequireAuth path="/payments"><PaymentsPage /></RequireAuth> },
          { path: 'inventory', element: <RequireAuth path="/inventory"><InventoryPage /></RequireAuth> },
          { path: 'staff', element: <RequireAuth path="/staff"><StaffPage /></RequireAuth> },
          { path: 'reports', element: <RequireAuth path="/reports"><ReportsPage /></RequireAuth> },
          { path: 'settings', element: <RequireAuth path="/settings"><SettingsPage /></RequireAuth> },
        ],
      },
      // Reception routes
      {
        path: '/reception/*',
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <RequireAuth path="/dashboard"><DashboardPage /></RequireAuth> },
          { path: 'customers', element: <RequireAuth path="/customers"><CustomersPage /></RequireAuth> },
          { path: 'customers/:id', element: <RequireAuth path="/customers"><CustomerDetailPage /></RequireAuth> },
          { path: 'orders', element: <RequireAuth path="/orders"><OrdersPage /></RequireAuth> },
          { path: 'orders/:id', element: <RequireAuth path="/orders"><OrderDetailPage /></RequireAuth> },
          { path: 'payments', element: <RequireAuth path="/payments"><PaymentsPage /></RequireAuth> },
        ],
      },
      // Tailor routes
      {
        path: '/tailor/*',
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <RequireAuth path="/dashboard"><DashboardPage /></RequireAuth> },
          { path: 'measurements', element: <RequireAuth path="/measurements"><MeasurementsPage /></RequireAuth> },
          { path: 'orders', element: <RequireAuth path="/orders"><OrdersPage /></RequireAuth> },
          { path: 'orders/:id', element: <RequireAuth path="/orders"><OrderDetailPage /></RequireAuth> },
        ],
      },
      // Inventory routes
      {
        path: '/inventory/*',
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <RequireAuth path="/dashboard"><DashboardPage /></RequireAuth> },
          { path: 'inventory', element: <RequireAuth path="/inventory"><InventoryPage /></RequireAuth> },
          { path: 'reports', element: <RequireAuth path="/reports"><ReportsPage /></RequireAuth> },
        ],
      },
      // Manager routes
      {
        path: '/manager/*',
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <RequireAuth path="/dashboard"><DashboardPage /></RequireAuth> },
          { path: 'orders', element: <RequireAuth path="/orders"><OrdersPage /></RequireAuth> },
          { path: 'orders/:id', element: <RequireAuth path="/orders"><OrderDetailPage /></RequireAuth> },
          { path: 'payments', element: <RequireAuth path="/payments"><PaymentsPage /></RequireAuth> },
          { path: 'reports', element: <RequireAuth path="/reports"><ReportsPage /></RequireAuth> },
        ],
      },
      { path: '*', element: <LegacyRedirect /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
