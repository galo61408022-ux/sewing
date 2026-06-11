import type { OrderStatus, Priority } from '../../lib/types';

const STATUS_STYLES: Record<OrderStatus, string> = {
  Pending: 'bg-gray-100 text-gray-700',
  Cutting: 'bg-blue-100 text-blue-700',
  Sewing: 'bg-indigo-100 text-indigo-700',
  Finishing: 'bg-purple-100 text-purple-700',
  Ready: 'bg-green-100 text-green-700',
  Delivered: 'bg-teal-100 text-teal-700',
  Cancelled: 'bg-red-100 text-red-700',
};

const PRIORITY_STYLES: Record<Priority, string> = {
  Normal: 'bg-gray-100 text-gray-600',
  High: 'bg-orange-100 text-orange-700',
  Urgent: 'bg-red-100 text-red-700',
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${STATUS_STYLES[status]}`} style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${PRIORITY_STYLES[priority]}`} style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
      {priority}
    </span>
  );
}

export function Badge({ label, className }: { label: string; className?: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${className ?? 'bg-secondary text-secondary-foreground'}`} style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
      {label}
    </span>
  );
}
