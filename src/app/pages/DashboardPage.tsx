import { Users, ShoppingBag, Clock, CheckCircle, TrendingUp, AlertCircle, Package } from 'lucide-react';
import { StatCard } from '../components/ui/StatCard';
import { RevenueChart } from '../components/charts/RevenueChart';
import { OrderStatusChart } from '../components/charts/OrderStatusChart';
import { InventoryChart } from '../components/charts/InventoryChart';
import { StatusBadge, PriorityBadge } from '../components/ui/Badge';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { canAccess } from '../lib/permissions';
import type { Role } from '../lib/types';
import { formatCurrency, formatDate, isDueToday, isOverdue } from '../lib/utils';
import { useRoleNav } from '../lib/useRoleNav';
import { useNavigate } from 'react-router';

export default function DashboardPage() {
  const { customers, orders, payments, inventory } = useData();
  const { role } = useAuth();
  const navigate = useNavigate();
  const toRole = useRoleNav();

  const totalSales = payments.reduce((s, p) => s + p.amountPaid, 0);
  const outstanding = payments.reduce((s, p) => s + p.balance, 0);
  const dueToday = orders.filter(o => isDueToday(o.collectionDate) && !['Delivered', 'Cancelled'].includes(o.status));
  const readyOrders = orders.filter(o => o.status === 'Ready');
  const lowStock = inventory.filter(i => i.quantity <= i.lowStockThreshold);
  const activeOrders = orders.filter(o => !['Delivered', 'Cancelled'].includes(o.status));
  const canOpenInventory = role ? canAccess(role as Role, '/inventory') : false;

  const recent = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);

  return (
    <div className="space-y-6">
      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard label="Total Customers" value={customers.length} icon={Users} />
        <StatCard label="Active Orders" value={activeOrders.length} icon={ShoppingBag} />
        <StatCard label="Due Today" value={dueToday.length} icon={Clock} warning={dueToday.length > 0} />
        <StatCard label="Ready for Pickup" value={readyOrders.length} icon={CheckCircle} accent={readyOrders.length > 0} />
        <StatCard label="Total Revenue" value={formatCurrency(totalSales)} icon={TrendingUp} accent sub="all time" />
        <StatCard label="Outstanding" value={formatCurrency(outstanding)} icon={AlertCircle} warning={outstanding > 0} sub="balance due" />
        <StatCard label="Low Stock Items" value={lowStock.length} icon={Package} warning={lowStock.length > 0} sub="need restocking" />
        <StatCard label="Total Orders" value={orders.length} icon={ShoppingBag} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-5 lg:col-span-1">
          <h3 className="text-sm mb-4" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>Monthly Revenue</h3>
          <RevenueChart payments={payments} />
        </div>
        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="text-sm mb-4" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>Order Status</h3>
          <OrderStatusChart orders={orders} />
        </div>
        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="text-sm mb-4" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>Inventory Levels</h3>
          <InventoryChart inventory={inventory} />
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-card border border-border rounded-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-sm" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>Recent Orders</h3>
          <button onClick={() => navigate(toRole('/orders'))} className="text-xs text-accent hover:underline">View all</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['Order #', 'Customer', 'Garment', 'Amount', 'Collection', 'Priority', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs text-muted-foreground uppercase tracking-wide" style={{ fontFamily: 'var(--font-mono)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map(order => {
                const customer = customers.find(c => c.id === order.customerId);
                const overdue = isOverdue(order.collectionDate, order.status);
                return (
                  <tr
                    key={order.id}
                    onClick={() => navigate(toRole(`/orders/${order.id}`))}
                    className="border-b border-border/50 hover:bg-secondary/40 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 text-xs text-accent" style={{ fontFamily: 'var(--font-mono)' }}>{order.orderNumber}</td>
                    <td className="px-4 py-3 text-sm">{customer?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{order.garmentType}</td>
                    <td className="px-4 py-3 text-sm" style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(order.amount)}</td>
                    <td className={`px-4 py-3 text-xs ${overdue ? 'text-destructive' : 'text-muted-foreground'}`} style={{ fontFamily: 'var(--font-mono)' }}>
                      {formatDate(order.collectionDate)}
                      {overdue && ' ⚠'}
                    </td>
                    <td className="px-4 py-3"><PriorityBadge priority={order.priority} /></td>
                    <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {recent.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">No orders yet.</div>
          )}
        </div>
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && canOpenInventory && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
          <div className="text-sm text-destructive mb-2" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>Low Stock Alert</div>
          <div className="flex flex-wrap gap-2">
            {lowStock.map(item => (
              <button key={item.id} onClick={() => navigate(toRole('/inventory'))} className="text-xs px-3 py-1.5 bg-white border border-destructive/20 rounded-full text-destructive hover:bg-destructive/5 transition-colors" style={{ fontFamily: 'var(--font-mono)' }}>
                {item.name} — {item.quantity} left
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
