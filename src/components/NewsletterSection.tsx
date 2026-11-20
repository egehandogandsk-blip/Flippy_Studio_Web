import { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { apiFetch } from '../lib/api';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await apiFetch<{ message: string }>('/api/newsletter/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email, source: 'footer_newsletter' }),
      });
      setStatus({ type: 'success', msg: res.message });
      setEmail('');
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message || 'Subscription failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="border-t border-white/10 bg-[#06070b] px-6 py-14 sm:px-10">
      <div className="mx-auto flex max-w-[1380px] flex-col justify-between gap-8 lg:flex-row lg:items-center">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-[#00C2FF]">
            Newsletter &amp; Release Radar
          </p>
          <h3 className="mt-1 text-2xl font-medium text-white">
            Get notified when new Flippy Studio builds &amp; engine plugins drop.
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <div className="flex border border-white/20 bg-black/60 focus-within:border-[#0047FF]">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your studio email..."
              className="flex-1 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 bg-white px-6 py-3 text-xs font-semibold text-black transition-colors hover:bg-[#0047FF] hover:text-white disabled:opacity-50"
            >
              {loading ? 'Joining...' : 'Subscribe'}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          {status && (
            <p
              className={`mt-2 flex items-center gap-1.5 text-xs ${
                status.type === 'success' ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {status.type === 'success' && <CheckCircle2 className="h-3.5 w-3.5" />}
              {status.msg}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
