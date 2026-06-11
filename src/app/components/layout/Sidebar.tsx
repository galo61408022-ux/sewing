import { NavLink, useNavigate } from 'react-router';
import {
  LayoutDashboard, Users, Ruler, ShoppingBag, CreditCard,
  Package, UserCog, BarChart3, Settings, LogOut, Scissors
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { canAccess, ROLE_LABELS } from '../../lib/permissions';
import { buildRolePath } from '../../lib/router';
import type { Role } from '../../lib/types';

const NAV = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/measurements', label: 'Measurements', icon: Ruler },
  { path: '/orders', label: 'Orders', icon: ShoppingBag },
  { path: '/payments', label: 'Payments', icon: CreditCard },
  { path: '/inventory', label: 'Inventory', icon: Package },
  { path: '/staff', label: 'Staff', icon: UserCog },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const accessibleNav = NAV.filter(item => canAccess(role as Role, item.path));

  return (
    <aside className="flex flex-col h-full bg-sidebar text-sidebar-foreground w-60 shrink-0">
      <div className="px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-accent flex items-center justify-center shrink-0">
            <Scissors size={16} className="text-white" />
          </div>
          <div>
            <div className="text-sm leading-none text-black" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>ATI Sewing</div>
            <div className="text-[10px] text-black/70 mt-0.5 leading-none">&amp; Fabric</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {accessibleNav.map(({ path, label, icon: Icon }) => {
          const fullPath = buildRolePath(role as Role, path);
          return (
            <NavLink
              key={path}
              to={fullPath}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded text-sm mb-0.5 transition-colors ${
                  isActive
                    ? 'bg-sidebar-accent text-black border-l-2 border-accent pl-[10px]'
                    : 'text-black/70 hover:bg-black/25 hover:text-black'
                }`
              }
            >
              <Icon size={16} className="shrink-0" />
              {label}
            </NavLink>
          );
        })}
      </nav>

      <div className="px-3 py-3 border-t border-sidebar-border">
        <div className="flex items-center gap-2.5 px-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs shrink-0" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
            {user?.name?.charAt(0) ?? 'U'}
          </div>
          <div className="min-w-0">
            <div className="text-xs text-black truncate">{user?.name}</div>
            <div className="text-[10px] text-black/60 truncate">{role ? ROLE_LABELS[role as Role] : ''}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-black/60 hover:bg-sidebar-accent/60 hover:text-black transition-colors"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
}