import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Printer } from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatDate, formatCurrency } from '../lib/utils';
import { StatusBadge, PriorityBadge } from '../components/ui/Badge';

const STATUS_FLOW = ['Pending', 'Cutting', 'Sewing', 'Finishing', 'Ready', 'Delivered'];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders, customers, staff, payments } = useData();

  const order = orders.find(o => o.id === id);
  const customer = order ? customers.find(c => c.id === order.customerId) : null;
  const tailor = order ? staff.find(s => s.id === order.tailorId) : null;
  const orderPayments = payments.filter(p => p.orderId === id);

  if (!order) {
    return (
      <div className="text-center py-20">
        <div className="text-sm text-muted-foreground">Order not found.</div>
        <button onClick={() => navigate('/orders')} className="mt-3 text-sm text-accent hover:underline">← Back to orders</button>
      </div>
    );
  }

  const statusIdx = STATUS_FLOW.indexOf(order.status);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/orders')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={14} /> Orders
        </button>
        <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-border rounded-lg hover:bg-secondary transition-colors">
          <Printer size={14} /> Print Order
        </button>
      </div>

      {/* Print header */}
      <div className="hidden print:block text-center mb-4">
        <div className="text-lg font-bold">ATI Sewing & Fabric</div>
        <div className="text-sm">Khadija Plaza, Yahaya Gusau | 09011330016 | Atisewing02@gmail.com</div>
        <div className="border-t border-black mt-2 pt-2 text-sm font-bold">ORDER RECEIPT</div>
      </div>

      {/* Header card */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="text-xl text-accent mb-1" style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{order.orderNumber}</div>
            <div className="text-base text-foreground" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{customer?.name ?? '—'}</div>
            <div className="text-sm text-muted-foreground mt-0.5">{customer?.phone}</div>
          </div>
          <div className="flex items-center gap-2">
            <PriorityBadge priority={order.priority} />
            <StatusBadge status={order.status} />
          </div>
        </div>
      </div>

      {/* Progress tracker */}
      <div className="bg-card border border-border rounded-lg p-5">
        <h3 className="text-sm mb-4" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>Progress</h3>
        <div className="flex items-center gap-0 overflow-x-auto pb-2">
          {STATUS_FLOW.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`flex flex-col items-center min-w-[70px] ${i <= statusIdx ? '' : 'opacity-40'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs border-2 ${
                  i < statusIdx ? 'bg-accent border-accent text-white' :
                  i === statusIdx ? 'bg-primary border-primary text-white' :
                  'bg-card border-border text-muted-foreground'
                }`} style={{ fontFamily: 'var(--font-mono)' }}>
                  {i < statusIdx ? '✓' : i + 1}
                </div>
                <div className="text-xs text-muted-foreground mt-1 text-center leading-tight">{s}</div>
              </div>
              {i < STATUS_FLOW.length - 1 && (
                <div className={`w-8 h-0.5 mb-4 ${i < statusIdx ? 'bg-accent' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>
        {order.status === 'Cancelled' && (
          <div className="mt-2 text-sm text-destructive">This order has been cancelled.</div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Order details */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="text-sm mb-4" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>Order Details</h3>
          <div className="space-y-2.5">
            <Row label="Garment Type" value={order.garmentType} />
            <Row label="Fabric Type" value={order.fabricType} />
            <Row label="Quantity" value={String(order.quantity)} mono />
            <Row label="Assigned Tailor" value={tailor?.name ?? 'Unassigned'} />
            <Row label="Collection Date" value={formatDate(order.collectionDate)} />
            <Row label="Order Date" value={formatDate(order.createdAt)} />
            {order.notes && <Row label="Notes" value={order.notes} />}
          </div>
        </div>

        {/* Financials */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="text-sm mb-4" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>Financials</h3>
          <div className="space-y-2.5">
            <Row label="Total Amount" value={formatCurrency(order.amount)} mono />
            <Row label="Advance Paid" value={formatCurrency(order.advancePayment)} mono />
            <div className={`flex justify-between py-2 border-t-2 border-border mt-2 ${order.balance > 0 ? 'text-destructive' : 'text-green-600'}`}>
              <span className="text-sm font-medium">Balance Due</span>
              <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(order.balance)}</span>
            </div>
          </div>

          {orderPayments.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2" style={{ fontFamily: 'var(--font-mono)' }}>Payment History</div>
              {orderPayments.map(p => (
                <div key={p.id} className="flex justify-between text-sm py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground">{formatDate(p.date)} — {p.method}</span>
                  <span className="text-green-600" style={{ fontFamily: 'var(--font-mono)' }}>+{formatCurrency(p.amountPaid)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-start gap-4 py-1 border-b border-border/40">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className={`text-sm text-right ${mono ? '' : ''}`} style={mono ? { fontFamily: 'var(--font-mono)' } : undefined}>{value || '—'}</span>
    </div>
  );
}
