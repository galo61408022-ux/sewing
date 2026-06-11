import { useState } from 'react';
import { Printer, Download } from 'lucide-react';
import { useData } from '../context/DataContext';
import { RevenueChart } from '../components/charts/RevenueChart';
import { OrderStatusChart } from '../components/charts/OrderStatusChart';
import { formatDate, formatCurrency, downloadJson } from '../lib/utils';
import { StatusBadge } from '../components/ui/Badge';

type ReportType = 'sales' | 'orders' | 'customers' | 'inventory';
type Period = 'today' | 'week' | 'month' | 'year' | 'custom';

function getPeriodDates(period: Period, from: string, to: string): [Date, Date] {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  if (period === 'today') {
    const start = new Date(now); start.setHours(0, 0, 0, 0);
    return [start, end];
  }
  if (period === 'week') {
    const start = new Date(now); start.setDate(start.getDate() - 7); start.setHours(0, 0, 0, 0);
    return [start, end];
  }
  if (period === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return [start, end];
  }
  if (period === 'year') {
    const start = new Date(now.getFullYear(), 0, 1);
    return [start, end];
  }
  return [from ? new Date(from) : new Date(0), to ? new Date(to + 'T23:59:59') : end];
}

export default function ReportsPage() {
  const { customers, orders, payments, inventory } = useData();
  const [reportType, setReportType] = useState<ReportType>('sales');
  const [period, setPeriod] = useState<Period>('month');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [start, end] = getPeriodDates(period, fromDate, toDate);

  const filteredPayments = payments.filter(p => { const d = new Date(p.date); return d >= start && d <= end; });
  const filteredOrders = orders.filter(o => { const d = new Date(o.createdAt); return d >= start && d <= end; });
  const filteredCustomers = customers.filter(c => { const d = new Date(c.registrationDate); return d >= start && d <= end; });

  const totalRevenue = filteredPayments.reduce((s, p) => s + p.amountPaid, 0);
  const totalOutstanding = filteredPayments.reduce((s, p) => s + p.balance, 0);
  const deliveredOrders = filteredOrders.filter(o => o.status === 'Delivered').length;
  const cancelledOrders = filteredOrders.filter(o => o.status === 'Cancelled').length;

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-secondary rounded-lg p-1 gap-1">
            {(['sales', 'orders', 'customers', 'inventory'] as ReportType[]).map(t => (
              <button key={t} onClick={() => setReportType(t)} className={`px-3 py-1.5 text-sm rounded capitalize transition-colors ${reportType === t ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                {t}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <div className="flex bg-secondary rounded-lg p-1 gap-1">
              {(['today', 'week', 'month', 'year', 'custom'] as Period[]).map(p => (
                <button key={p} onClick={() => setPeriod(p)} className={`px-2.5 py-1.5 text-xs rounded capitalize transition-colors ${period === p ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                  {p}
                </button>
              ))}
            </div>
            {period === 'custom' && (
              <>
                <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="text-sm px-3 py-1.5 bg-card border border-border rounded-lg outline-none focus:border-accent" />
                <span className="text-muted-foreground text-xs">to</span>
                <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="text-sm px-3 py-1.5 bg-card border border-border rounded-lg outline-none focus:border-accent" />
              </>
            )}
            <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-border rounded-lg hover:bg-secondary transition-colors">
              <Printer size={14} /> Print
            </button>
            <button onClick={() => downloadJson({ reportType, period, data: reportType === 'sales' ? filteredPayments : reportType === 'orders' ? filteredOrders : reportType === 'customers' ? filteredCustomers : inventory }, `ati-report-${reportType}.json`)} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-border rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
              <Download size={14} /> Export
            </button>
          </div>
        </div>
      </div>

      {/* Print header */}
      <div className="hidden print:block text-center mb-4">
        <div className="text-lg font-bold">ATI Sewing & Fabric</div>
        <div className="text-sm">Khadija Plaza, Yahaya Gusau | 09011330016</div>
        <div className="text-sm font-bold mt-1 capitalize">{reportType} Report — {period === 'custom' ? `${fromDate} to ${toDate}` : period}</div>
      </div>

      {/* Sales Report */}
      {reportType === 'sales' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <SummaryCard label="Total Collected" value={formatCurrency(totalRevenue)} green />
            <SummaryCard label="Outstanding" value={formatCurrency(totalOutstanding)} red={totalOutstanding > 0} />
            <SummaryCard label="Transactions" value={String(filteredPayments.length)} />
            <SummaryCard label="Avg. Transaction" value={filteredPayments.length > 0 ? formatCurrency(totalRevenue / filteredPayments.length) : '₦0'} />
          </div>
          <div className="bg-card border border-border rounded-lg p-5">
            <h3 className="text-sm mb-4" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>Revenue Trend</h3>
            <RevenueChart payments={payments} />
          </div>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <span className="text-sm text-muted-foreground">{filteredPayments.length} transactions</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {['Invoice', 'Customer', 'Order', 'Paid', 'Balance', 'Method', 'Date'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs text-muted-foreground uppercase tracking-wide" style={{ fontFamily: 'var(--font-mono)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map(p => {
                    const cust = customers.find(c => c.id === p.customerId);
                    const order = orders.find(o => o.id === p.orderId);
                    return (
                      <tr key={p.id} className="border-b border-border/50">
                        <td className="px-4 py-3 text-xs text-accent" style={{ fontFamily: 'var(--font-mono)' }}>{p.invoiceNumber}</td>
                        <td className="px-4 py-3 text-sm">{cust?.name ?? '—'}</td>
                        <td className="px-4 py-3 text-xs" style={{ fontFamily: 'var(--font-mono)' }}>{order?.orderNumber ?? '—'}</td>
                        <td className="px-4 py-3 text-xs text-green-600" style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(p.amountPaid)}</td>
                        <td className={`px-4 py-3 text-xs ${p.balance > 0 ? 'text-destructive' : 'text-muted-foreground'}`} style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(p.balance)}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{p.method}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>{formatDate(p.date)}</td>
                      </tr>
                    );
                  })}
                  {filteredPayments.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">No transactions in this period.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Orders Report */}
      {reportType === 'orders' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <SummaryCard label="Total Orders" value={String(filteredOrders.length)} />
            <SummaryCard label="Delivered" value={String(deliveredOrders)} green />
            <SummaryCard label="Cancelled" value={String(cancelledOrders)} red={cancelledOrders > 0} />
            <SummaryCard label="Total Value" value={formatCurrency(filteredOrders.reduce((s, o) => s + o.amount, 0))} />
          </div>
          <div className="bg-card border border-border rounded-lg p-5">
            <h3 className="text-sm mb-4" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>Order Status Distribution</h3>
            <OrderStatusChart orders={filteredOrders} />
          </div>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {['Order #', 'Customer', 'Garment', 'Amount', 'Collection', 'Status'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs text-muted-foreground uppercase tracking-wide" style={{ fontFamily: 'var(--font-mono)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(o => {
                    const cust = customers.find(c => c.id === o.customerId);
                    return (
                      <tr key={o.id} className="border-b border-border/50">
                        <td className="px-4 py-3 text-xs text-accent" style={{ fontFamily: 'var(--font-mono)' }}>{o.orderNumber}</td>
                        <td className="px-4 py-3 text-sm">{cust?.name ?? '—'}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{o.garmentType}</td>
                        <td className="px-4 py-3 text-xs" style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(o.amount)}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>{formatDate(o.collectionDate)}</td>
                        <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                      </tr>
                    );
                  })}
                  {filteredOrders.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">No orders in this period.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Customers Report */}
      {reportType === 'customers' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <SummaryCard label="New Customers" value={String(filteredCustomers.length)} />
            <SummaryCard label="Total Customers" value={String(customers.length)} />
            <SummaryCard label="Male / Female" value={`${customers.filter(c => c.gender === 'Male').length} / ${customers.filter(c => c.gender === 'Female').length}`} />
          </div>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {['Customer ID', 'Name', 'Phone', 'Gender', 'Registered', 'Orders'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs text-muted-foreground uppercase tracking-wide" style={{ fontFamily: 'var(--font-mono)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map(c => {
                    const custOrders = orders.filter(o => o.customerId === c.id).length;
                    return (
                      <tr key={c.id} className="border-b border-border/50">
                        <td className="px-4 py-3 text-xs text-accent" style={{ fontFamily: 'var(--font-mono)' }}>{c.id}</td>
                        <td className="px-4 py-3 text-sm">{c.name}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>{c.phone}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{c.gender}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>{formatDate(c.registrationDate)}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>{custOrders}</td>
                      </tr>
                    );
                  })}
                  {filteredCustomers.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">No new customers in this period.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Report */}
      {reportType === 'inventory' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <SummaryCard label="Total Items" value={String(inventory.length)} />
            <SummaryCard label="Total Value" value={formatCurrency(inventory.reduce((s, i) => s + i.quantity * i.unitPrice, 0))} />
            <SummaryCard label="Low Stock" value={String(inventory.filter(i => i.quantity <= i.lowStockThreshold).length)} red={inventory.some(i => i.quantity <= i.lowStockThreshold)} />
            <SummaryCard label="Categories" value={String(new Set(inventory.map(i => i.category)).size)} />
          </div>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {['Code', 'Name', 'Category', 'Qty', 'Unit Price', 'Value', 'Status'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs text-muted-foreground uppercase tracking-wide" style={{ fontFamily: 'var(--font-mono)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...inventory].sort((a, b) => a.quantity - b.quantity).map(item => {
                    const isLow = item.quantity <= item.lowStockThreshold;
                    return (
                      <tr key={item.id} className={`border-b border-border/50 ${isLow ? 'bg-destructive/5' : ''}`}>
                        <td className="px-4 py-3 text-xs text-accent" style={{ fontFamily: 'var(--font-mono)' }}>{item.itemCode}</td>
                        <td className="px-4 py-3 text-sm">{item.name}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{item.category}</td>
                        <td className={`px-4 py-3 text-xs ${isLow ? 'text-destructive font-medium' : ''}`} style={{ fontFamily: 'var(--font-mono)' }}>{item.quantity}</td>
                        <td className="px-4 py-3 text-xs" style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(item.unitPrice)}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(item.quantity * item.unitPrice)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded ${isLow ? 'bg-destructive/10 text-destructive' : 'bg-green-100 text-green-700'}`} style={{ fontFamily: 'var(--font-mono)' }}>
                            {isLow ? 'Low Stock' : 'In Stock'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, green, red }: { label: string; value: string; green?: boolean; red?: boolean }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="text-xs text-muted-foreground uppercase mb-1" style={{ fontFamily: 'var(--font-mono)' }}>{label}</div>
      <div className={`text-xl ${green ? 'text-green-600' : red ? 'text-destructive' : 'text-foreground'}`} style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{value}</div>
    </div>
  );
}
