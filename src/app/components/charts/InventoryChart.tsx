import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { InventoryItem } from '../../lib/types';

export function InventoryChart({ inventory }: { inventory: InventoryItem[] }) {
  const top = [...inventory]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 8)
    .map(item => ({
      name: item.name.length > 12 ? item.name.slice(0, 12) + '…' : item.name,
      qty: item.quantity,
      low: item.quantity <= item.lowStockThreshold,
    }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={top} layout="vertical" barSize={14}>
        <XAxis type="number" tick={{ fontSize: 11, fontFamily: 'var(--font-mono)', fill: '#6b6879' }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: '#6b6879' }} axisLine={false} tickLine={false} width={90} />
        <Tooltip contentStyle={{ fontSize: 12, fontFamily: 'var(--font-mono)', borderRadius: 8 }} formatter={(v: number) => [v + ' yards', 'Stock']} />
        <Bar dataKey="qty" radius={[0, 4, 4, 0]}>
          {top.map((entry, i) => (
            <Cell key={i} fill={entry.low ? '#c94040' : '#2d7d8f'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
