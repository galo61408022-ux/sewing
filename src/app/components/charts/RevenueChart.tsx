import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getMonthLabel } from '../../lib/utils';
import type { Payment } from '../../lib/types';

interface RevenueChartProps {
  payments: Payment[];
}

export function RevenueChart({ payments }: RevenueChartProps) {
  const data = Array.from({ length: 6 }, (_, i) => {
    const label = getMonthLabel(5 - i);
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const month = d.getMonth();
    const year = d.getFullYear();
    const total = payments
      .filter(p => {
        const pd = new Date(p.date);
        return pd.getMonth() === month && pd.getFullYear() === year;
      })
      .reduce((sum, p) => sum + p.amountPaid, 0);
    return { label, total };
  });

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} barSize={24}>
        <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.05)" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fontFamily: 'var(--font-mono)', fill: '#6b6879' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fontFamily: 'var(--font-mono)', fill: '#6b6879' }} axisLine={false} tickLine={false} tickFormatter={v => `₦${(v/1000).toFixed(0)}k`} />
        <Tooltip
          contentStyle={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 8, fontSize: 12, fontFamily: 'var(--font-mono)' }}
          formatter={(v: number) => [`₦${v.toLocaleString()}`, 'Revenue']}
        />
        <Bar dataKey="total" fill="#c17f3a" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
