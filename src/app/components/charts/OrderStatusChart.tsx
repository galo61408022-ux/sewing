import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Order } from '../../lib/types';

const COLORS: Record<string, string> = {
  Pending: '#94a3b8',
  Cutting: '#3b82f6',
  Sewing: '#6366f1',
  Finishing: '#a855f7',
  Ready: '#22c55e',
  Delivered: '#14b8a6',
  Cancelled: '#ef4444',
};

export function OrderStatusChart({ orders }: { orders: Order[] }) {
  const counts: Record<string, number> = {};
  for (const o of orders) {
    counts[o.status] = (counts[o.status] ?? 0) + 1;
  }
  const data = Object.entries(counts).map(([name, value]) => ({ name, value }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
          {data.map((entry) => (
            <Cell key={entry.name} fill={COLORS[entry.name] ?? '#94a3b8'} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ fontSize: 12, fontFamily: 'var(--font-mono)', borderRadius: 8 }} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, fontFamily: 'var(--font-mono)' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
