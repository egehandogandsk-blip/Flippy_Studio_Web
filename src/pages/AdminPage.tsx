import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  CreditCard,
  Download,
  Mail,
  MessageSquare,
  Settings,
  BarChart3,
  Tag,
  Trash2,
  Plus,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch, PricingPlan, Release, User } from '../lib/api';

type AdminTab =
  | 'overview'
  | 'users'
  | 'plans'
  | 'releases'
  | 'newsletter'
  | 'messages'
  | 'feedbacks'
  | 'payments'
  | 'settings';

export function AdminPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState<any>({});
  const [users, setUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [releases, setReleases] = useState<Release[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [toast, setToast] = useState('');

  // New release form
  const [newRel, setNewRel] = useState({
    version: 'v0.9.5-beta',
    platform: 'windows',
    title: '',
    file_name: '',
    file_size: '145 MB',
    download_url: '',
    release_notes: '',
  });

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      navigate('/login');
    }
  }, [loading, user, navigate]);

  const loadAll = async () => {
    try {
      const [s, u, p, r, n, m, fb, pay, set] = await Promise.all([
        apiFetch('/api/admin/stats'),
        apiFetch('/api/admin/users'),
        apiFetch('/api/admin/plans'),
        apiFetch('/api/admin/releases'),
        apiFetch('/api/admin/newsletter'),
        apiFetch('/api/admin/messages'),
        apiFetch('/api/admin/feedbacks'),
        apiFetch('/api/admin/payments'),
        apiFetch('/api/admin/settings'),
      ]);
      setStats(s);
      setUsers(u.users || []);
      setPlans(p.plans || []);
      setReleases(r.releases || []);
      setSubscribers(n.subscribers || []);
      setMessages(m.messages || []);
      setFeedbacks(fb.feedbacks || []);
      setPayments(pay.payments || []);
      setSettings(set.settings || {});
    } catch {
      // handled
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAll();
    }
  }, [user]);

  if (loading || !user || user.role !== 'admin') return null;

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.company || '').toLowerCase().includes(userSearch.toLowerCase())
  );

  const handleUpdateUser = async (id: number, patch: Partial<User>) => {
    await apiFetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
    notify('Member updated');
    loadAll();
  };

  const handleDeleteUser = async (id: number) => {
    await apiFetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    notify('Member removed');
    loadAll();
  };

  const handleUpdatePlan = async (id: number, patch: Partial<PricingPlan>) => {
    await apiFetch(`/api/admin/plans/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
    notify('Pricing plan updated');
    loadAll();
  };

  const handleCreateRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiFetch('/api/admin/releases', {
      method: 'POST',
      body: JSON.stringify({ ...newRel, is_available: 1 }),
    });
    setNewRel({
      version: 'v0.9.5-beta',
      platform: 'windows',
      title: '',
      file_name: '',
      file_size: '145 MB',
      download_url: '',
      release_notes: '',
    });
    notify('Release package added');
    loadAll();
  };

  const handleToggleRelease = async (rel: Release) => {
    await apiFetch(`/api/admin/releases/${rel.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_available: rel.is_available ? 0 : 1 }),
    });
    notify('Release availability updated');
    loadAll();
  };

  const handleDeleteRelease = async (id: number) => {
    await apiFetch(`/api/admin/releases/${id}`, { method: 'DELETE' });
    notify('Release deleted');
    loadAll();
  };

  const handleDeleteSubscriber = async (id: number) => {
    await apiFetch(`/api/admin/newsletter/${id}`, { method: 'DELETE' });
    notify('Subscriber removed');
    loadAll();
  };

  const handleUpdateMessageStatus = async (id: number, status: string) => {
    await apiFetch(`/api/admin/messages/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    notify('Message status updated');
    loadAll();
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiFetch('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
    notify('Site settings saved');
  };

  const tabs: { id: AdminTab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: `Members (${users.length})`, icon: Users },
    { id: 'plans', label: 'Pricing Plans', icon: Tag },
    { id: 'releases', label: 'Releases', icon: Download },
    { id: 'newsletter', label: `Newsletter (${subscribers.length})`, icon: Mail },
    { id: 'messages', label: `Messages (${messages.length})`, icon: MessageSquare },
    { id: 'feedbacks', label: `Feedbacks (${feedbacks.length})`, icon: MessageSquare },
    { id: 'payments', label: `Payments (${payments.length})`, icon: CreditCard },
    { id: 'settings', label: 'Site Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#040507] px-6 py-12 text-white sm:px-10">
      <div className="mx-auto max-w-[1380px]">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-[#00C2FF]">
              Flippy Studio Control Center
            </p>
            <h1 className="mt-1 text-3xl font-semibold">Admin Panel</h1>
          </div>

          {toast && (
            <div className="inline-flex items-center gap-2 border border-emerald-500/40 bg-emerald-500/15 px-4 py-2 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              {toast}
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8 flex flex-wrap gap-2 border-b border-white/10 pb-4">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-2 border px-4 py-2 text-xs font-medium transition-colors ${
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

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: 'Total Members', value: stats.totalUsers ?? 0 },
              { label: 'Paid Subscriptions', value: stats.paidUsers ?? 0 },
              { label: 'Newsletter Subscribers', value: stats.newsletterCount ?? 0 },
              { label: 'Unread Contact Messages', value: stats.unreadMessages ?? 0 },
              { label: 'Total Package Downloads', value: stats.totalDownloads ?? 0 },
              { label: 'Total Revenue (USD)', value: `$${stats.totalRevenue ?? 0}` },
            ].map((card) => (
              <div key={card.label} className="border border-white/15 bg-[#080a0f] p-6">
                <p className="font-mono text-xs text-neutral-400">{card.label}</p>
                <p className="mt-2 text-4xl font-semibold text-white">{card.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* MEMBERS / USERS */}
        {tab === 'users' && (
          <div className="space-y-4">
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search members by name, email, or studio..."
              className="w-full max-w-md border border-white/15 bg-[#080a0f] px-4 py-2.5 text-sm text-white outline-none focus:border-[#0047FF]"
            />

            <div className="overflow-x-auto border border-white/15 bg-[#080a0f]">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/10 bg-white/[0.02] font-mono text-neutral-400">
                  <tr>
                    <th className="p-3.5">Member</th>
                    <th className="p-3.5">Company</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Plan</th>
                    <th className="p-3.5">Cycle</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Joined</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.02]">
                      <td className="p-3.5">
                        <div className="font-semibold text-white">{u.name}</div>
                        <div className="text-neutral-400">{u.email}</div>
                      </td>
                      <td className="p-3.5 text-neutral-300">{u.company || '—'}</td>
                      <td className="p-3.5">
                        <select
                          value={u.role}
                          onChange={(e) => handleUpdateUser(u.id, { role: e.target.value as any })}
                          className="border border-white/15 bg-black px-2 py-1 text-xs"
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td className="p-3.5">
                        <select
                          value={u.plan_slug}
                          onChange={(e) => handleUpdateUser(u.id, { plan_slug: e.target.value })}
                          className="border border-white/15 bg-black px-2 py-1 text-xs"
                        >
                          {plans.map((p) => (
                            <option key={p.slug} value={p.slug}>
                              {p.slug}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3.5">
                        <select
                          value={u.billing_cycle}
                          onChange={(e) =>
                            handleUpdateUser(u.id, { billing_cycle: e.target.value as any })
                          }
                          className="border border-white/15 bg-black px-2 py-1 text-xs"
                        >
                          <option value="monthly">monthly</option>
                          <option value="yearly">yearly</option>
                        </select>
                      </td>
                      <td className="p-3.5">
                        <select
                          value={u.status}
                          onChange={(e) => handleUpdateUser(u.id, { status: e.target.value as any })}
                          className="border border-white/15 bg-black px-2 py-1 text-xs"
                        >
                          <option value="active">active</option>
                          <option value="suspended">suspended</option>
                        </select>
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-neutral-400">
                        {u.created_at?.slice(0, 10)}
                      </td>
                      <td className="p-3.5 text-right">
                        {u.id !== user.id && (
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="text-red-400 hover:text-red-300"
                            title="Delete Member"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PRICING PLANS */}
        {tab === 'plans' && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((p) => (
              <div key={p.id} className="space-y-3 border border-white/15 bg-[#080a0f] p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  <span className="font-mono text-xs text-neutral-400">{p.slug}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="mb-1 block text-neutral-400">Monthly ($)</label>
                    <input
                      type="number"
                      defaultValue={p.monthly_price}
                      onBlur={(e) =>
                        handleUpdatePlan(p.id, { monthly_price: Number(e.target.value) })
                      }
                      className="w-full border border-white/15 bg-black px-2.5 py-1.5"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-neutral-400">Yearly Disc (%)</label>
                    <input
                      type="number"
                      defaultValue={p.yearly_discount_percent}
                      onBlur={(e) =>
                        handleUpdatePlan(p.id, {
                          yearly_discount_percent: Number(e.target.value),
                        })
                      }
                      className="w-full border border-white/15 bg-black px-2.5 py-1.5"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleUpdatePlan(p.id, { is_active: p.is_active ? 0 : 1 })}
                    className={`px-3 py-1 font-mono ${
                      p.is_active
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}
                  >
                    {p.is_active ? 'ACTIVE' : 'HIDDEN'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdatePlan(p.id, { is_popular: p.is_popular ? 0 : 1 })}
                    className={`px-3 py-1 font-mono ${
                      p.is_popular ? 'bg-[#0047FF] text-white' : 'border border-white/15 text-neutral-400'
                    }`}
                  >
                    {p.is_popular ? 'POPULAR' : 'STANDARD'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* RELEASES / DOWNLOAD PACKAGES */}
        {tab === 'releases' && (
          <div className="space-y-8">
            <form
              onSubmit={handleCreateRelease}
              className="grid gap-4 border border-white/15 bg-[#080a0f] p-6 md:grid-cols-3"
            >
              <h3 className="md:col-span-3 text-sm font-semibold">Add New Installable Package</h3>
              <input
                required
                placeholder="Version (e.g. v1.0.0)"
                value={newRel.version}
                onChange={(e) => setNewRel({ ...newRel, version: e.target.value })}
                className="border border-white/15 bg-black px-3 py-2 text-xs"
              />
              <select
                value={newRel.platform}
                onChange={(e) => setNewRel({ ...newRel, platform: e.target.value })}
                className="border border-white/15 bg-black px-3 py-2 text-xs"
              >
                <option value="windows">windows</option>
                <option value="macos">macos</option>
                <option value="linux">linux</option>
                <option value="unity">unity</option>
                <option value="unreal">unreal</option>
                <option value="godot">godot</option>
              </select>
              <input
                required
                placeholder="Title (e.g. Flippy Studio Windows)"
                value={newRel.title}
                onChange={(e) => setNewRel({ ...newRel, title: e.target.value })}
                className="border border-white/15 bg-black px-3 py-2 text-xs"
              />
              <input
                required
                placeholder="File Name (e.g. Flippy-Setup.exe)"
                value={newRel.file_name}
                onChange={(e) => setNewRel({ ...newRel, file_name: e.target.value })}
                className="border border-white/15 bg-black px-3 py-2 text-xs"
              />
              <input
                placeholder="Size (e.g. 145 MB)"
                value={newRel.file_size}
                onChange={(e) => setNewRel({ ...newRel, file_size: e.target.value })}
                className="border border-white/15 bg-black px-3 py-2 text-xs"
              />
              <input
                placeholder="External CDN URL (optional)"
                value={newRel.download_url}
                onChange={(e) => setNewRel({ ...newRel, download_url: e.target.value })}
                className="border border-white/15 bg-black px-3 py-2 text-xs"
              />
              <input
                placeholder="Release Notes"
                value={newRel.release_notes}
                onChange={(e) => setNewRel({ ...newRel, release_notes: e.target.value })}
                className="md:col-span-2 border border-white/15 bg-black px-3 py-2 text-xs"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-1.5 bg-[#0047FF] px-4 py-2 text-xs font-semibold text-white"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Package
              </button>
            </form>

            <div className="overflow-x-auto border border-white/15 bg-[#080a0f]">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/10 font-mono text-neutral-400">
                  <tr>
                    <th className="p-3.5">Title</th>
                    <th className="p-3.5">Platform</th>
                    <th className="p-3.5">Version</th>
                    <th className="p-3.5">Downloads</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {releases.map((r) => (
                    <tr key={r.id}>
                      <td className="p-3.5">
                        <div className="font-semibold">{r.title}</div>
                        <div className="font-mono text-[11px] text-neutral-400">{r.file_name}</div>
                      </td>
                      <td className="p-3.5 uppercase">{r.platform}</td>
                      <td className="p-3.5 font-mono">{r.version}</td>
                      <td className="p-3.5 font-mono">{r.download_count}</td>
                      <td className="p-3.5">
                        <button
                          onClick={() => handleToggleRelease(r)}
                          className={`px-2.5 py-1 font-mono text-[10px] ${
                            r.is_available
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-neutral-700/40 text-neutral-400'
                          }`}
                        >
                          {r.is_available ? 'AVAILABLE' : 'UPCOMING'}
                        </button>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleDeleteRelease(r.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* NEWSLETTER */}
        {tab === 'newsletter' && (
          <div className="overflow-x-auto border border-white/15 bg-[#080a0f]">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 font-mono text-neutral-400">
                <tr>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Source</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Subscribed At</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {subscribers.map((s) => (
                  <tr key={s.id}>
                    <td className="p-3.5 font-medium text-white">{s.email}</td>
                    <td className="p-3.5 font-mono text-neutral-400">{s.source}</td>
                    <td className="p-3.5 uppercase text-emerald-400">{s.status}</td>
                    <td className="p-3.5 font-mono text-neutral-400">{s.created_at}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleDeleteSubscriber(s.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* CONTACT MESSAGES */}
        {tab === 'messages' && (
          <div className="space-y-4">
            {messages.length === 0 ? (
              <p className="text-xs text-neutral-400">No contact messages yet.</p>
            ) : (
              messages.map((m) => (
                <div key={m.id} className="border border-white/15 bg-[#080a0f] p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-semibold text-white">{m.subject}</span>
                      <span className="ml-3 font-mono text-xs text-[#00C2FF]">
                        {m.name} ({m.email})
                      </span>
                    </div>
                    <select
                      value={m.status}
                      onChange={(e) => handleUpdateMessageStatus(m.id, e.target.value)}
                      className="border border-white/15 bg-black px-2.5 py-1 text-xs"
                    >
                      <option value="unread">unread</option>
                      <option value="read">read</option>
                      <option value="replied">replied</option>
                    </select>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-neutral-300">{m.message}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* FEEDBACKS */}
        {tab === 'feedbacks' && (
          <div className="space-y-4">
            {feedbacks.length === 0 ? (
              <p className="text-xs text-neutral-400">No user feedback tickets yet.</p>
            ) : (
              feedbacks.map((fb) => (
                <div key={fb.id} className="border border-white/15 bg-[#080a0f] p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-semibold text-white">{fb.title}</span>
                      <span className="ml-3 font-mono text-xs text-[#00C2FF]">
                        {fb.user_name} ({fb.user_email})
                      </span>
                    </div>
                    <select
                      value={fb.status}
                      onChange={async (e) => {
                        await apiFetch(`/api/admin/feedbacks/${fb.id}`, {
                          method: 'PATCH',
                          body: JSON.stringify({ status: e.target.value }),
                        });
                        notify('Feedback status updated');
                        loadAll();
                      }}
                      className="border border-white/15 bg-black px-2.5 py-1 text-xs"
                    >
                      <option value="open">open</option>
                      <option value="in_review">in_review</option>
                      <option value="planned">planned</option>
                      <option value="resolved">resolved</option>
                    </select>
                  </div>
                  <div className="font-mono text-[11px] text-neutral-400">
                    {fb.category} · {fb.engine} · {fb.severity} · {fb.app_version}
                  </div>
                  <p className="text-xs text-neutral-300">{fb.description}</p>
                  <input
                    type="text"
                    defaultValue={fb.admin_reply || ''}
                    placeholder="Write engineering reply and press Enter or blur..."
                    onBlur={async (e) => {
                      if (e.target.value !== (fb.admin_reply || '')) {
                        await apiFetch(`/api/admin/feedbacks/${fb.id}`, {
                          method: 'PATCH',
                          body: JSON.stringify({ admin_reply: e.target.value }),
                        });
                        notify('Reply saved');
                        loadAll();
                      }
                    }}
                    className="w-full border border-white/15 bg-black px-3 py-2 text-xs text-white"
                  />
                </div>
              ))
            )}
          </div>
        )}

        {/* PAYMENTS */}
        {tab === 'payments' && (
          <div className="overflow-x-auto border border-white/15 bg-[#080a0f]">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 font-mono text-neutral-400">
                <tr>
                  <th className="p-3.5">Session ID</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Plan</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Provider</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="p-3.5 font-mono text-[11px]">{p.provider_session_id}</td>
                    <td className="p-3.5">{p.email}</td>
                    <td className="p-3.5 uppercase">
                      {p.plan_slug} ({p.billing_cycle})
                    </td>
                    <td className="p-3.5 font-semibold">
                      ${p.amount} {p.currency}
                    </td>
                    <td className="p-3.5 uppercase">{p.provider}</td>
                    <td className="p-3.5 font-mono uppercase text-[#00C2FF]">{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* SITE SETTINGS */}
        {tab === 'settings' && (
          <form
            onSubmit={handleSaveSettings}
            className="max-w-2xl space-y-4 border border-white/15 bg-[#080a0f] p-6"
          >
            <h3 className="text-lg font-semibold">Global Site &amp; API Settings</h3>
            {[
              { key: 'hero_eyebrow', label: 'Hero Eyebrow' },
              { key: 'hero_title', label: 'Hero Headline' },
              { key: 'countdown_target', label: 'Launch Countdown Target (ISO Date)' },
              { key: 'yearly_discount_percent', label: 'Yearly Discount (%)' },
              { key: 'payment_provider', label: 'Default Payment Provider (sandbox | stripe | iyzico | paddle)' },
              { key: 'contact_email', label: 'Contact Recipient Email' },
            ].map((field) => (
              <div key={field.key}>
                <label className="mb-1 block text-xs text-neutral-400">{field.label}</label>
                <input
                  type="text"
                  value={settings[field.key] || ''}
                  onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
                  className="w-full border border-white/15 bg-black px-3.5 py-2 text-sm text-white outline-none focus:border-[#0047FF]"
                />
              </div>
            ))}
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-[#0047FF] px-6 py-2.5 text-xs font-semibold text-white"
            >
              <Save className="h-3.5 w-3.5" />
              Save Site Settings
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
