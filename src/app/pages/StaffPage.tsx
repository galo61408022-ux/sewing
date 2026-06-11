import { useState } from 'react';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Modal } from '../components/ui/Modal';
import { SearchInput } from '../components/ui/SearchInput';
import { formatDate, formatDateTime, generateId } from '../lib/utils';
import { ROLE_LABELS, ROLE_COLORS } from '../lib/permissions';
import type { Staff, Role } from '../lib/types';

const ROLES: Role[] = ['admin', 'reception', 'tailor', 'inventory', 'manager'];
const POSITIONS = ['System Administrator', 'Reception Officer', 'Senior Tailor', 'Junior Tailor', 'Inventory Officer', 'Branch Manager'];

const EMPTY: Omit<Staff, 'id' | 'staffId' | 'createdAt'> = {
  name: '', phone: '', position: '', username: '', password: '', role: 'reception', active: true,
};

export default function StaffPage() {
  const { staff, activityLogs, addStaff, updateStaff, deleteStaff, logActivity } = useData();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'staff' | 'logs'>('staff');
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [selected, setSelected] = useState<Staff | null>(null);
  const [form, setForm] = useState(EMPTY);

  const filteredStaff = staff.filter(s =>
    [s.name, s.staffId, s.username, s.position].some(f => f.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredLogs = activityLogs.slice(0, 50);

  function openAdd() {
    setForm(EMPTY);
    setSelected(null);
    setModal('add');
  }

  function openEdit(s: Staff) {
    const { id, staffId, createdAt, ...rest } = s;
    setForm(rest);
    setSelected(s);
    setModal('edit');
  }

  function handleSave() {
    if (!form.name || !form.username || !form.password) return;
    if (modal === 'add') {
      const staffId = generateId('STF', staff.map(s => s.staffId));
      const newS: Staff = { ...form, id: `s${Date.now()}`, staffId, createdAt: new Date().toISOString().split('T')[0] };
      addStaff(newS);
      logActivity('Added staff', `${staffId} (${form.name})`);
    } else if (selected) {
      updateStaff({ ...selected, ...form });
      logActivity('Updated staff', `${selected.staffId} (${form.name})`);
    }
    setModal(null);
  }

  function toggleActive(s: Staff) {
    updateStaff({ ...s, active: !s.active });
    logActivity(s.active ? 'Deactivated staff' : 'Activated staff', `${s.staffId} (${s.name})`);
  }

  function handleDelete(s: Staff) {
    if (confirm(`Delete staff ${s.name}?`)) {
      deleteStaff(s.id);
      logActivity('Deleted staff', `${s.staffId} (${s.name})`);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex bg-card border border-border rounded-lg p-1">
          <button onClick={() => setTab('staff')} className={`px-3 py-1.5 text-sm rounded transition-colors ${tab === 'staff' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}>
            Staff ({staff.length})
          </button>
          <button onClick={() => setTab('logs')} className={`px-3 py-1.5 text-sm rounded transition-colors ${tab === 'logs' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}>
            Activity Log
          </button>
        </div>
        <SearchInput value={search} onChange={setSearch} placeholder="Search staff…" className="flex-1 max-w-xs" />
        <button onClick={openAdd} className="ml-auto flex items-center gap-1.5 px-3 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
          <Plus size={14} /> Add Staff
        </button>
      </div>

      {tab === 'staff' && (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {['Staff ID', 'Name', 'Position', 'Username', 'Role', 'Status', 'Joined', ''].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs text-muted-foreground uppercase tracking-wide" style={{ fontFamily: 'var(--font-mono)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map(s => (
                  <tr key={s.id} className={`border-b border-border/50 hover:bg-secondary/30 transition-colors ${!s.active ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-3 text-xs text-accent" style={{ fontFamily: 'var(--font-mono)' }}>{s.staffId}</td>
                    <td className="px-4 py-3 text-sm font-medium">{s.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{s.position}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>{s.username}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded ${ROLE_COLORS[s.role]}`} style={{ fontFamily: 'var(--font-mono)' }}>{ROLE_LABELS[s.role]}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded ${s.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`} style={{ fontFamily: 'var(--font-mono)' }}>
                        {s.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>{formatDate(s.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => toggleActive(s)} className={`p-1.5 rounded hover:bg-secondary transition-colors ${s.active ? 'text-green-600' : 'text-muted-foreground'}`} title={s.active ? 'Deactivate' : 'Activate'}>
                          {s.active ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                        </button>
                        <button onClick={() => openEdit(s)} className="p-1.5 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"><Edit2 size={13} /></button>
                        <button onClick={() => handleDelete(s)} className="p-1.5 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredStaff.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">No staff found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'logs' && (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {['Timestamp', 'Staff', 'Action', 'Target'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs text-muted-foreground uppercase tracking-wide" style={{ fontFamily: 'var(--font-mono)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr key={log.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>{formatDateTime(log.timestamp)}</td>
                    <td className="px-4 py-3 text-sm">{log.staffName}</td>
                    <td className="px-4 py-3 text-sm text-accent">{log.action}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{log.target}</td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-10 text-center text-sm text-muted-foreground">No activity logs.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={modal !== null} onClose={() => setModal(null)} title={modal === 'add' ? 'Add Staff Member' : 'Edit Staff Member'} size="md">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="field-label">Full Name *</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input-base" placeholder="Full name" />
          </div>
          <div>
            <label className="field-label">Phone</label>
            <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="input-base" placeholder="08012345678" />
          </div>
          <div>
            <label className="field-label">Position</label>
            <select value={form.position} onChange={e => setForm(p => ({ ...p, position: e.target.value }))} className="input-base">
              <option value="">Select…</option>
              {POSITIONS.map(pos => <option key={pos}>{pos}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">Role</label>
            <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value as Role }))} className="input-base">
              {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">Username *</label>
            <input value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} className="input-base" placeholder="Login username" />
          </div>
          <div>
            <label className="field-label">Password *</label>
            <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className="input-base" placeholder="Password" />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-border">
          <button onClick={() => setModal(null)} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-secondary transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={!form.name || !form.username || !form.password} className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
            {modal === 'add' ? 'Add Staff' : 'Save Changes'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
