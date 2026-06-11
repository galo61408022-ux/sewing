import { useState, type ReactNode } from 'react';
import { Plus, Edit2, Trash2, Eye, Download } from 'lucide-react';
import { useNavigate } from 'react-router';
import { SearchInput } from '../components/ui/SearchInput';
import { Modal } from '../components/ui/Modal';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useRoleNav } from '../lib/useRoleNav';
import { formatDate, generateId, downloadJson } from '../lib/utils';
import type { Customer } from '../lib/types';

const EMPTY: Omit<Customer, 'id' | 'registrationDate'> = {
  name: '', phone: '', address: '', gender: 'Male', dob: '', email: '', photo: '', remarks: '', stylePreferences: '',
};

export default function CustomersPage() {
  const { customers, addCustomer, updateCustomer, deleteCustomer, logActivity } = useData();
  const { role } = useAuth();
  const navigate = useNavigate();
  const toRole = useRoleNav();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [form, setForm] = useState<Omit<Customer, 'id' | 'registrationDate'>>(EMPTY);

  const filtered = customers.filter(c =>
    [c.name, c.phone, c.id, c.email, c.address].some(f => f.toLowerCase().includes(search.toLowerCase()))
  );

  function openAdd() {
    setForm(EMPTY);
    setSelected(null);
    setModal('add');
  }

  function openEdit(c: Customer) {
    const { id, registrationDate, ...rest } = c;
    setForm(rest);
    setSelected(c);
    setModal('edit');
  }

  function handleSave() {
    if (!form.name || !form.phone) return;
    if (modal === 'add') {
      const id = generateId('ATI', customers.map(c => c.id));
      const newC: Customer = { ...form, id, registrationDate: new Date().toISOString().split('T')[0] };
      addCustomer(newC);
      logActivity('Created customer', `${id} (${form.name})`);
    } else if (selected) {
      updateCustomer({ ...selected, ...form });
      logActivity('Updated customer', `${selected.id} (${form.name})`);
    }
    setModal(null);
  }

  function handleDelete(c: Customer) {
    if (confirm(`Delete customer ${c.name}? This cannot be undone.`)) {
      deleteCustomer(c.id);
      logActivity('Deleted customer', `${c.id} (${c.name})`);
    }
  }

  const canEdit = role === 'admin' || role === 'reception';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name, phone, ID…" className="flex-1 min-w-48 max-w-xs" />
        <div className="ml-auto flex gap-2">
          <button onClick={() => downloadJson(customers, 'customers-export.json')} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-border rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
            <Download size={14} /> Export
          </button>
          {canEdit && (
            <button onClick={openAdd} className="flex items-center gap-1.5 px-3 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
              <Plus size={14} /> Add Customer
            </button>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{filtered.length} customers</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['Customer ID', 'Name', 'Phone', 'Gender', 'Address', 'Registered', ''].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs text-muted-foreground uppercase tracking-wide" style={{ fontFamily: 'var(--font-mono)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 text-xs text-accent" style={{ fontFamily: 'var(--font-mono)' }}>{c.id}</td>
                  <td className="px-4 py-3 text-sm font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>{c.phone}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{c.gender}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground max-w-[180px] truncate">{c.address}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>{formatDate(c.registrationDate)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => navigate(toRole(`/customers/${c.id}`))} className="p-1.5 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"><Eye size={13} /></button>
                      {canEdit && <button onClick={() => openEdit(c)} className="p-1.5 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"><Edit2 size={13} /></button>}
                      {role === 'admin' && <button onClick={() => handleDelete(c)} className="p-1.5 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"><Trash2 size={13} /></button>}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">No customers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal !== null} onClose={() => setModal(null)} title={modal === 'add' ? 'Add Customer' : 'Edit Customer'} size="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full Name *" required>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input-base" placeholder="Customer full name" />
          </Field>
          <Field label="Phone *" required>
            <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="input-base" placeholder="08012345678" />
          </Field>
          <Field label="Email">
            <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="input-base" placeholder="email@example.com" />
          </Field>
          <Field label="Gender">
            <select value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value as Customer['gender'] }))} className="input-base">
              <option>Male</option>
              <option>Female</option>
            </select>
          </Field>
          <Field label="Date of Birth">
            <input type="date" value={form.dob} onChange={e => setForm(p => ({ ...p, dob: e.target.value }))} className="input-base" />
          </Field>
          <Field label="Address">
            <input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} className="input-base" placeholder="Street, Area" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Style Preferences">
              <input value={form.stylePreferences} onChange={e => setForm(p => ({ ...p, stylePreferences: e.target.value }))} className="input-base" placeholder="e.g. Agbada, Corporate suits" />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Remarks">
              <textarea value={form.remarks} onChange={e => setForm(p => ({ ...p, remarks: e.target.value }))} className="input-base resize-none" rows={2} placeholder="Any special notes about this customer" />
            </Field>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-border">
          <button onClick={() => setModal(null)} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-secondary transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={!form.name || !form.phone} className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
            {modal === 'add' ? 'Add Customer' : 'Save Changes'}
          </button>
        </div>
      </Modal>
    </div>
  );
}

function Field({ label, children, required }: { label: string; children: ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide" style={{ fontFamily: 'var(--font-mono)' }}>
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
