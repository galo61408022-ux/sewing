import { useState } from 'react';
import { Download, Upload, Scissors, RotateCcw } from 'lucide-react';
import { storage } from '../lib/storage';
import { downloadJson } from '../lib/utils';
import { useData } from '../context/DataContext';

export default function SettingsPage() {
  const { customers, orders, payments, inventory, staff } = useData();
  const [restoreStatus, setRestoreStatus] = useState<'idle' | 'success' | 'error'>('idle');

  function handleBackup() {
    const data = storage.exportAll();
    const filename = `ati-backup-${new Date().toISOString().split('T')[0]}.json`;
    downloadJson(data, filename);
  }

  function handleRestore(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        storage.importAll(data);
        setRestoreStatus('success');
        setTimeout(() => window.location.reload(), 1500);
      } catch {
        setRestoreStatus('error');
      }
    };
    reader.readAsText(file);
  }

  function handleReset() {
    if (confirm('This will delete ALL data and reload the demo data. Are you sure?')) {
      localStorage.clear();
      window.location.reload();
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Business info */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Scissors size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-base text-foreground mb-3" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>ATI Sewing & Fabric</h2>
            <div className="space-y-1.5 text-sm">
              <InfoRow label="Address" value="Khadija Plaza, Yahaya Gusau" />
              <InfoRow label="Phone" value="09011330016" />
              <InfoRow label="Email" value="Atisewing02@gmail.com" />
              <InfoRow label="Industry" value="Tailoring, Fashion Design, Fabric Sales" />
            </div>
          </div>
        </div>
      </div>

      {/* Database summary */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-sm mb-4" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>Database Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatItem label="Customers" value={customers.length} />
          <StatItem label="Orders" value={orders.length} />
          <StatItem label="Payments" value={payments.length} />
          <StatItem label="Inventory Items" value={inventory.length} />
          <StatItem label="Staff Members" value={staff.length} />
        </div>
        <div className="mt-3 text-xs text-muted-foreground">Data is stored locally in this browser. Use backup/restore to transfer data between devices.</div>
      </div>

      {/* Backup & Restore */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-sm mb-4" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>Backup & Restore</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-secondary/50 rounded-lg">
            <Download size={18} className="text-accent mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-medium mb-1">Download Backup</div>
              <div className="text-xs text-muted-foreground mb-3">Export all data as a JSON file. Store this file safely.</div>
              <button onClick={handleBackup} className="flex items-center gap-1.5 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                <Download size={14} /> Download Backup
              </button>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-secondary/50 rounded-lg">
            <Upload size={18} className="text-accent mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-medium mb-1">Restore from Backup</div>
              <div className="text-xs text-muted-foreground mb-3">Upload a previously exported JSON backup file. This will overwrite current data.</div>
              <label className="flex items-center gap-1.5 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer w-fit" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                <Upload size={14} /> Choose Backup File
                <input type="file" accept=".json" onChange={handleRestore} className="hidden" />
              </label>
              {restoreStatus === 'success' && <div className="mt-2 text-xs text-green-600">Restore successful! Reloading…</div>}
              {restoreStatus === 'error' && <div className="mt-2 text-xs text-destructive">Invalid backup file. Please try again.</div>}
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-destructive/5 border border-destructive/10 rounded-lg">
            <RotateCcw size={18} className="text-destructive mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-medium mb-1 text-destructive">Reset to Demo Data</div>
              <div className="text-xs text-muted-foreground mb-3">Clear all current data and reload the original demo data. This cannot be undone.</div>
              <button onClick={handleReset} className="flex items-center gap-1.5 px-4 py-2 text-sm bg-destructive text-white rounded-lg hover:bg-destructive/90 transition-colors" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                <RotateCcw size={14} /> Reset Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Demo credentials */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-sm mb-4" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>Demo Login Credentials</h3>
        <div className="space-y-2">
          {[
            { username: 'admin', password: 'admin123', role: 'Administrator' },
            { username: 'reception', password: 'rec123', role: 'Reception Officer' },
            { username: 'tailor', password: 'tai123', role: 'Tailor' },
            { username: 'inventory', password: 'inv123', role: 'Inventory Officer' },
            { username: 'manager', password: 'mgr123', role: 'Manager' },
          ].map(({ username, password, role }) => (
            <div key={username} className="flex items-center justify-between px-3 py-2 bg-secondary/50 rounded text-sm">
              <span style={{ fontFamily: 'var(--font-mono)' }}>{username} / {password}</span>
              <span className="text-xs text-muted-foreground">{role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="text-muted-foreground w-20 shrink-0">{label}:</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center p-3 bg-secondary/50 rounded-lg">
      <div className="text-lg text-foreground" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
