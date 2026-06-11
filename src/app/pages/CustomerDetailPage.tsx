import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Printer } from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatDate, formatCurrency } from '../lib/utils';
import { StatusBadge } from '../components/ui/Badge';

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customers, measurements, orders, payments } = useData();

  const customer = customers.find(c => c.id === id);
  const custMeasurements = measurements.filter(m => m.customerId === id);
  const custOrders = orders.filter(o => o.customerId === id);
  const custPayments = payments.filter(p => p.customerId === id);
  const latestMeasurement = [...custMeasurements].sort((a, b) => b.date.localeCompare(a.date))[0];

  if (!customer) {
    return (
      <div className="text-center py-20">
        <div className="text-sm text-muted-foreground">Customer not found.</div>
        <button onClick={() => navigate('/customers')} className="mt-3 text-sm text-accent hover:underline">← Back to customers</button>
      </div>
    );
  }

  return (
    <div className="space-y-5 print:space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between no-print">
        <button onClick={() => navigate('/customers')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={14} /> Customers
        </button>
        <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-border rounded-lg hover:bg-secondary transition-colors">
          <Printer size={14} /> Print Card
        </button>
      </div>

      {/* Print header */}
      <div className="hidden print:block text-center mb-4">
        <div className="text-lg font-bold">ATI Sewing & Fabric</div>
        <div className="text-sm">Khadija Plaza, Yahaya Gusau | 09011330016 | Atisewing02@gmail.com</div>
        <div className="border-t border-black mt-2 pt-2 text-sm font-bold">CUSTOMER CARD</div>
      </div>

      {/* Profile card */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl text-primary shrink-0" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
            {customer.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xl text-foreground mb-0.5" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{customer.name}</div>
            <div className="text-xs text-accent mb-3" style={{ fontFamily: 'var(--font-mono)' }}>{customer.id}</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm">
              <Info label="Phone" value={customer.phone} mono />
              <Info label="Gender" value={customer.gender} />
              <Info label="Email" value={customer.email || '—'} />
              <Info label="Date of Birth" value={formatDate(customer.dob)} />
              <Info label="Registered" value={formatDate(customer.registrationDate)} />
              <Info label="Address" value={customer.address} />
            </div>
            {customer.stylePreferences && (
              <div className="mt-3 text-sm text-muted-foreground"><span className="text-foreground">Style preferences:</span> {customer.stylePreferences}</div>
            )}
            {customer.remarks && (
              <div className="mt-1 text-sm text-muted-foreground"><span className="text-foreground">Remarks:</span> {customer.remarks}</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Latest measurement */}
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>Latest Measurements</h3>
            <button onClick={() => navigate('/measurements')} className="text-xs text-accent hover:underline">{custMeasurements.length} records</button>
          </div>
          {latestMeasurement ? (
            <div>
              <div className="text-xs text-muted-foreground mb-3" style={{ fontFamily: 'var(--font-mono)' }}>
                {latestMeasurement.garmentType} — {formatDate(latestMeasurement.date)}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(latestMeasurement.fields).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs py-1 border-b border-border/50">
                    <span className="text-muted-foreground">{k}</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{v}"</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground py-4 text-center">No measurements recorded.</div>
          )}
        </div>

        {/* Orders */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="text-sm mb-4" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>Order History ({custOrders.length})</h3>
          {custOrders.length > 0 ? (
            <div className="space-y-2">
              {custOrders.map(o => (
                <button key={o.id} onClick={() => navigate(`/orders/${o.id}`)} className="w-full flex items-center justify-between text-left p-3 rounded-lg border border-border/50 hover:bg-secondary/40 transition-colors">
                  <div>
                    <div className="text-xs text-accent" style={{ fontFamily: 'var(--font-mono)' }}>{o.orderNumber}</div>
                    <div className="text-sm text-foreground">{o.garmentType} — {o.fabricType}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(o.collectionDate)}</div>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={o.status} />
                    <div className="text-xs mt-1" style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(o.amount)}</div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground py-4 text-center">No orders yet.</div>
          )}
        </div>
      </div>

      {/* Payment history */}
      <div className="bg-card border border-border rounded-lg p-5">
        <h3 className="text-sm mb-4" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>Payment History</h3>
        {custPayments.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['Invoice', 'Order', 'Amount Due', 'Paid', 'Balance', 'Method', 'Date'].map(h => (
                  <th key={h} className="text-left pb-2.5 text-xs text-muted-foreground uppercase tracking-wide pr-4" style={{ fontFamily: 'var(--font-mono)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {custPayments.map(p => (
                <tr key={p.id} className="border-b border-border/50">
                  <td className="py-2.5 pr-4 text-xs text-accent" style={{ fontFamily: 'var(--font-mono)' }}>{p.invoiceNumber}</td>
                  <td className="py-2.5 pr-4 text-xs" style={{ fontFamily: 'var(--font-mono)' }}>{orders.find(o => o.id === p.orderId)?.orderNumber ?? '—'}</td>
                  <td className="py-2.5 pr-4 text-xs" style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(p.amountDue)}</td>
                  <td className="py-2.5 pr-4 text-xs text-green-600" style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(p.amountPaid)}</td>
                  <td className={`py-2.5 pr-4 text-xs ${p.balance > 0 ? 'text-destructive' : 'text-muted-foreground'}`} style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(p.balance)}</td>
                  <td className="py-2.5 pr-4 text-xs text-muted-foreground">{p.method}</td>
                  <td className="py-2.5 text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>{formatDate(p.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-sm text-muted-foreground py-4 text-center">No payments recorded.</div>
        )}
      </div>
    </div>
  );
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm text-foreground" style={mono ? { fontFamily: 'var(--font-mono)' } : undefined}>{value || '—'}</div>
    </div>
  );
}
