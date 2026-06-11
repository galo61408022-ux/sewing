import { useState } from 'react';
import { Download, Printer } from 'lucide-react';
import { useData } from '../context/DataContext';
import { RevenueChart } from '../components/charts/RevenueChart';
import { OrderStatusChart } from '../components/charts/OrderStatusChart';
import { StatusBadge } from '../components/ui/Badge';
import { formatDate, formatCurrency, downloadJson } from '../lib/utils';

type ReportType = 'sales' | 'orders' | 'customers' | 'inventory';
type Period = 'today' | 'week' | 'month' | 'year' | 'custom';

function getPeriodDates(period: Period, from: string, to: string): [Date, Date] {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  if (period === 'today') {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return [start, end];
  }

  if (period === 'week') {
    const start = new Date(now);
    start.setDate(start.getDate() - 7);
    start.setHours(0, 0, 0, 0);
    return [start, end];
  }

  if (period === 'month') {
    return [new Date(now.getFullYear(), now.getMonth(), 1), end];
  }

  if (period === 'year') {
    return [new Date(now.getFullYear(), 0, 1), end];
  }

  return [from ? new Date(from) : new Date(0), to ? new Date(`${to}T23:59:59`) : end];
}

export default function ReportsPage() {
  const { customers, orders, payments, inventory } = useData();
  const [reportType, setReportType] = useState<ReportType>('sales');
  const [period, setPeriod] = useState<Period>('month');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [start, end] = getPeriodDates(period, fromDate, toDate);

  const filteredPayments = payments.filter(payment => {
    const d = new Date(payment.date);
    return d >= start && d <= end;
  });

  const filteredOrders = orders.filter(order => {
    const d = new Date(order.createdAt);
    return d >= start && d <= end;
  });

  const filteredCustomers = customers.filter(customer => {
    const d = new Date(customer.registrationDate);
    return d >= start && d <= end;
  });

  const totalRevenue = filteredPayments.reduce((sum, payment) => sum + payment.amountPaid, 0);
  const totalOutstanding = filteredPayments.reduce((sum, payment) => sum + payment.balance, 0);
  const deliveredOrders = filteredOrders.filter(order => order.status === 'Delivered').length;
  const cancelledOrders = filteredOrders.filter(order => order.status === 'Cancelled').length;
  const totalOrderValue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const totalInventoryValue = inventory.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const lowStockCount = inventory.filter(item => item.quantity <= item.lowStockThreshold).length;

  return (
    <div className="space-y-5">
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-secondary rounded-lg p-1 gap-1">
            {(['sales', 'orders', 'customers', 'inventory'] as ReportType[]).map(type => (
              <button
                key={type}
                onClick={() => setReportType(type)}
                className={`px-3 py-1.5 text-sm rounded capitalize transition-colors ${reportType === type ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto flex-wrap">
            <div className="flex bg-secondary rounded-lg p-1 gap-1">
              {(['today', 'week', 'month', 'year', 'custom'] as Period[]).map(item => (
                <button
                  key={item}
                  onClick={() => setPeriod(item)}
                  className={`px-2.5 py-1.5 text-xs rounded capitalize transition-colors ${period === item ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {item}
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

            <button
              onClick={() => downloadJson(
                {
                  reportType,
                  period,
                  data: reportType === 'sales' ? filteredPayments : reportType === 'orders' ? filteredOrders : reportType === 'customers' ? filteredCustomers : inventory,
                },
                `ati-report-${reportType}.json`,
              )}
              className="flex items-center gap-1.5 px-3 py-2 text-sm border border-border rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
            >
              <Download size={14} /> Export
            </button>
          </div>
        </div>
      </div>

      <div className="hidden print:block text-center mb-4">
        <div className="text-lg font-bold">ATI Sewing & Fabric</div>
        <div className="text-sm">Khadija Plaza, Yahaya Gusau | 09011330016</div>
        <div className="text-sm font-bold mt-1 capitalize">{reportType} Report — {period === 'custom' ? `${fromDate} to ${toDate}` : period}</div>
      </div>

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
                    {['Order', 'Paid', 'Balance', 'Method', 'Date', 'Status'].map(header => (
                      <th key={header} className="text-left px-4 py-2.5 text-xs text-muted-foreground uppercase tracking-wide" style={{ fontFamily: 'var(--font-mono)' }}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map(payment => {
                    const order = orders.find(item => item.id === payment.orderId);
                    return (
                      <tr key={payment.id} className="border-b border-border/50">
                        <td className="px-4 py-3 text-xs text-accent" style={{ fontFamily: 'var(--font-mono)' }}>{order?.id ?? payment.orderId}</td>
                        <td className="px-4 py-3 text-xs text-green-600" style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(payment.amountPaid)}</td>
                        <td className={`px-4 py-3 text-xs ${payment.balance > 0 ? 'text-destructive' : 'text-muted-foreground'}`} style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(payment.balance)}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{payment.method}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>{formatDate(payment.date)}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{order ? <StatusBadge status={order.status} /> : '—'}</td>
                      </tr>
                    );
                  })}
                  {filteredPayments.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">No transactions in this period.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {reportType === 'orders' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <SummaryCard label="Total Orders" value={String(filteredOrders.length)} />
            <SummaryCard label="Delivered" value={String(deliveredOrders)} green />
            <SummaryCard label="Cancelled" value={String(cancelledOrders)} red={cancelledOrders > 0} />
            <SummaryCard label="Total Value" value={formatCurrency(totalOrderValue)} />
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
                    {['Order ID', 'Total', 'Collection', 'Status'].map(header => (
                      <th key={header} className="text-left px-4 py-2.5 text-xs text-muted-foreground uppercase tracking-wide" style={{ fontFamily: 'var(--font-mono)' }}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="border-b border-border/50">
                      <td className="px-4 py-3 text-xs text-accent" style={{ fontFamily: 'var(--font-mono)' }}>{order.id}</td>
                      <td className="px-4 py-3 text-xs" style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(order.total)}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>{order.collectionDate ? formatDate(order.collectionDate) : '—'}</td>
                      <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">No orders in this period.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {reportType === 'customers' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <SummaryCard label="New Customers" value={String(filteredCustomers.length)} />
            <SummaryCard label="Total Customers" value={String(customers.length)} />
            <SummaryCard label="Total Orders" value={String(orders.length)} />
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {['Customer ID', 'Name', 'Phone', 'Email', 'Registered', 'Orders'].map(header => (
                      <th key={header} className="text-left px-4 py-2.5 text-xs text-muted-foreground uppercase tracking-wide" style={{ fontFamily: 'var(--font-mono)' }}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map(customer => {
                    const customerOrders = orders.filter(order => order.customerId === customer.id).length;
                    return (
                      <tr key={customer.id} className="border-b border-border/50">
                        <td className="px-4 py-3 text-xs text-accent" style={{ fontFamily: 'var(--font-mono)' }}>{customer.id}</td>
                        <td className="px-4 py-3 text-sm">{customer.name}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>{customer.phone}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{customer.email || '—'}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>{formatDate(customer.registrationDate)}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>{customerOrders}</td>
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

      {reportType === 'inventory' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <SummaryCard label="Total Items" value={String(inventory.length)} />
            <SummaryCard label="Total Value" value={formatCurrency(totalInventoryValue)} />
            <SummaryCard label="Low Stock" value={String(lowStockCount)} red={lowStockCount > 0} />
            <SummaryCard label="Categories" value={String(new Set(inventory.map(item => item.category)).size)} />
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {['Code', 'Name', 'Category', 'Qty', 'Unit Price', 'Value', 'Status'].map(header => (
                      <th key={header} className="text-left px-4 py-2.5 text-xs text-muted-foreground uppercase tracking-wide" style={{ fontFamily: 'var(--font-mono)' }}>{header}</th>
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
                        <td className="px-4 py-3 text-xs" style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(item.quantity * item.unitPrice)}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{isLow ? 'Low stock' : 'OK'}</td>
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