import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS } from '../../lib/permissions';
import type { Role } from '../../lib/types';

interface TopbarProps {
  title: string;
  onMenuClick: () => void;
}

export function Topbar({ title, onMenuClick }: TopbarProps) {
  const { user, role } = useAuth();

  return (
    <header className="h-14 bg-card border-b border-border flex items-center px-4 gap-4 shrink-0">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-1.5 rounded hover:bg-secondary transition-colors"
      >
        <Menu size={18} />
      </button>

      <h1 className="text-base text-foreground flex-1" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
        {title}
      </h1>

      <div className="flex items-center gap-3">
        <button className="p-1.5 rounded hover:bg-secondary transition-colors relative">
          <Bell size={16} className="text-muted-foreground" />
        </button>

        <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-border">
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs shrink-0" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
            {user?.name?.charAt(0) ?? 'U'}
          </div>
          <div>
            <div className="text-xs text-foreground leading-none">{user?.name}</div>
            <div className="text-[10px] text-muted-foreground leading-none mt-0.5">
              {role ? ROLE_LABELS[role as Role] : ''}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
