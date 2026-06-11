import { useState } from 'react';
import { Plus, Edit2, Trash2, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/ui/Modal';
import { SearchInput } from '../components/ui/SearchInput';
import { formatDate, formatCurrency, generateId } from '../lib/utils';
import type { InventoryItem, StockMovement, StockMovementType } from '../lib/types';

const CATEGORIES = ['Damask', 'George', 'Ankara', 'Suiting', 'Traditional', 'Lace', 'Cotton', 'Casual', 'Special'];

const EMPTY_ITEM: Omit<InventoryItem, 'id'> = {
  itemCode: '', name: '', category: 'Cotton', color: '', quantity: 0, unitPrice: 0, supplier: '', lowStockThreshold: 10,
};

export default function InventoryPage() {
  const { inventory, stockMovements, addInventoryItem, updateInventoryItem, deleteInventoryItem, addStockMovement, logActivity } = useData();
  const { role } = useAuth();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [modal, setModal] = useState<'add' | 'edit' | 'move' | 'history' | null>(null);
  const [selected, setSelected] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState(EMPTY_ITEM);
  const [moveForm, setMoveForm] = useState<{ type: StockMovementType; quantity: number; note: string }>({ type: 'in', quantity: 0, note: '' });

  const canEdit = role === 'admin' || role === 'inventory';

  const filtered = inventory.filter(i => {
    const matchSearch = search === '' || [i.name, i.itemCode, i.category, i.color, i.supplier].some(f => f.toLowerCase().includes(search.toLowerCase()));
    const matchCat = filterCat === '' || i.category === filterCat;
    return matchSearch && matchCat;
  });

  const lowStock = inventory.filter(i => i.quantity <= i.lowStockThreshold);
  const totalValue = inventory.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  function openAdd() {
    setForm({ ...EMPTY_ITEM });
    setSelected(null);
    setModal('add');
  }

  function openEdit(item: InventoryItem) {
    const { id, ...rest } = item;
    setForm(rest);
    setSelected(item);
    setModal('edit');
  }

  function openMove(item: InventoryItem) {
    setSelected(item);
    setMoveForm({ type: 'in', quantity: 0, note: '' });
    setModal('move');
  }

  function openHistory(item: InventoryItem) {
    setSelected(item);
    setModal('history');
  }

  function handleSave() {
    if (!form.name) return;
    if (modal === 'add') {
      const itemCode = generateId('FAB', inventory.map(i => i.itemCode));
      const newItem: InventoryItem = { ...form, id: `i${Date.now()}`, itemCode };
      addInventoryItem(newItem);
      logActivity('Added inventory item', `${itemCode} (${form.name})`);
    } else if (selected) {
      updateInventoryItem({ ...selected, ...form });
      logActivity('Updated inventory item', `${selected.itemCode} (${form.name})`);
    }
    setModal(null);
  }

  function handleMove() {
    if (!selected || moveForm.quantity <= 0) return;
    const sm: StockMovement = {
      id: `sm${Date.now()}`,
      itemId: selected.id,
      type: moveForm.type,
      quantity: moveForm.quantity,
      date: new Date().toISOString().split('T')[0],
      note: moveForm.note,
    };
    addStockMovement(sm);
    logActivity(`Stock ${moveForm.type}`, `${selected.itemCode}: ${moveForm.type === 'in' ? '+' : '-'}${moveForm.quantity} yards`);
    setModal(null);
  }

  function handleDelete(item: InventoryItem) {
    if (confirm(`Delete ${item.name}?`)) {
      deleteInventoryItem(item.id);
      logActivity('Deleted inventory item', `${item.itemCode} (${item.name})`);
    }
  }

  const itemHistory = selected ? stockMovements.filter(m => m.itemId === selected.id).sort((a, b) => b.date.localeCompare(a.date)) : [];

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-xs text-muted-foreground uppercase mb-1" style={{ fontFamily: 'var(--font-mono)' }}>Total Items</div>
          <div className="text-xl text-foreground" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{inventory.length}</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-xs text-muted-foreground uppercase mb-1" style={{ fontFamily: 'var(--font-mono)' }}>Inventory Value</div>
          <div className="text-xl text-accent" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{formatCurrency(totalValue)}</div>
        </div>
        <div className={`bg-card border rounded-lg p-4 ${lowStock.length > 0 ? 'border-destructive/30' : 'border-border'}`}>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
            {lowStock.length > 0 && <AlertTriangle size={12} className="text-destructive" />}
            Low Stock
          </div>
          <div className={`text-xl ${lowStock.length > 0 ? 'text-destructive' : 'text-foreground'}`} style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{lowStock.length}</div>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <SearchInput value={search} onChange={setSearch} placeholder="Search fabric name, code, category…" className="flex-1 min-w-48 max-w-xs" />
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="text-sm px-3 py-2 bg-card border border-border rounded-lg outline-none focus:border-accent">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        {canEdit && (
          <button onClick={openAdd} className="flex items-center gap-1.5 px-3 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
            <Plus size={14} /> Add Item
          </button>
        )}
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['Code', 'Fabric Name', 'Category', 'Color', 'Qty (yds)', 'Unit Price', 'Value', 'Supplier', ''].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs text-muted-foreground uppercase tracking-wide" style={{ fontFamily: 'var(--font-mono)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const isLow = item.quantity <= item.lowStockThreshold;
                return (
                  <tr key={item.id} className={`border-b border-border/50 hover:bg-secondary/30 transition-colors ${isLow ? 'bg-destructive/5' : ''}`}>
                    <td className="px-4 py-3 text-xs text-accent" style={{ fontFamily: 'var(--font-mono)' }}>{item.itemCode}</td>
                    <td className="px-4 py-3 text-sm font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{item.category}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{item.color}</td>
                    <td className={`px-4 py-3 text-sm ${isLow ? 'text-destructive font-medium' : ''}`} style={{ fontFamily: 'var(--font-mono)' }}>
                      {item.quantity} {isLow && <AlertTriangle size={11} className="inline ml-1" />}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(item.unitPrice)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(item.quantity * item.unitPrice)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-[140px] truncate">{item.supplier}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {canEdit && (
                          <>
                            <button onClick={() => openMove(item)} className="p-1.5 rounded hover:bg-green-50 transition-colors text-muted-foreground hover:text-green-600" title="Stock movement"><TrendingUp size={13} /></button>
                            <button onClick={() => openEdit(item)} className="p-1.5 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"><Edit2 size={13} /></button>
                          </>
                        )}
                        <button onClick={() => openHistory(item)} className="p-1.5 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground" title="Movement history"><TrendingDown size={13} /></button>
                        {role === 'admin' && <button onClick={() => handleDelete(item)} className="p-1.5 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"><Trash2 size={13} /></button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">No items found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit item modal */}
      <Modal open={modal === 'add' || modal === 'edit'} onClose={() => setModal(null)} title={modal === 'add' ? 'Add Fabric Item' : 'Edit Item'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="field-label">Fabric Name *</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input-base" placeholder="e.g. Premium Damask" />
          </div>
          <div>
            <label className="field-label">Category</label>
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="input-base">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">Color</label>
            <input value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} className="input-base" placeholder="e.g. Ivory White" />
          </div>
          <div>
            <label className="field-label">Quantity (yards)</label>
            <input type="number" min={0} value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: +e.target.value }))} className="input-base" />
          </div>
          <div>
            <label className="field-label">Unit Price (₦/yard)</label>
            <input type="number" min={0} value={form.unitPrice} onChange={e => setForm(p => ({ ...p, unitPrice: +e.target.value }))} className="input-base" />
          </div>
          <div>
            <label className="field-label">Low Stock Threshold</label>
            <input type="number" min={0} value={form.lowStockThreshold} onChange={e => setForm(p => ({ ...p, lowStockThreshold: +e.target.value }))} className="input-base" />
          </div>
          <div className="col-span-2">
            <label className="field-label">Supplier</label>
            <input value={form.supplier} onChange={e => setForm(p => ({ ...p, supplier: e.target.value }))} className="input-base" placeholder="Supplier name" />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-border">
          <button onClick={() => setModal(null)} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-secondary transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={!form.name} className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
            {modal === 'add' ? 'Add Item' : 'Save Changes'}
          </button>
        </div>
      </Modal>

      {/* Stock movement modal */}
      <Modal open={modal === 'move'} onClose={() => setModal(null)} title="Record Stock Movement" size="sm">
        {selected && (
          <div>
            <div className="p-3 bg-secondary/50 rounded-lg mb-4 text-sm">
              <div><span className="text-muted-foreground">Item:</span> <strong>{selected.name}</strong></div>
              <div><span className="text-muted-foreground">Current Stock:</span> <span style={{ fontFamily: 'var(--font-mono)' }}>{selected.quantity} yards</span></div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="field-label">Movement Type</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {(['in', 'out', 'adjustment'] as StockMovementType[]).map(t => (
                    <button key={t} onClick={() => setMoveForm(p => ({ ...p, type: t }))} className={`py-2 text-sm rounded-lg border capitalize transition-colors ${moveForm.type === t ? 'border-accent bg-accent/10 text-accent' : 'border-border hover:border-accent/30'}`}>
                      {t === 'in' ? 'Stock In' : t === 'out' ? 'Stock Out' : 'Adjust'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="field-label">Quantity (yards)</label>
                <input type="number" min={0} value={moveForm.quantity} onChange={e => setMoveForm(p => ({ ...p, quantity: +e.target.value }))} className="input-base" />
              </div>
              <div>
                <label className="field-label">Note</label>
                <input value={moveForm.note} onChange={e => setMoveForm(p => ({ ...p, note: e.target.value }))} className="input-base" placeholder="e.g. Used for ORD-0005" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-border">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-secondary transition-colors">Cancel</button>
              <button onClick={handleMove} disabled={moveForm.quantity <= 0} className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                Record
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* History modal */}
      <Modal open={modal === 'history'} onClose={() => setModal(null)} title={`Movement History: ${selected?.name ?? ''}`} size="md">
        {itemHistory.length > 0 ? (
          <div className="space-y-2">
            {itemHistory.map(sm => (
              <div key={sm.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50">
                <div className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${sm.type === 'in' ? 'bg-green-100 text-green-700' : sm.type === 'out' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                  {sm.type === 'in' ? '+' : sm.type === 'out' ? '−' : '~'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm capitalize">{sm.type === 'in' ? 'Stock In' : sm.type === 'out' ? 'Stock Out' : 'Adjustment'}</div>
                  <div className="text-xs text-muted-foreground truncate">{sm.note || 'No note'}</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${sm.type === 'in' ? 'text-green-600' : sm.type === 'out' ? 'text-red-600' : 'text-blue-600'}`} style={{ fontFamily: 'var(--font-mono)' }}>
                    {sm.type === 'in' ? '+' : sm.type === 'out' ? '−' : ''}{sm.quantity} yds
                  </div>
                  <div className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>{formatDate(sm.date)}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground">No movement history.</div>
        )}
      </Modal>
    </div>
  );
}
