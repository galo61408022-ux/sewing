import { useState } from 'react';
import { Plus, Eye, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useRoleNav } from '../lib/useRoleNav';
import { Modal } from '../components/ui/Modal';
import { SearchInput } from '../components/ui/SearchInput';
import { StatusBadge, PriorityBadge } from '../components/ui/badge';
import { formatDate, formatCurrency, generateId, isOverdue, isDueToday } from '../lib/utils';
import type { Order, OrderStatus, Priority, GarmentType } from '../lib/types';

const STATUSES: OrderStatus[] = ['Pending', 'Cutting', 'Sewing', 'Finishing', 'Ready', 'Delivered', 'Cancelled'];
const PRIORITIES: Priority[] = ['Normal', 'High', 'Urgent'];
const GARMENTS: GarmentType[] = ['Native Wear', 'Trouser', 'Agbada', 'Suit'];

const EMPTY_FORM = {
  customerId: '', garmentType: 'Native Wear' as GarmentType, fabricType: '', quantity: 1,
  amount: 0, advancePayment: 0, balance: 0, collectionDate: '',
  tailorId: '', priority: 'Normal' as Priority, status: 'Pending' as OrderStatus, notes: '',
};

export default function OrdersPage() {
  const { customers, orders, staff, addOrder, updateOrder, deleteOrder, logActivity } = useData();
  const { role } = useAuth();
  const navigate = useNavigate();
  const toRole = useRoleNav();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modal, setModal] = useState<'add' | 'edit' | 'status' | null>(null);
  const [selected, setSelected] = useState<Order | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [newStatus, setNewStatus] = useState<OrderStatus>('Pending');

  const tailors = staff.filter(s => s.role === 'tailor' && s.active);
  const canEdit = role === 'admin' || role === 'reception';

  const filtered = orders.filter(o => {
    const cust = customers.find(c => c.id === o.customerId);
    const matchSearch = search === '' || [o.orderNumber, cust?.name ?? '', o.garmentType, o.fabricType].some(f => f.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = filterStatus === '' || o.status === filterStatus;
    return matchSearch && matchStatus;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  function openAdd() {
    setForm(EMPTY_FORM);
    setSelected(null);
    setModal('add');
  }

  function openEdit(o: Order) {
    const { id, orderNumber, createdAt, ...rest } = o;
    setForm(rest);
    setSelected(o);
    setModal('edit');
  }

  function handleAmountChange(field: 'amount' | 'advancePayment', val: number) {
    setForm(p => {
      const next = { ...p, [field]: val };
      next.balance = next.amount - next.advancePayment;
      return next;
    });
  }

  function handleSave() {
    if (!form.customerId || !form.collectionDate) return;
    if (modal === 'add') {
      const orderNumber = generateId('ORD', orders.map(o => o.orderNumber));
      const newO: Order = { ...form, id: `o${Date.now()}`, orderNumber, createdAt: new Date().toISOString().split('T')[0], balance: form.amount - form.advancePayment };
      addOrder(newO);
      logActivity('Created order', orderNumber);
    } else if (selected) {
      updateOrder({ ...selected, ...form, balance: form.amount - form.advancePayment });
      logActivity('Updated order', selected.orderNumber);
    }
    setModal(null);
  }

  function handleStatusUpdate() {
    if (!selected) return;
    updateOrder({ ...selected, status: newStatus });
    logActivity('Updated order status', `${selected.orderNumber}: ${selected.status} → ${newStatus}`);
    setModal(null);
  }

  function handleDelete(o: Order) {
    if (confirm(`Delete order ${o.orderNumber}?`)) {
      deleteOrder(o.id);
      logActivity('Deleted order', o.orderNumber);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <SearchInput value={search} onChange={setSearch} placeholder="Search order, customer, fabric…" className="flex-1 min-w-48 max-w-xs" />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-sm px-3 py-2 bg-card border border-border rounded-lg outline-none focus:border-accent">
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        {canEdit && (
          <button onClick={openAdd} className="flex items-center gap-1.5 px-3 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
            <Plus size={14} /> New Order
          </button>
        )}
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <span className="text-sm text-muted-foreground">{filtered.length} orders</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['Order #', 'Customer', 'Garment', 'Amount', 'Balance', 'Collection', 'Tailor', 'Priority', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-3 py-2.5 text-xs text-muted-foreground uppercase tracking-wide" style={{ fontFamily: 'var(--font-mono)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => {
                const cust = customers.find(c => c.id === o.customerId);
                const tailor = staff.find(s => s.id === o.tailorId);
                const overdue = isOverdue(o.collectionDate, o.status);
                const dueT = isDueToday(o.collectionDate);
                return (
                  <tr key={o.id} className={`border-b border-border/50 hover:bg-secondary/30 transition-colors ${overdue ? 'bg-destructive/5' : ''}`}>
                    <td className="px-3 py-3 text-xs text-accent" style={{ fontFamily: 'var(--font-mono)' }}>{o.orderNumber}</td>
                    <td className="px-3 py-3 text-sm max-w-[140px]">
                      <div className="truncate">{cust?.name ?? '—'}</div>
                      <div className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>{o.customerId}</div>
                    </td>
                    <td className="px-3 py-3 text-sm text-muted-foreground">{o.garmentType}</td>
                    <td className="px-3 py-3 text-xs" style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(o.amount)}</td>
                    <td className={`px-3 py-3 text-xs ${o.balance > 0 ? 'text-destructive' : 'text-muted-foreground'}`} style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(o.balance)}</td>
                    <td className={`px-3 py-3 text-xs ${overdue ? 'text-destructive' : dueT ? 'text-orange-600' : 'text-muted-foreground'}`} style={{ fontFamily: 'var(--font-mono)' }}>
                      {formatDate(o.collectionDate)}{overdue && ' ⚠'}{dueT && ' ⏰'}
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground max-w-[100px] truncate">{tailor?.name?.split(' ')[0] ?? '—'}</td>
                    <td className="px-3 py-3"><PriorityBadge priority={o.priority} /></td>
                    <td className="px-3 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => navigate(toRole(`/orders/${o.id}`))} className="p-1.5 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"><Eye size={13} /></button>
                        {(canEdit || role === 'tailor') && (
                          <button onClick={() => { setSelected(o); setNewStatus(o.status); setModal('status'); }} className="p-1.5 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground text-xs px-2" title="Update status">↑</button>
                        )}
                        {canEdit && <button onClick={() => openEdit(o)} className="p-1.5 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"><Edit2 size={13} /></button>}
                        {role === 'admin' && <button onClick={() => handleDelete(o)} className="p-1.5 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"><Trash2 size={13} /></button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="px-4 py-10 text-center text-sm text-muted-foreground">No orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit modal */}
      <Modal open={modal === 'add' || modal === 'edit'} onClose={() => setModal(null)} title={modal === 'add' ? 'New Order' : 'Edit Order'} size="xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="sm:col-span-2 lg:col-span-2">
            <label className="field-label">Customer *</label>
            <select value={form.customerId} onChange={e => setForm(p => ({ ...p, customerId: e.target.value }))} className="input-base">
              <option value="">Select customer…</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.id})</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">Garment Type</label>
            <select value={form.garmentType} onChange={e => setForm(p => ({ ...p, garmentType: e.target.value as GarmentType }))} className="input-base">
              {GARMENTS.map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">Fabric Type</label>
            <input value={form.fabricType} onChange={e => setForm(p => ({ ...p, fabricType: e.target.value }))} className="input-base" placeholder="e.g. Premium Damask" />
          </div>
          <div>
            <label className="field-label">Quantity</label>
            <input type="number" min={1} value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: +e.target.value }))} className="input-base" />
          </div>
          <div>
            <label className="field-label">Total Amount (₦)</label>
            <input type="number" min={0} value={form.amount} onChange={e => handleAmountChange('amount', +e.target.value)} className="input-base" />
          </div>
          <div>
            <label className="field-label">Advance Payment (₦)</label>
            <input type="number" min={0} value={form.advancePayment} onChange={e => handleAmountChange('advancePayment', +e.target.value)} className="input-base" />
          </div>
          <div>
            <label className="field-label">Balance (₦)</label>
            <input type="number" readOnly value={form.amount - form.advancePayment} className="input-base bg-secondary/50 text-muted-foreground" />
          </div>
          <div>
            <label className="field-label">Collection Date *</label>
            <input type="date" value={form.collectionDate} onChange={e => setForm(p => ({ ...p, collectionDate: e.target.value }))} className="input-base" />
          </div>
          <div>
            <label className="field-label">Assigned Tailor</label>
            <select value={form.tailorId} onChange={e => setForm(p => ({ ...p, tailorId: e.target.value }))} className="input-base">
              <option value="">Unassigned</option>
              {tailors.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">Priority</label>
            <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value as Priority }))} className="input-base">
              {PRIORITIES.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          {modal === 'edit' && (
            <div>
              <label className="field-label">Status</label>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as OrderStatus }))} className="input-base">
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          )}
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="field-label">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className="input-base resize-none" rows={2} placeholder="Special instructions, embroidery details, etc." />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-border">
          <button onClick={() => setModal(null)} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-secondary transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={!form.customerId || !form.collectionDate} className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
            {modal === 'add' ? 'Create Order' : 'Save Changes'}
          </button>
        </div>
      </Modal>

      {/* Status update modal */}
      <Modal open={modal === 'status'} onClose={() => setModal(null)} title="Update Order Status" size="sm">
        {selected && (
          <div>
            <div className="text-sm text-muted-foreground mb-4">Order: <span className="text-accent font-medium" style={{ fontFamily: 'var(--font-mono)' }}>{selected.orderNumber}</span></div>
            <div className="space-y-2">
              {STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => setNewStatus(s)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${newStatus === s ? 'border-accent bg-accent/5 text-accent' : 'border-border hover:border-accent/30 hover:bg-secondary/40'}`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-border">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-secondary transition-colors">Cancel</button>
              <button onClick={handleStatusUpdate} className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>Update Status</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
