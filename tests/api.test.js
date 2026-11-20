import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createApp } from '../server/app.js';

let server;
let baseUrl;

test.before(async () => {
  const { app } = createApp({ dbPath: ':memory:' });
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const addr = server.address();
  baseUrl = `http://127.0.0.1:${addr.port}`;
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

async function req(path, options = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { status: res.status, body, headers: res.headers };
}

test('GET /api/health and /api/site-data return seeded plans and releases', async () => {
  const health = await req('/api/health');
  assert.equal(health.status, 200);
  assert.equal(health.body.ok, true);

  const site = await req('/api/site-data');
  assert.equal(site.status, 200);
  assert.equal(site.body.plans.length, 6);
  assert.equal(site.body.releases.length, 6);
  const availablePlatforms = site.body.releases
    .filter((r) => r.is_available === 1)
    .map((r) => r.platform)
    .sort();
  assert.deepEqual(availablePlatforms, ['unity', 'windows']);
  assert.equal(site.body.settings.yearly_discount_percent, '20');
});

test('Auth register, login, and RBAC enforcement', async () => {
  const reg = await req('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Test Creator',
      email: 'creator@test.dev',
      password: 'Password123!',
      company: 'Pixel Forge',
    }),
  });
  assert.equal(reg.status, 201);
  assert.ok(reg.body.token);
  assert.equal(reg.body.user.role, 'user');
  assert.equal(reg.body.user.plan_slug, 'freemium');

  // Non-admin cannot access /api/admin/users
  const forbidden = await req('/api/admin/users', {
    headers: { Authorization: `Bearer ${reg.body.token}` },
  });
  assert.equal(forbidden.status, 403);

  // Admin login works
  const adminLogin = await req('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@flippy.studio',
      password: 'FlippyAdmin2026!',
    }),
  });
  assert.equal(adminLogin.status, 200);
  assert.equal(adminLogin.body.user.role, 'admin');

  const usersList = await req('/api/admin/users', {
    headers: { Authorization: `Bearer ${adminLogin.body.token}` },
  });
  assert.equal(usersList.status, 200);
  assert.ok(usersList.body.users.length >= 3);
});

test('Newsletter subscription and Contact email submission', async () => {
  const sub1 = await req('/api/newsletter/subscribe', {
    method: 'POST',
    body: JSON.stringify({ email: 'studio-lead@example.com' }),
  });
  assert.equal(sub1.status, 201);
  assert.equal(sub1.body.subscribed, true);

  const sub2 = await req('/api/newsletter/subscribe', {
    method: 'POST',
    body: JSON.stringify({ email: 'studio-lead@example.com' }),
  });
  assert.equal(sub2.status, 200);
  assert.equal(sub2.body.alreadySubscribed, true);

  const contact = await req('/api/contact', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Jane Doe',
      email: 'jane@indie.gg',
      subject: 'Unreal 5 Plugin Inquiry',
      category: 'sales',
      message: 'We want to evaluate Flippy Studio for 12 seats.',
    }),
  });
  assert.equal(contact.status, 201);
  assert.equal(contact.body.sent, true);
});

test('Payment checkout API calculates yearly 20% discount and upgrades user plan', async () => {
  const login = await req('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'creator@test.dev',
      password: 'Password123!',
    }),
  });
  const token = login.body.token;

  // Indie Starter is $9/mo -> yearly with 20% off = $9 * 0.8 * 12 = $86.40
  const checkout = await req('/api/payments/create-checkout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      planSlug: 'indie-starter',
      billingCycle: 'yearly',
      currency: 'USD',
    }),
  });
  assert.equal(checkout.status, 201);
  assert.equal(checkout.body.amount, 86.4);

  const confirm = await req('/api/payments/confirm-sandbox', {
    method: 'POST',
    body: JSON.stringify({ sessionId: checkout.body.sessionId }),
  });
  assert.equal(confirm.status, 200);
  assert.equal(confirm.body.paid, true);

  const me = await req('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(me.body.user.plan_slug, 'indie-starter');
  assert.equal(me.body.user.billing_cycle, 'yearly');
});

test('Release package download serves manifest and increments counter', async () => {
  const before = await req('/api/releases');
  const firstAvailable = before.body.releases.find((r) => r.is_available === 1);
  assert.ok(firstAvailable);

  const dl = await req(`/api/releases/${firstAvailable.id}/download`);
  assert.equal(dl.status, 200);
  assert.equal(dl.body.product, 'Flippy Studio');

  const after = await req('/api/releases');
  const updated = after.body.releases.find((r) => r.id === firstAvailable.id);
  assert.equal(updated.download_count, firstAvailable.download_count + 1);
});

test('User technical settings, key rotation, downgrade/upgrade, and feedback module', async () => {
  const login = await req('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'creator@test.dev',
      password: 'Password123!',
    }),
  });
  const token = login.body.token;

  // Technical settings
  const getSet = await req('/api/auth/settings', {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(getSet.status, 200);
  assert.ok(getSet.body.settings.api_key.startsWith('flp_live_'));

  const putSet = await req('/api/auth/settings', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      preferred_engine: 'unreal',
      ws_port: 9555,
      sync_protocol: 'json',
    }),
  });
  assert.equal(putSet.status, 200);
  assert.equal(putSet.body.settings.preferred_engine, 'unreal');
  assert.equal(putSet.body.settings.ws_port, 9555);

  const rotated = await req('/api/auth/rotate-key', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(rotated.status, 200);
  assert.notEqual(rotated.body.api_key, getSet.body.settings.api_key);

  // Upgrade check returns requiresCheckout: true (currently indie-starter -> studio-pro)
  const upgrade = await req('/api/payments/change-plan', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ targetPlanSlug: 'studio-pro', billingCycle: 'monthly' }),
  });
  assert.equal(upgrade.status, 200);
  assert.equal(upgrade.body.requiresCheckout, true);
  assert.equal(upgrade.body.direction, 'upgrade');

  // Downgrade to freemium succeeds immediately
  const downgrade = await req('/api/payments/change-plan', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ targetPlanSlug: 'freemium', billingCycle: 'monthly' }),
  });
  assert.equal(downgrade.status, 200);
  assert.equal(downgrade.body.requiresCheckout, false);
  assert.equal(downgrade.body.direction, 'downgrade');
  assert.equal(downgrade.body.user.plan_slug, 'freemium');

  // Feedback submission & admin reply
  const fbCreate = await req('/api/feedback', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      category: 'engine_sync',
      engine: 'unreal',
      severity: 'high',
      title: 'Slate slot padding mismatch',
      description: 'Padding on nested horizontal box differs by 2px.',
    }),
  });
  assert.equal(fbCreate.status, 201);
  assert.equal(fbCreate.body.feedback.status, 'open');

  const fbMine = await req('/api/feedback/my', {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(fbMine.status, 200);
  assert.equal(fbMine.body.feedbacks.length, 1);

  const adminLogin = await req('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@flippy.studio',
      password: 'FlippyAdmin2026!',
    }),
  });
  const fbReply = await req(`/api/admin/feedbacks/${fbCreate.body.feedback.id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminLogin.body.token}` },
    body: JSON.stringify({ status: 'in_review', admin_reply: 'Fix queued for v0.9.5.' }),
  });
  assert.equal(fbReply.status, 200);
  assert.equal(fbReply.body.feedback.status, 'in_review');
  assert.equal(fbReply.body.feedback.admin_reply, 'Fix queued for v0.9.5.');
});
