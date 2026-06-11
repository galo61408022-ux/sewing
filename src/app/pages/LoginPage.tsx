import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { Scissors, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DEMO_ACCOUNTS = [
  { username: 'admin', password: 'admin123', role: 'Administrator' },
  { username: 'reception', password: 'rec123', role: 'Reception' },
  { username: 'tailor', password: 'tai123', role: 'Tailor' },
  { username: 'inventory', password: 'inv123', role: 'Inventory' },
  { username: 'manager', password: 'mgr123', role: 'Manager' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      const ok = login(username.trim(), password);
      if (ok) {
        navigate('/dashboard');
      } else {
        setError('Invalid username or password.');
        setLoading(false);
      }
    }, 300);
  }

  function useDemo(u: string, p: string) {
    setUsername(u);
    setPassword(p);
    setError('');
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-80 bg-primary text-white p-10 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
              <Scissors size={18} className="text-white" />
            </div>
            <div>
              <div className="text-base leading-none" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>ATI Sewing</div>
              <div className="text-xs text-white/50 mt-0.5">&amp; Fabric</div>
            </div>
          </div>
          <div className="text-3xl leading-tight mb-4" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
            Manage your tailoring business with precision.
          </div>
          <p className="text-sm text-white/60 leading-relaxed">
            Customer records, orders, measurements, inventory, and financials — all in one place.
          </p>
        </div>
        <div className="text-xs text-white/30">
          ATI Sewing &amp; Fabric<br />Khadija Plaza, Yahaya Gusau
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
              <Scissors size={14} className="text-white" />
            </div>
            <span className="text-sm text-foreground" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>ATI Sewing &amp; Fabric</span>
          </div>

          <h2 className="text-2xl text-foreground mb-1" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Sign in</h2>
          <p className="text-sm text-muted-foreground mb-7">Enter your credentials to access the system</p>

          {error && (
            <div className="mb-4 px-3 py-2.5 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-foreground block mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-card border border-border rounded-lg outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
                placeholder="Enter username"
                autoFocus
                required
              />
            </div>
            <div>
              <label className="text-sm text-foreground block mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 pr-10 text-sm bg-card border border-border rounded-lg outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
                  placeholder="Enter password"
                  required
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-8">
            <div className="text-xs text-muted-foreground mb-3 uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)' }}>Demo accounts</div>
            <div className="grid grid-cols-1 gap-1.5">
              {DEMO_ACCOUNTS.map(({ username: u, password: p, role }) => (
                <button
                  key={u}
                  onClick={() => useDemo(u, p)}
                  className="flex items-center justify-between px-3 py-2 text-xs bg-card border border-border rounded-lg hover:border-accent/40 hover:bg-accent/5 transition-colors text-left"
                >
                  <span className="text-foreground" style={{ fontFamily: 'var(--font-mono)' }}>{u}</span>
                  <span className="text-muted-foreground">{role}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
