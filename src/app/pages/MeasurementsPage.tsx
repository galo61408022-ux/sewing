import { useState } from 'react';
import { Plus, Edit2, Trash2, Printer } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/ui/Modal';
import { SearchInput } from '../components/ui/SearchInput';
import { formatDate } from '../lib/utils';
import type { Measurement, GarmentType } from '../lib/types';

const GARMENT_FIELDS: Record<GarmentType, string[]> = {
  'Native Wear': ['Chest', 'Waist', 'Hip', 'Shoulder', 'Sleeve', 'Length', 'Neck'],
  'Trouser': ['Waist', 'Hip', 'Inseam', 'Thigh', 'Knee', 'Bottom'],
  'Agbada': ['Chest', 'Waist', 'Hip', 'Shoulder', 'Sleeve', 'Length', 'Kaftan Length'],
  'Suit': ['Chest', 'Waist', 'Hip', 'Shoulder', 'Sleeve', 'Jacket Length', 'Trouser Waist', 'Trouser Length'],
};

const GARMENT_TYPES: GarmentType[] = ['Native Wear', 'Trouser', 'Agbada', 'Suit'];

export default function MeasurementsPage() {
  const { customers, measurements, addMeasurement, updateMeasurement, deleteMeasurement, logActivity } = useData();
  const { role } = useAuth();
  const [search, setSearch] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('');
  const [modal, setModal] = useState<'add' | 'edit' | 'view' | null>(null);
  const [selected, setSelected] = useState<Measurement | null>(null);
  const [form, setForm] = useState<{ customerId: string; garmentType: GarmentType; date: string; fields: Record<string, string>; notes: string }>({
    customerId: '', garmentType: 'Native Wear', date: new Date().toISOString().split('T')[0], fields: {}, notes: '',
  });

  const canEdit = role === 'admin' || role === 'reception' || role === 'tailor';

  const filtered = measurements.filter(m => {
    const cust = customers.find(c => c.id === m.customerId);
    const matchSearch = search === '' || cust?.name.toLowerCase().includes(search.toLowerCase()) || m.garmentType.toLowerCase().includes(search.toLowerCase());
    const matchCust = filterCustomer === '' || m.customerId === filterCustomer;
    return matchSearch && matchCust;
  });

  function openAdd() {
    setForm({ customerId: filterCustomer || '', garmentType: 'Native Wear', date: new Date().toISOString().split('T')[0], fields: {}, notes: '' });
    setSelected(null);
    setModal('add');
  }

  function openEdit(m: Measurement) {
    setForm({ customerId: m.customerId, garmentType: m.garmentType, date: m.date, fields: { ...m.fields }, notes: m.notes });
    setSelected(m);
    setModal('edit');
  }

  function handleGarmentChange(gt: GarmentType) {
    setForm(p => ({ ...p, garmentType: gt, fields: {} }));
  }

  function handleFieldChange(field: string, value: string) {
    setForm(p => ({ ...p, fields: { ...p.fields, [field]: value } }));
  }

  function handleSave() {
    if (!form.customerId) return;
    const cust = customers.find(c => c.id === form.customerId);
    if (modal === 'add') {
      const newM: Measurement = { id: `m${Date.now()}`, ...form };
      addMeasurement(newM);
      logActivity('Recorded measurement', `${form.garmentType} for ${cust?.name}`);
    } else if (selected) {
      updateMeasurement({ ...selected, ...form });
      logActivity('Updated measurement', `${form.garmentType} for ${cust?.name}`);
    }
    setModal(null);
  }

  function handleDelete(m: Measurement) {
    if (confirm('Delete this measurement record?')) {
      deleteMeasurement(m.id);
      logActivity('Deleted measurement', m.id);
    }
  }

  const fields = GARMENT_FIELDS[form.garmentType];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <SearchInput value={search} onChange={setSearch} placeholder="Search customer or garment type…" className="flex-1 min-w-48 max-w-xs" />
        <select value={filterCustomer} onChange={e => setFilterCustomer(e.target.value)} className="text-sm px-3 py-2 bg-card border border-border rounded-lg outline-none focus:border-accent">
          <option value="">All Customers</option>
          {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {canEdit && (
          <button onClick={openAdd} className="flex items-center gap-1.5 px-3 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
            <Plus size={14} /> Add Measurement
          </button>
        )}
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <span className="text-sm text-muted-foreground">{filtered.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['Customer', 'Garment Type', 'Date', 'Key Measurements', ''].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs text-muted-foreground uppercase tracking-wide" style={{ fontFamily: 'var(--font-mono)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => {
                const cust = customers.find(c => c.id === m.customerId);
                const keyFields = Object.entries(m.fields).slice(0, 3);
                return (
                  <tr key={m.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium">{cust?.name ?? '—'}</div>
                      <div className="text-xs text-accent" style={{ fontFamily: 'var(--font-mono)' }}>{m.customerId}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">{m.garmentType}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>{formatDate(m.date)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {keyFields.map(([k, v]) => (
                          <span key={k} className="text-xs px-2 py-0.5 bg-secondary rounded" style={{ fontFamily: 'var(--font-mono)' }}>{k}: {v}"</span>
                        ))}
                        {Object.keys(m.fields).length > 3 && (
                          <span className="text-xs text-muted-foreground">+{Object.keys(m.fields).length - 3} more</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setSelected(m); setModal('view'); }} className="p-1.5 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"><Printer size={13} /></button>
                        {canEdit && <button onClick={() => openEdit(m)} className="p-1.5 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"><Edit2 size={13} /></button>}
                        {role === 'admin' && <button onClick={() => handleDelete(m)} className="p-1.5 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"><Trash2 size={13} /></button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">No measurements found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit modal */}
      <Modal open={modal === 'add' || modal === 'edit'} onClose={() => setModal(null)} title={modal === 'add' ? 'Add Measurement' : 'Edit Measurement'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">Customer *</label>
              <select value={form.customerId} onChange={e => setForm(p => ({ ...p, customerId: e.target.value }))} className="input-base">
                <option value="">Select customer…</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.id})</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Garment Type</label>
              <select value={form.garmentType} onChange={e => handleGarmentChange(e.target.value as GarmentType)} className="input-base">
                {GARMENT_TYPES.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Date</label>
              <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="input-base" />
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-3" style={{ fontFamily: 'var(--font-mono)' }}>Measurements (in inches)</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {fields.map(f => (
                <div key={f}>
                  <label className="text-xs text-muted-foreground block mb-1">{f}</label>
                  <input
                    type="number"
                    step="0.5"
                    value={form.fields[f] ?? ''}
                    onChange={e => handleFieldChange(f, e.target.value)}
                    className="input-base"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="field-label">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className="input-base resize-none" rows={2} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-border">
          <button onClick={() => setModal(null)} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-secondary transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={!form.customerId} className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
            Save
          </button>
        </div>
      </Modal>

      {/* View/Print modal */}
      <Modal open={modal === 'view' && selected !== null} onClose={() => setModal(null)} title="Measurement Card" size="md">
        {selected && (() => {
          const cust = customers.find(c => c.id === selected.customerId);
          return (
            <div>
              <div className="text-center mb-5 pb-4 border-b border-border">
                <div className="text-sm font-bold">ATI Sewing & Fabric</div>
                <div className="text-xs text-muted-foreground">Khadija Plaza, Yahaya Gusau | 09011330016</div>
                <div className="text-xs font-bold mt-2">MEASUREMENT CARD</div>
              </div>
              <div className="flex justify-between text-sm mb-4">
                <div><span className="text-muted-foreground">Customer:</span> <strong>{cust?.name}</strong></div>
                <div className="text-xs text-accent" style={{ fontFamily: 'var(--font-mono)' }}>{selected.customerId}</div>
              </div>
              <div className="flex justify-between text-sm mb-4">
                <div><span className="text-muted-foreground">Garment:</span> {selected.garmentType}</div>
                <div className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>{formatDate(selected.date)}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(selected.fields).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm py-1.5 border-b border-border/50">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="font-medium" style={{ fontFamily: 'var(--font-mono)' }}>{v}"</span>
                  </div>
                ))}
              </div>
              {selected.notes && <div className="mt-3 text-sm text-muted-foreground">Notes: {selected.notes}</div>}
              <div className="flex justify-end mt-5">
                <button onClick={() => window.print()} className="flex items-center gap-1.5 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                  <Printer size={14} /> Print
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
