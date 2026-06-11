import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: boolean;
  warning?: boolean;
  sub?: string;
}

export function StatCard({ label, value, icon: Icon, accent, warning, sub }: StatCardProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
        accent ? 'bg-accent/10 text-accent' :
        warning ? 'bg-destructive/10 text-destructive' :
        'bg-primary/10 text-primary'
      }`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1" style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
          {label}
        </div>
        <div className="text-2xl text-foreground leading-none" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
          {value}
        </div>
        {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
      </div>
    </div>
  );
}
