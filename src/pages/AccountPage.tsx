import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Copy,
  Cpu,
  CreditCard,
  Download,
  Eye,
  EyeOff,
  Key,
  LogOut,
  MessageSquarePlus,
  RefreshCw,
  Save,
  Settings,
  Shield,
  Terminal,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch, PricingPlan } from '../lib/api';
import { CheckoutModal } from '../components/CheckoutModal';
import { MatrixBackground } from '../components/MatrixBackground';

type AccountTab = 'overview' | 'billing' | 'settings' | 'feedback';

interface UserSettings {
  preferred_engine: string;
  ws_port: number;
  sync_protocol: string;
  auto_atlas_pot: number;
  nine_slice_auto: number;
  ai_style_lock: number;
  vcs_integration: string;
  release_channel: string;
  email_notifications: number;
  api_key: string;
}

const PLAN_QUOTAS: Record<string, { tokens: string; projects: string; engines: string }> = {
  freemium: { tokens: '200 / mo', projects: '1 Project', engines: 'Unity (Basic)' },
  'indie-starter': { tokens: '1,500 / mo', projects: '3 Projects', engines: 'Unity + Live Sync' },
  'studio-pro': { tokens: '5,000 / mo', projects: '5 Projects', engines: 'Unity, Unreal, Godot' },
  enterprise: { tokens: 'Unlimited', projects: 'Unlimited', engines: 'All + On-Premise API' },
  'ai-token-pack': { tokens: '6,000 Pack', projects: 'Add-on', engines: 'All' },
  'custom-model': { tokens: 'Custom', projects: 'Unlimited', engines: 'Dedicated Cluster' },
};

export function AccountPage() {
  const { user, loading, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState<AccountTab>('overview');
  const [orders, setOrders] = useState<any[]>([]);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [techSettings, setTechSettings] = useState<UserSettings | null>(null);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);

  // UI states
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [copiedText, setCopiedText] = useState('');

  // Billing / Upgrade / Downgrade states
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [checkoutPlan, setCheckoutPlan] = useState<PricingPlan | null>(null);
  const [downgradeTarget, setDowngradeTarget] = useState<PricingPlan | null>(null);
  const [planLoading, setPlanLoading] = useState(false);

  // Profile & Password states
  const [profileName, setProfileName] = useState('');
  const [profileCompany, setProfileCompany] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Feedback form states
  const [fbCategory, setFbCategory] = useState('bug');
  const [fbEngine, setFbEngine] = useState('unity');
  const [fbSeverity, setFbSeverity] = useState('medium');
  const [fbVersion, setFbVersion] = useState('v0.9.4-beta');
  const [fbTitle, setFbTitle] = useState('');
  const [fbDesc, setFbDesc] = useState('');

  const notify = (msg: string) => {
    setError('');
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [loading, user, navigate]);

  const loadAccountData = async () => {
    if (!user) return;
    setProfileName(user.name);
    setProfileCompany(user.company || '');
    setBillingCycle(user.billing_cycle || 'monthly');

    try {
      const [ordRes, planRes, setRes, fbRes] = await Promise.all([
        apiFetch<{ orders: any[] }>('/api/payments/my-orders'),
        apiFetch<{ plans: PricingPlan[] }>('/api/plans'),
        apiFetch<{ settings: UserSettings }>('/api/auth/settings'),
        apiFetch<{ feedbacks: any[] }>('/api/feedback/my'),
      ]);
      setOrders(ordRes.orders || []);
      setPlans(planRes.plans || []);
      setTechSettings(setRes.settings);
      setFeedbacks(fbRes.feedbacks || []);
    } catch {
      // handled
    }
  };

  useEffect(() => {
    if (user) {
      loadAccountData();
    }
  }, [user?.id]);

  if (loading || !user) return null;

  const currentPlanObj = plans.find((p) => p.slug === user.plan_slug);
  const currentPrice = Number(currentPlanObj?.monthly_price || 0);
  const quota = PLAN_QUOTAS[user.plan_slug] || PLAN_QUOTAS.freemium;

  const copyToClipboard = (label: string, val: string) => {
    navigator.clipboard?.writeText(val);
    setCopiedText(label);
    setTimeout(() => setCopiedText(''), 1800);
  };

  const handlePlanAction = async (target: PricingPlan) => {
    if (target.is_custom) {
      navigate('/contact');
      return;
    }
    const targetPrice = Number(target.monthly_price || 0);
    if (targetPrice > currentPrice) {
      setCheckoutPlan(target);
      return;
    }
    // Downgrade or cycle change -> show explicit confirmation
    setDowngradeTarget(target);
  };

  const confirmDowngrade = async () => {
    if (!downgradeTarget) return;
    setPlanLoading(true);
    setError('');
    try {
      const res = await apiFetch<{ message: string }>('/api/payments/change-plan', {
        method: 'POST',
        body: JSON.stringify({
          targetPlanSlug: downgradeTarget.slug,
          billingCycle,
        }),
      });
      setDowngradeTarget(null);
      await refreshUser();
      await loadAccountData();
      notify(res.message);
    } catch (err: any) {
      setError(err.message || 'Plan change failed.');
    } finally {
      setPlanLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/api/auth/me', {
        method: 'PATCH',
        body: JSON.stringify({ name: profileName, company: profileCompany }),
      });
      await refreshUser();
      notify('Profile updated.');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiFetch<{ message: string }>('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setCurrentPassword('');
      setNewPassword('');
      notify(res.message);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSaveTechSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!techSettings) return;
    try {
      const res = await apiFetch<{ settings: UserSettings }>('/api/auth/settings', {
        method: 'PUT',
        body: JSON.stringify(techSettings),
      });
      setTechSettings(res.settings);
      notify('Technical Live-Sync settings saved.');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRotateKey = async () => {
    try {
      const res = await apiFetch<{ api_key: string }>('/api/auth/rotate-key', {
        method: 'POST',
      });
      if (techSettings) {
        setTechSettings({ ...techSettings, api_key: res.api_key });
      }
      notify('New Live-Sync API key generated.');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiFetch<{ message: string }>('/api/feedback', {
        method: 'POST',
        body: JSON.stringify({
          category: fbCategory,
          engine: fbEngine,
          severity: fbSeverity,
          app_version: fbVersion,
          title: fbTitle,
          description: fbDesc,
        }),
      });
      setFbTitle('');
      setFbDesc('');
      notify(res.message);
      loadAccountData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const cliCommand = `flippy-cli connect --port ${techSettings?.ws_port || 9420} --engine ${
    techSettings?.preferred_engine || 'unity'
  } --protocol ${techSettings?.sync_protocol || 'protobuf'}`;

  return (
    <div className="relative min-h-screen bg-[#040507] px-6 py-12 text-white sm:px-10">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-40">
        <MatrixBackground className="h-full w-full" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1380px] space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-[#00C2FF]">
              Flippy Developer Console · {user.plan_slug.toUpperCase()}
            </p>
            <h1 className="mt-1 text-3xl font-semibold">{user.name}</h1>
            <p className="text-xs text-neutral-400">
              {user.email} {user.company ? `· ${user.company}` : ''} · Member since{' '}
              {user.created_at?.slice(0, 10)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {user.role === 'admin' && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 bg-[#0047FF] px-4 py-2 text-xs font-semibold text-white"
              >
                <Shield className="h-3.5 w-3.5" />
                Admin Panel
              </Link>
            )}
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="inline-flex items-center gap-1.5 border border-white/20 px-4 py-2 text-xs font-medium text-neutral-300 hover:border-white hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Notifications */}
        {toast && (
          <div className="flex items-center gap-2 border border-emerald-500/40 bg-emerald-500/15 px-4 py-3 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{toast}</span>
          </div>
        )}
        {error && (
          <div className="border border-red-500/40 bg-red-500/15 px-4 py-3 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
          {[
            { id: 'overview', label: 'Overview & Telemetry', icon: Activity },
            { id: 'billing', label: 'Plan, Upgrade / Downgrade', icon: CreditCard },
            { id: 'settings', label: 'Technical Settings', icon: Settings },
            { id: 'feedback', label: `Feedback & Bugs (${feedbacks.length})`, icon: MessageSquarePlus },
          ].map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id as AccountTab)}
                className={`inline-flex items-center gap-2 border px-4 py-2.5 text-xs font-medium transition-colors ${
                  active
                    ? 'border-[#0047FF] bg-[#0047FF] text-white'
                    : 'border-white/15 bg-[#080a0f] text-neutral-300 hover:border-white/35'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW & TELEMETRY */}
        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid gap-5 md:grid-cols-3">
              <div className="corner-fold-blue border border-white/15 bg-[#080a0f] p-6">
                <p className="font-mono text-xs text-neutral-400">ACTIVE LICENSE TIER</p>
                <div className="mt-2 text-2xl font-semibold uppercase text-white">
                  {currentPlanObj?.name || user.plan_slug}
                </div>
                <p className="mt-1 font-mono text-xs text-[#00C2FF]">
                  {user.billing_cycle.toUpperCase()} · ${currentPrice}/mo
                </p>
                <button
                  onClick={() => setTab('billing')}
                  className="mt-5 inline-flex items-center gap-1.5 bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-[#0047FF] hover:text-white"
                >
                  Upgrade / Downgrade Plan
                </button>
              </div>

              <div className="border border-white/15 bg-[#080a0f] p-6">
                <p className="font-mono text-xs text-neutral-400">AI &amp; PROJECT QUOTAS</p>
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">AI Generation Tokens</span>
                    <span className="font-mono text-white">{quota.tokens}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Active Game Projects</span>
                    <span className="font-mono text-white">{quota.projects}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Engine Bridges</span>
                    <span className="font-mono text-[#00C2FF]">{quota.engines}</span>
                  </div>
                </div>
              </div>

              <div className="border border-white/15 bg-[#080a0f] p-6">
                <p className="font-mono text-xs text-neutral-400">LIVE-SYNC DAEMON</p>
                <div className="mt-2 flex items-center gap-2 text-lg font-semibold text-white">
                  <Cpu className="h-4 w-4 text-emerald-400" />
                  <span className="uppercase">{techSettings?.preferred_engine || 'unity'}</span>
                </div>
                <p className="mt-1 font-mono text-xs text-neutral-400">
                  ws://127.0.0.1:{techSettings?.ws_port || 9420}/sync ·{' '}
                  {techSettings?.sync_protocol?.toUpperCase() || 'PROTOBUF'}
                </p>
                <Link
                  to="/download"
                  className="mt-5 inline-flex items-center gap-1.5 border border-white/25 px-4 py-2 text-xs font-semibold text-white hover:border-[#00C2FF]"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download Installers
                </Link>
              </div>
            </div>

            {/* CLI & API Key Technical Box */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="border border-white/15 bg-[#080a0f] p-6">
                <div className="mb-3 flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 font-mono text-xs text-[#00C2FF]">
                    <Key className="h-3.5 w-3.5" />
                    FLIPPY LIVE-SYNC API KEY
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowKey((v) => !v)}
                      className="text-xs text-neutral-400 hover:text-white"
                    >
                      {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={handleRotateKey}
                      className="inline-flex items-center gap-1 border border-white/15 px-2.5 py-1 font-mono text-[10px] text-neutral-300 hover:border-[#00C2FF]"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Rotate
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between border border-white/10 bg-black/70 px-3.5 py-2.5 font-mono text-xs">
                  <span className="truncate text-neutral-200">
                    {showKey
                      ? techSettings?.api_key || 'loading...'
                      : 'flp_live_••••••••••••••••••••••••••••'}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('key', techSettings?.api_key || '')}
                    className="ml-3 text-neutral-400 hover:text-[#00C2FF]"
                  >
                    {copiedText === 'key' ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="border border-white/15 bg-[#080a0f] p-6">
                <div className="mb-3 flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 font-mono text-xs text-[#00C2FF]">
                    <Terminal className="h-3.5 w-3.5" />
                    CLI BRIDGE QUICK-CONNECT
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('cli', cliCommand)}
                    className="inline-flex items-center gap-1 font-mono text-[10px] text-neutral-400 hover:text-white"
                  >
                    {copiedText === 'cli' ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    Copy
                  </button>
                </div>
                <div className="overflow-x-auto border border-white/10 bg-black/70 px-3.5 py-2.5 font-mono text-xs text-emerald-400">
                  $ {cliCommand}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PLAN & BILLING (CLEAR UPGRADE / DOWNGRADE) */}
        {tab === 'billing' && (
          <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border border-white/15 bg-[#080a0f] p-6">
              <div>
                <h2 className="text-xl font-semibold">Manage Subscription Tier</h2>
                <p className="mt-1 text-xs text-neutral-400">
                  Current Plan:{' '}
                  <span className="font-semibold uppercase text-white">
                    {currentPlanObj?.name || user.plan_slug}
                  </span>{' '}
                  ({user.billing_cycle}). Select any tier below to Upgrade or Downgrade.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-xs ${billingCycle === 'monthly' ? 'text-white' : 'text-neutral-500'}`}>
                  Monthly
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setBillingCycle((c) => (c === 'monthly' ? 'yearly' : 'monthly'))
                  }
                  className="relative inline-flex h-6 w-12 items-center rounded-full border border-white/25 bg-black p-0.5"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      billingCycle === 'yearly' ? 'translate-x-6 bg-[#00C2FF]' : 'translate-x-0.5'
                    }`}
                  />
                </button>
                <span className={`text-xs ${billingCycle === 'yearly' ? 'text-white' : 'text-neutral-500'}`}>
                  Yearly (20% OFF)
                </span>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {plans.map((p) => {
                const isCurrent = p.slug === user.plan_slug && billingCycle === user.billing_cycle;
                const isSamePlanDiffCycle =
                  p.slug === user.plan_slug && billingCycle !== user.billing_cycle;
                const pPrice = Number(p.monthly_price || 0);
                const isUpgrade = pPrice > currentPrice;
                const isDowngrade = pPrice < currentPrice && !p.is_custom;
                const effective =
                  billingCycle === 'yearly'
                    ? (pPrice * (1 - (p.yearly_discount_percent || 20) / 100)).toFixed(2)
                    : pPrice;

                return (
                  <div
                    key={p.id}
                    className={`flex flex-col justify-between border p-6 ${
                      p.slug === user.plan_slug
                        ? 'border-[#00C2FF] bg-[#091229]/60'
                        : 'border-white/15 bg-[#080a0f]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{p.name}</h3>
                        {p.slug === user.plan_slug && (
                          <span className="bg-[#00C2FF]/20 px-2 py-0.5 font-mono text-[10px] font-bold text-[#00C2FF]">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="mt-3 text-3xl font-semibold">
                        {p.is_custom ? 'Custom' : `$${effective}`}
                        {!p.is_custom && (
                          <span className="ml-1 text-xs font-normal text-neutral-400">/mo</span>
                        )}
                      </div>
                      <p className="mt-2 text-xs text-neutral-400">{p.description}</p>
                      <ul className="mt-4 space-y-1.5 border-t border-white/10 pt-4 text-xs text-neutral-300">
                        {p.features.map((f) => (
                          <li key={f} className="flex items-center gap-2">
                            <Check className="h-3 w-3 text-[#00C2FF]" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-6">
                      {isCurrent ? (
                        <button
                          disabled
                          className="w-full cursor-not-allowed border border-white/15 bg-white/5 py-2.5 text-xs font-semibold text-neutral-400"
                        >
                          Current Plan
                        </button>
                      ) : p.is_custom ? (
                        <button
                          onClick={() => navigate('/contact')}
                          className="w-full border border-white/25 py-2.5 text-xs font-semibold text-white hover:bg-white hover:text-black"
                        >
                          Contact Sales
                        </button>
                      ) : isUpgrade ? (
                        <button
                          onClick={() => handlePlanAction(p)}
                          className="flex w-full items-center justify-center gap-1.5 bg-[#0047FF] py-2.5 text-xs font-semibold text-white hover:bg-[#0036cc]"
                        >
                          <ArrowUpRight className="h-3.5 w-3.5" />
                          Upgrade to {p.name}
                        </button>
                      ) : isSamePlanDiffCycle ? (
                        <button
                          onClick={() => handlePlanAction(p)}
                          className="w-full border border-[#00C2FF] py-2.5 text-xs font-semibold text-[#00C2FF] hover:bg-[#00C2FF] hover:text-black"
                        >
                          Switch to {billingCycle}
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePlanAction(p)}
                          className="flex w-full items-center justify-center gap-1.5 border border-amber-500/40 bg-amber-500/10 py-2.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20"
                        >
                          <ArrowDownRight className="h-3.5 w-3.5" />
                          {isDowngrade ? `Downgrade to ${p.name}` : `Switch to ${p.name}`}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order History */}
            <div className="border border-white/15 bg-[#080a0f] p-6">
              <h3 className="mb-4 text-lg font-semibold">Billing &amp; Plan Change History</h3>
              {orders.length === 0 ? (
                <p className="text-xs text-neutral-400">No billing events recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-white/10 font-mono text-neutral-400">
                      <tr>
                        <th className="py-2 pr-4">Reference</th>
                        <th className="py-2 pr-4">Plan</th>
                        <th className="py-2 pr-4">Cycle</th>
                        <th className="py-2 pr-4">Amount</th>
                        <th className="py-2 pr-4">Provider</th>
                        <th className="py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {orders.map((o) => (
                        <tr key={o.id}>
                          <td className="py-2.5 pr-4 font-mono text-[11px] text-neutral-300">
                            {o.provider_session_id}
                          </td>
                          <td className="py-2.5 pr-4 uppercase">{o.plan_slug}</td>
                          <td className="py-2.5 pr-4 uppercase">{o.billing_cycle}</td>
                          <td className="py-2.5 pr-4 font-semibold">
                            ${o.amount} {o.currency}
                          </td>
                          <td className="py-2.5 pr-4 uppercase text-neutral-400">{o.provider}</td>
                          <td className="py-2.5 font-mono uppercase text-emerald-400">{o.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: TECHNICAL SETTINGS */}
        {tab === 'settings' && techSettings && (
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Engine & Live-Sync Settings */}
            <form
              onSubmit={handleSaveTechSettings}
              className="space-y-5 border border-white/15 bg-[#080a0f] p-6 lg:col-span-7"
            >
              <h2 className="text-lg font-semibold">Live-Sync &amp; Engine Pipeline Settings</h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-neutral-400">
                    Default Target Game Engine
                  </label>
                  <select
                    value={techSettings.preferred_engine}
                    onChange={(e) =>
                      setTechSettings({ ...techSettings, preferred_engine: e.target.value })
                    }
                    className="w-full border border-white/15 bg-black px-3 py-2 text-sm text-white"
                  >
                    <option value="unity">Unity (C# UGUI / UI Toolkit)</option>
                    <option value="unreal">Unreal Engine 5 (UMG / Slate)</option>
                    <option value="godot">Godot 4 (Control Nodes)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs text-neutral-400">
                    Local WebSocket / IPC Port
                  </label>
                  <input
                    type="number"
                    min={1024}
                    max={65535}
                    value={techSettings.ws_port}
                    onChange={(e) =>
                      setTechSettings({ ...techSettings, ws_port: Number(e.target.value) })
                    }
                    className="w-full border border-white/15 bg-black px-3 py-2 font-mono text-sm text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-neutral-400">
                    Serialization Protocol
                  </label>
                  <select
                    value={techSettings.sync_protocol}
                    onChange={(e) =>
                      setTechSettings({ ...techSettings, sync_protocol: e.target.value })
                    }
                    className="w-full border border-white/15 bg-black px-3 py-2 text-sm text-white"
                  >
                    <option value="protobuf">Protobuf Binary (Sub-ms Production)</option>
                    <option value="json">JSON Schema (Debug Mode)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs text-neutral-400">
                    Version Control Bridge
                  </label>
                  <select
                    value={techSettings.vcs_integration}
                    onChange={(e) =>
                      setTechSettings({ ...techSettings, vcs_integration: e.target.value })
                    }
                    className="w-full border border-white/15 bg-black px-3 py-2 text-sm text-white"
                  >
                    <option value="github">GitHub</option>
                    <option value="gitlab">GitLab</option>
                    <option value="perforce">Perforce (P4)</option>
                    <option value="none">Local Only</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs text-neutral-400">
                    Desktop Release Channel
                  </label>
                  <select
                    value={techSettings.release_channel}
                    onChange={(e) =>
                      setTechSettings({ ...techSettings, release_channel: e.target.value })
                    }
                    className="w-full border border-white/15 bg-black px-3 py-2 text-sm text-white"
                  >
                    <option value="stable">Stable</option>
                    <option value="beta">Beta (Early Access)</option>
                    <option value="nightly">Nightly Builds</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 border-t border-white/10 pt-4 text-xs">
                {[
                  {
                    key: 'auto_atlas_pot',
                    label: 'Enforce Power-of-Two (PoT) Texture Atlas Compliance',
                  },
                  {
                    key: 'nine_slice_auto',
                    label: 'Automatic 9-Slice (Nine-Patch) Margin Detection',
                  },
                  {
                    key: 'ai_style_lock',
                    label: 'Lock Flippy AI Generation to Project Art Style',
                  },
                  {
                    key: 'email_notifications',
                    label: 'Receive Release & Security Notifications via Email',
                  },
                ].map((toggle) => (
                  <label key={toggle.key} className="flex items-center justify-between gap-3">
                    <span className="text-neutral-300">{toggle.label}</span>
                    <input
                      type="checkbox"
                      checked={Boolean((techSettings as any)[toggle.key])}
                      onChange={(e) =>
                        setTechSettings({
                          ...techSettings,
                          [toggle.key]: e.target.checked ? 1 : 0,
                        })
                      }
                      className="h-4 w-4 accent-[#0047FF]"
                    />
                  </label>
                ))}
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-[#0047FF] px-6 py-2.5 text-xs font-semibold text-white hover:bg-[#0036cc]"
              >
                <Save className="h-3.5 w-3.5" />
                Save Technical Settings
              </button>
            </form>

            {/* Profile & Security */}
            <div className="space-y-6 lg:col-span-5">
              <form
                onSubmit={handleSaveProfile}
                className="space-y-4 border border-white/15 bg-[#080a0f] p-6"
              >
                <h3 className="text-lg font-semibold">Profile Details</h3>
                <div>
                  <label className="mb-1 block text-xs text-neutral-400">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full border border-white/15 bg-black px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-neutral-400">Studio / Company</label>
                  <input
                    type="text"
                    value={profileCompany}
                    onChange={(e) => setProfileCompany(e.target.value)}
                    className="w-full border border-white/15 bg-black px-3 py-2 text-sm text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-white px-5 py-2 text-xs font-semibold text-black hover:bg-[#0047FF] hover:text-white"
                >
                  Update Profile
                </button>
              </form>

              <form
                onSubmit={handleChangePassword}
                className="space-y-4 border border-white/15 bg-[#080a0f] p-6"
              >
                <h3 className="text-lg font-semibold">Security &amp; Password</h3>
                <div>
                  <label className="mb-1 block text-xs text-neutral-400">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full border border-white/15 bg-black px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-neutral-400">New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border border-white/15 bg-black px-3 py-2 text-sm text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="border border-white/25 px-5 py-2 text-xs font-semibold text-white hover:bg-white hover:text-black"
                >
                  Change Password
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: FEEDBACK & BUG TRACKER */}
        {tab === 'feedback' && (
          <div className="grid gap-6 lg:grid-cols-12">
            <form
              onSubmit={handleSubmitFeedback}
              className="space-y-4 border border-white/15 bg-[#080a0f] p-6 lg:col-span-5"
            >
              <h2 className="text-lg font-semibold">Submit Technical Feedback</h2>
              <p className="text-xs text-neutral-400">
                Report Live-Sync engine issues, Flippy Vision recognition edge cases, or request new
                features directly to our engineering team.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-neutral-400">Category</label>
                  <select
                    value={fbCategory}
                    onChange={(e) => setFbCategory(e.target.value)}
                    className="w-full border border-white/15 bg-black px-2.5 py-2 text-xs"
                  >
                    <option value="bug">Bug Report</option>
                    <option value="engine_sync">Engine Live-Sync</option>
                    <option value="ai_vision">Flippy Vision / AI</option>
                    <option value="performance">Performance / FPS</option>
                    <option value="feature">Feature Request</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-neutral-400">Target Engine</label>
                  <select
                    value={fbEngine}
                    onChange={(e) => setFbEngine(e.target.value)}
                    className="w-full border border-white/15 bg-black px-2.5 py-2 text-xs"
                  >
                    <option value="unity">Unity</option>
                    <option value="unreal">Unreal Engine 5</option>
                    <option value="godot">Godot 4</option>
                    <option value="desktop">Desktop Canvas</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-neutral-400">Severity</label>
                  <select
                    value={fbSeverity}
                    onChange={(e) => setFbSeverity(e.target.value)}
                    className="w-full border border-white/15 bg-black px-2.5 py-2 text-xs"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-neutral-400">App Version</label>
                  <input
                    type="text"
                    value={fbVersion}
                    onChange={(e) => setFbVersion(e.target.value)}
                    className="w-full border border-white/15 bg-black px-2.5 py-2 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs text-neutral-400">Summary Title</label>
                <input
                  type="text"
                  required
                  value={fbTitle}
                  onChange={(e) => setFbTitle(e.target.value)}
                  placeholder="e.g. 9-slice margin drift on Unity Canvas Scaler"
                  className="w-full border border-white/15 bg-black px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-neutral-400">Technical Details</label>
                <textarea
                  required
                  rows={4}
                  value={fbDesc}
                  onChange={(e) => setFbDesc(e.target.value)}
                  placeholder="Steps to reproduce, engine version, expected vs actual behavior..."
                  className="w-full border border-white/15 bg-black px-3 py-2 text-sm text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#0047FF] py-2.5 text-xs font-semibold text-white hover:bg-[#0036cc]"
              >
                Submit Feedback Ticket
              </button>
            </form>

            <div className="space-y-4 lg:col-span-7">
              <h2 className="text-lg font-semibold">Your Submitted Tickets</h2>
              {feedbacks.length === 0 ? (
                <div className="border border-white/15 bg-[#080a0f] p-6 text-xs text-neutral-400">
                  No feedback tickets submitted yet.
                </div>
              ) : (
                feedbacks.map((fb) => (
                  <div key={fb.id} className="border border-white/15 bg-[#080a0f] p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold text-white">{fb.title}</span>
                      <span className="bg-[#0047FF]/20 px-2.5 py-0.5 font-mono text-[10px] uppercase text-[#00C2FF]">
                        {fb.status}
                      </span>
                    </div>
                    <div className="mt-1 font-mono text-[11px] text-neutral-400">
                      {fb.category.toUpperCase()} · {fb.engine.toUpperCase()} · {fb.severity.toUpperCase()} ·{' '}
                      {fb.app_version}
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-neutral-300">{fb.description}</p>
                    {fb.admin_reply && (
                      <div className="mt-3 border-l-2 border-[#00C2FF] bg-white/[0.03] p-3 text-xs text-neutral-200">
                        <span className="font-mono text-[10px] text-[#00C2FF]">
                          ENGINEERING REPLY:
                        </span>
                        <p className="mt-1">{fb.admin_reply}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Downgrade / Switch Confirmation Modal */}
      {downgradeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md border border-white/20 bg-[#080a0f] p-6">
            <p className="font-mono text-xs uppercase tracking-widest text-amber-400">
              Confirm Plan Change
            </p>
            <h3 className="mt-1 text-xl font-semibold">
              Switch to {downgradeTarget.name} ({billingCycle})?
            </h3>
            <p className="mt-3 text-xs leading-relaxed text-neutral-300">
              You are changing from{' '}
              <span className="font-semibold uppercase text-white">{user.plan_slug}</span> to{' '}
              <span className="font-semibold uppercase text-white">{downgradeTarget.slug}</span>.
              Your AI token quota and engine bridge limits will adjust to the{' '}
              {downgradeTarget.name} tier immediately.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setDowngradeTarget(null)}
                className="flex-1 border border-white/20 py-2.5 text-xs font-semibold text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={planLoading}
                onClick={confirmDowngrade}
                className="flex-1 bg-amber-500 py-2.5 text-xs font-semibold text-black hover:bg-amber-400"
              >
                {planLoading ? 'Updating...' : 'Confirm Switch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Checkout Modal */}
      <CheckoutModal
        plan={checkoutPlan}
        billingCycle={billingCycle}
        onClose={() => {
          setCheckoutPlan(null);
          loadAccountData();
        }}
      />
    </div>
  );
}
