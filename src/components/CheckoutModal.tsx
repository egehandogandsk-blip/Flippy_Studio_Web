import { useEffect, useState } from 'react';
import { X, CreditCard, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import { apiFetch, PricingPlan } from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface CheckoutModalProps {
  plan: PricingPlan | null;
  billingCycle: 'monthly' | 'yearly';
  onClose: () => void;
}

export function CheckoutModal({ plan, billingCycle, onClose }: CheckoutModalProps) {
  const { user, refreshUser } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [currency, setCurrency] = useState('USD');
  const [provider, setProvider] = useState('sandbox');
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [session, setSession] = useState<any>(null);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user]);

  useEffect(() => {
    apiFetch('/api/payments/config')
      .then((res) => {
        setProviders(res.supportedProviders || []);
        setProvider(res.activeProvider || 'sandbox');
      })
      .catch(() => {});
  }, []);

  if (!plan) return null;

  const monthlyPrice = Number(plan.monthly_price || 0);
  const discountedMonthly =
    billingCycle === 'yearly'
      ? monthlyPrice * (1 - (plan.yearly_discount_percent || 20) / 100)
      : monthlyPrice;
  const totalAmount =
    billingCycle === 'yearly' ? (discountedMonthly * 12).toFixed(2) : discountedMonthly.toFixed(2);

  const handleCreateCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiFetch('/api/payments/create-checkout', {
        method: 'POST',
        body: JSON.stringify({
          planSlug: plan.slug,
          billingCycle,
          currency,
          email,
          provider,
        }),
      });
      setSession(res);
    } catch (err: any) {
      setError(err.message || 'Checkout initialization failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSandbox = async () => {
    if (!session?.sessionId) return;
    setLoading(true);
    setError('');
    try {
      await apiFetch('/api/payments/confirm-sandbox', {
        method: 'POST',
        body: JSON.stringify({ sessionId: session.sessionId }),
      });
      setPaid(true);
      await refreshUser();
    } catch (err: any) {
      setError(err.message || 'Payment confirmation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg border border-white/20 bg-[#080a0f] p-6 shadow-2xl sm:p-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-neutral-400 hover:text-white"
          aria-label="Close checkout"
        >
          <X className="h-5 w-5" />
        </button>

        {paid ? (
          <div className="py-6 text-center">
            <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-emerald-400" />
            <h3 className="text-2xl font-semibold text-white">Subscription Activated</h3>
            <p className="mt-2 text-sm text-neutral-400">
              Your <span className="text-white font-medium">{plan.name}</span> ({billingCycle})
              license is now active for <span className="text-[#00C2FF]">{email}</span>.
            </p>
            <p className="mt-3 font-mono text-xs text-neutral-500">
              Session: {session?.sessionId}
            </p>
            <button
              onClick={onClose}
              className="mt-6 w-full bg-white py-3 text-sm font-semibold text-black hover:bg-[#0047FF] hover:text-white transition-colors"
            >
              Done
            </button>
          </div>
        ) : !session ? (
          <form onSubmit={handleCreateCheckout} className="space-y-5">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-[#00C2FF]">
                Flippy Checkout API
              </p>
              <h3 className="mt-1 text-2xl font-semibold text-white">{plan.name}</h3>
              <p className="mt-1 text-xs text-neutral-400">
                Billing: <span className="uppercase text-white">{billingCycle}</span> · Total:{' '}
                <span className="text-white font-semibold">
                  ${totalAmount} {currency}
                </span>
              </p>
            </div>

            {error && (
              <div className="border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-300">
                Account / Receipt Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@studio.com"
                className="w-full border border-white/15 bg-black/60 px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#0047FF]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-neutral-300">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full border border-white/15 bg-black/60 px-3 py-2.5 text-sm text-white outline-none focus:border-[#0047FF]"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="TRY">TRY (₺)</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-neutral-300">
                  Payment Provider
                </label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full border border-white/15 bg-black/60 px-3 py-2.5 text-sm text-white outline-none focus:border-[#0047FF]"
                >
                  {providers.length > 0 ? (
                    providers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.mode})
                      </option>
                    ))
                  ) : (
                    <option value="sandbox">Flippy Sandbox Checkout</option>
                  )}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 border border-white/10 bg-white/[0.02] p-3 text-xs text-neutral-400">
              <ShieldCheck className="h-4 w-4 shrink-0 text-[#00C2FF]" />
              <span>
                Connected to modular payment gateway (`/api/payments/create-checkout` & webhook
                verification).
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 bg-white py-3 text-sm font-semibold text-black transition-colors hover:bg-[#0047FF] hover:text-white disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
              Continue to Payment
            </button>
          </form>
        ) : (
          <div className="space-y-5">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-[#00C2FF]">
                Session Ready · {session.provider.toUpperCase()}
              </p>
              <h3 className="mt-1 text-xl font-semibold text-white">Complete Payment</h3>
              <p className="mt-1 font-mono text-xs text-neutral-400">{session.sessionId}</p>
            </div>

            <div className="border border-white/10 bg-black/60 p-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-400">Plan</span>
                <span className="text-white font-medium">{session.planName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Billing Cycle</span>
                <span className="text-white uppercase">{session.billingCycle}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2">
                <span className="text-neutral-400">Total Due</span>
                <span className="text-lg font-bold text-[#00C2FF]">
                  ${session.amount} {session.currency}
                </span>
              </div>
            </div>

            {error && (
              <div className="border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
                {error}
              </div>
            )}

            <button
              onClick={handleConfirmSandbox}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 bg-[#0047FF] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0036cc] disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirm &amp; Activate License (Sandbox Test)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
