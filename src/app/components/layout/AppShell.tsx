import { useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

const TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/customers': 'Customers',
  '/measurements': 'Measurements',
  '/orders': 'Orders',
  '/payments': 'Payments & Invoices',
  '/inventory': 'Fabric Inventory',
  '/staff': 'Staff Management',
  '/reports': 'Reports',
  '/settings': 'Settings',
};

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const base = '/' + pathname.split('/')[1];
  const title = TITLES[base] ?? 'ATI Sewing & Fabric';

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-5 lg:p-6 max-w-[1400px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
