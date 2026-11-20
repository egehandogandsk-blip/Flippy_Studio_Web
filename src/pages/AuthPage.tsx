import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MatrixBackground } from '../components/MatrixBackground';

export function AuthPage({ initialMode = 'login' }: { initialMode?: 'login' | 'signup' }) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user =
        mode === 'login'
          ? await login(email, password)
          : await register({ name, email, password, company });
      navigate(user.role === 'admin' ? '/admin' : '/account');
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[85vh] items-center justify-center bg-[#040507] px-6 py-16 text-white">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-50">
        <MatrixBackground className="h-full w-full" />
      </div>

      <div className="relative z-10 w-full max-w-md border border-white/15 bg-[#080a0f] p-8 shadow-2xl">
        <div className="mb-6 flex border border-white/15 bg-black/50 p-1 text-xs">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`flex-1 py-2 font-semibold transition-colors ${
              mode === 'login' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError('');
            }}
            className={`flex-1 py-2 font-semibold transition-colors ${
              mode === 'signup' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        <h1 className="text-2xl font-semibold">
          {mode === 'login' ? 'Welcome back to Flippy' : 'Join Flippy Studio'}
        </h1>
        <p className="mt-1 text-xs text-neutral-400">
          {mode === 'login'
            ? 'Access your studio license, downloads, and live-sync tokens.'
            : 'Create your developer account to manage plans and download installers.'}
        </p>

        {error && (
          <div className="mt-4 border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label className="mb-1 block text-xs text-neutral-300">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Mercer"
                  className="w-full border border-white/15 bg-black/60 px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#0047FF]"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-neutral-300">
                  Studio / Company (Optional)
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Branchout Games"
                  className="w-full border border-white/15 bg-black/60 px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#0047FF]"
                />
              </div>
            </>
          )}

          <div>
            <label className="mb-1 block text-xs text-neutral-300">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="developer@studio.com"
              className="w-full border border-white/15 bg-black/60 px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#0047FF]"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-neutral-300">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-white/15 bg-black/60 px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#0047FF]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 bg-[#0047FF] py-3 text-xs font-semibold text-white transition-colors hover:bg-[#0036cc] disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-3.5 w-3.5" />}
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {mode === 'login' && (
          <div className="mt-6 border-t border-white/10 pt-4 font-mono text-[11px] text-neutral-400">
            <p className="text-neutral-300">Demo Accounts:</p>
            <p className="mt-1">Admin: admin@flippy.studio / FlippyAdmin2026!</p>
            <p>User: dev@flippy.studio / FlippyDev2026!</p>
          </div>
        )}
      </div>
    </div>
  );
}
