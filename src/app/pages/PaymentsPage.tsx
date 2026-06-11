import { useState } from 'react';
import { Plus, Printer } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/ui/Modal';
import { SearchInput } from '../components/ui/SearchInput';
import { formatDate, formatCurrency, generateId } from '../lib/utils';
import type { Payment, PaymentMethod } from '../lib/types';

const METHODS: PaymentMethod[] = ['Cash', 'Transfer', 'POS'];

export default function PaymentsPage() {
  const { customers, orders, payments, addPayment, logActivity } = useData();
  const { role } = useAuth();
  const [search, setSearch] = useState('');
  const [filterMethod, setFilterMethod] = useState('');
  const [modal, setModal] = useState<'add' | 'receipt' | null>(null);
  const [selected, setSelected] = useState<Payment | null>(null);
  const [form, setForm] = useState({ orderId: '', amountPaid: 0, method: 'Cash' as PaymentMethod, date: new Date().toISOString().split('T')[0], notes: '' });

  const canAdd = role === 'admin' || role === 'reception';

  const filtered = payments.filter(p => {
    const cust = customers.find(c => c.id === p.customerId);
    const matchSearch = search === '' || [p.invoiceNumber, cust?.name ?? '', p.method].some(f => f.toLowerCase().includes(search.toLowerCase()));
    const matchMethod = filterMethod === '' || p.method === filterMethod;
    return matchSearch && matchMethod;
  }).sort((a, b) => b.date.localeCompare(a.date));

  const selectedOrder = orders.find(o => o.id === form.orderId);
  const selectedCustomer = selectedOrder ? customers.find(c => c.id === selectedOrder.customerId) : null;

  function openAdd() {
    setForm({ orderId: '', amountPaid: 0, method: 'Cash', date: new Date().toISOString().split('T')[0], notes: '' });
    setModal('add');
  }

  function handleOrderChange(orderId: string) {
    const order = orders.find(o => o.id === orderId);
    setForm(p => ({ ...p, orderId, amountPaid: order ? order.balance : 0 }));
  }

  function handleSave() {
    if (!form.orderId || form.amountPaid <= 0) return;
    const order = orders.find(o => o.id === form.orderId);
    if (!order) return;
    const invoiceNumber = generateId('INV', payments.map(p => p.invoiceNumber));
    const newBalance = Math.max(0, order.balance - form.amountPaid);
    const newP: Payment = {
      id: `p${Date.now()}`,
      invoiceNumber,
      customerId: order.customerId,
      orderId: form.orderId,
      amountDue: order.amount,
      amountPaid: form.amountPaid,
      balance: newBalance,
      method: form.method,
      date: form.date,
      notes: form.notes,
    };
    addPayment(newP);
    logActivity('Recorded payment', `${invoiceNumber} for ${order.orderNumber}`);
    setSelected(newP);
    setModal('receipt');
  }

  const totalRevenue = payments.reduce((s, p) => s + p.amountPaid, 0);
  const totalOutstanding = payments.reduce((s, p) => s + p.balance, 0);

  return (
    <div className="space-y-4">
      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-xs text-muted-foreground uppercase mb-1" style={{ fontFamily: 'var(--font-mono)' }}>Total Collected</div>
          <div className="text-xl text-green-600" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{formatCurrency(totalRevenue)}</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-xs text-muted-foreground uppercase mb-1" style={{ fontFamily: 'var(--font-mono)' }}>Outstanding Balance</div>
          <div className={`text-xl ${totalOutstanding > 0 ? 'text-destructive' : 'text-muted-foreground'}`} style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{formatCurrency(totalOutstanding)}</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-xs text-muted-foreground uppercase mb-1" style={{ fontFamily: 'var(--font-mono)' }}>Invoices</div>
          <div className="text-xl text-foreground" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{payments.length}</div>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <SearchInput value={search} onChange={setSearch} placeholder="Search invoice, customer, method…" className="flex-1 min-w-48 max-w-xs" />
        <select value={filterMethod} onChange={e => setFilterMethod(e.target.value)} className="text-sm px-3 py-2 bg-card border border-border rounded-lg outline-none focus:border-accent">
          <option value="">All Methods</option>
          {METHODS.map(m => <option key={m}>{m}</option>)}
        </select>
        {canAdd && (
          <button onClick={openAdd} className="flex items-center gap-1.5 px-3 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
            <Plus size={14} /> Record Payment
          </button>
        )}
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['Invoice', 'Customer', 'Order', 'Due', 'Paid', 'Balance', 'Method', 'Date', ''].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs text-muted-foreground uppercase tracking-wide" style={{ fontFamily: 'var(--font-mono)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const cust = customers.find(c => c.id === p.customerId);
                const order = orders.find(o => o.id === p.orderId);
                return (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 text-xs text-accent" style={{ fontFamily: 'var(--font-mono)' }}>{p.invoiceNumber}</td>
                    <td className="px-4 py-3 text-sm">{cust?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>{order?.orderNumber ?? '—'}</td>
                    <td className="px-4 py-3 text-xs" style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(p.amountDue)}</td>
                    <td className="px-4 py-3 text-xs text-green-600" style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(p.amountPaid)}</td>
                    <td className={`px-4 py-3 text-xs ${p.balance > 0 ? 'text-destructive' : 'text-muted-foreground'}`} style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(p.balance)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{p.method}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>{formatDate(p.date)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => { setSelected(p); setModal('receipt'); }} className="p-1.5 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"><Printer size={13} /></button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">No payments found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add payment modal */}
      <Modal open={modal === 'add'} onClose={() => setModal(null)} title="Record Payment" size="md">
        <div className="space-y-4">
          <div>
            <label className="field-label">Order *</label>
            <select value={form.orderId} onChange={e => handleOrderChange(e.target.value)} className="input-base">
              <option value="">Select order…</option>
              {orders.filter(o => o.balance > 0).map(o => {
                const cust = customers.find(c => c.id === o.customerId);
                return <option key={o.id} value={o.id}>{o.orderNumber} — {cust?.name} (Balance: ₦{o.balance.toLocaleString()})</option>;
              })}
            </select>
          </div>
          {selectedOrder && (
            <div className="p-3 bg-secondary/50 rounded-lg text-sm space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">Customer</span><span>{selectedCustomer?.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Total Amount</span><span style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(selectedOrder.amount)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Balance Due</span><span className="text-destructive" style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(selectedOrder.balance)}</span></div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">Amount Paid (₦) *</label>
              <input type="number" min={0} value={form.amountPaid} onChange={e => setForm(p => ({ ...p, amountPaid: +e.target.value }))} className="input-base" />
            </div>
            <div>
              <label className="field-label">Payment Method</label>
              <select value={form.method} onChange={e => setForm(p => ({ ...p, method: e.target.value as PaymentMethod }))} className="input-base">
                {METHODS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Date</label>
              <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="input-base" />
            </div>
          </div>
          <div>
            <label className="field-label">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className="input-base resize-none" rows={2} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-border">
          <button onClick={() => setModal(null)} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-secondary transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={!form.orderId || form.amountPaid <= 0} className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
            Record Payment
          </button>
        </div>
      </Modal>

      {/* Receipt modal */}
      <Modal open={modal === 'receipt' && selected !== null} onClose={() => setModal(null)} title="Payment Receipt" size="sm">
        {selected && (() => {
          const cust = customers.find(c => c.id === selected.customerId);
          const order = orders.find(o => o.id === selected.orderId);
          return (
            <div>
              <div className="text-center mb-5 pb-4 border-b border-border">
                <div className="font-bold">ATI Sewing & Fabric</div>
                <div className="text-xs text-muted-foreground">Khadija Plaza, Yahaya Gusau</div>
                <div className="text-xs text-muted-foreground">09011330016 | Atisewing02@gmail.com</div>
                <div className="text-sm font-bold mt-2">PAYMENT RECEIPT</div>
              </div>
              <div className="space-y-2 text-sm">
                <ReceiptRow label="Invoice" value={selected.invoiceNumber} mono />
                <ReceiptRow label="Date" value={formatDate(selected.date)} />
                <ReceiptRow label="Customer" value={cust?.name ?? '—'} />
                <ReceiptRow label="Phone" value={cust?.phone ?? '—'} mono />
                <ReceiptRow label="Order" value={order?.orderNumber ?? '—'} mono />
                <ReceiptRow label="Garment" value={order?.garmentType ?? '—'} />
                <div className="border-t border-border my-3" />
                <ReceiptRow label="Amount Due" value={formatCurrency(selected.amountDue)} mono />
                <ReceiptRow label="Amount Paid" value={formatCurrency(selected.amountPaid)} mono green />
                <ReceiptRow label="Balance" value={formatCurrency(selected.balance)} mono red={selected.balance > 0} />
                <ReceiptRow label="Method" value={selected.method} />
              </div>
              <div className="mt-4 text-xs text-center text-muted-foreground border-t border-border pt-3">
                Thank you for your patronage!
              </div>
              <div className="flex justify-end mt-4">
                <button onClick={() => window.print()} className="flex items-center gap-1.5 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                  <Printer size={14} /> Print Receipt
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}

function ReceiptRow({ label, value, mono, green, red }: { label: string; value: string; mono?: boolean; green?: boolean; red?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`${green ? 'text-green-600' : red ? 'text-destructive' : ''}`} style={mono ? { fontFamily: 'var(--font-mono)' } : undefined}>{value}</span>
    </div>
  );
}
