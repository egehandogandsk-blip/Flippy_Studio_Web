import { Router } from 'express';
import {
  calculatePlanAmount,
  createProviderCheckoutSession,
  fulfillPaymentSession,
  getPaymentProviderConfig,
  verifyWebhookSignature,
} from '../services/paymentProvider.js';

export function createPaymentsRouter(db, { requireAuth }) {
  const router = Router();

  router.get('/config', (_req, res) => {
    res.json(getPaymentProviderConfig(db));
  });

  router.post('/create-checkout', async (req, res) => {
    const {
      planSlug,
      billingCycle = 'monthly',
      currency = 'USD',
      email: guestEmail,
      provider: requestedProvider,
    } = req.body || {};

    if (!planSlug) {
      return res.status(400).json({ error: 'planSlug is required.' });
    }
    if (!['monthly', 'yearly'].includes(billingCycle)) {
      return res.status(400).json({ error: 'billingCycle must be monthly or yearly.' });
    }

    const plan = db
      .prepare('SELECT * FROM pricing_plans WHERE slug = ? AND is_active = 1')
      .get(planSlug);

    if (!plan) {
      return res.status(404).json({ error: 'Pricing plan not found.' });
    }
    if (plan.is_custom) {
      return res.status(400).json({ error: 'Custom plans require contacting sales.' });
    }

    const email = (req.user?.email || guestEmail || '').trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Valid email is required for checkout.' });
    }

    const config = getPaymentProviderConfig(db);
    const provider = requestedProvider || config.activeProvider;
    const amount = calculatePlanAmount(plan, billingCycle);

    const session = await createProviderCheckoutSession({
      provider,
      plan,
      billingCycle,
      amount,
      currency,
      email,
    });

    db.prepare(
      `INSERT INTO payments (
        user_id, email, plan_slug, billing_cycle, amount, currency, provider, provider_session_id, status, metadata_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`
    ).run(
      req.user?.id || null,
      email,
      plan.slug,
      billingCycle,
      amount,
      currency,
      session.provider,
      session.sessionId,
      JSON.stringify({ planName: plan.name })
    );

    res.status(201).json({
      sessionId: session.sessionId,
      provider: session.provider,
      amount,
      currency,
      billingCycle,
      planName: plan.name,
      clientMode: session.clientMode,
      checkoutUrl: session.checkoutUrl,
      message: session.message,
    });
  });

  router.post('/confirm-sandbox', (req, res) => {
    const { sessionId } = req.body || {};
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required.' });
    }
    const existing = db
      .prepare('SELECT * FROM payments WHERE provider_session_id = ?')
      .get(sessionId);

    if (!existing) {
      return res.status(404).json({ error: 'Checkout session not found.' });
    }
    if (existing.provider !== 'sandbox' && process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Sandbox confirmation disabled for live providers.' });
    }

    const updated = fulfillPaymentSession(db, sessionId);
    res.json({ paid: true, payment: updated });
  });

  router.post('/webhook', (req, res) => {
    const provider = req.headers['x-payment-provider'] || 'sandbox';
    const rawBody = JSON.stringify(req.body || {});
    if (!verifyWebhookSignature(provider, req.headers, rawBody)) {
      return res.status(401).json({ error: 'Invalid webhook signature.' });
    }

    const { eventType, sessionId } = req.body || {};
    if (eventType === 'checkout.session.completed' && sessionId) {
      const updated = fulfillPaymentSession(db, sessionId);
      if (!updated) {
        return res.status(404).json({ error: 'Payment session not found.' });
      }
      return res.json({ received: true, payment: updated });
    }

    res.json({ received: true });
  });

  router.get('/my-orders', requireAuth, (req, res) => {
    const orders = db
      .prepare('SELECT * FROM payments WHERE user_id = ? OR email = ? ORDER BY id DESC')
      .all(req.user.id, req.user.email);
    res.json({ orders });
  });

  router.post('/change-plan', requireAuth, (req, res) => {
    const { targetPlanSlug, billingCycle = 'monthly' } = req.body || {};
    if (!targetPlanSlug) {
      return res.status(400).json({ error: 'targetPlanSlug is required.' });
    }
    if (!['monthly', 'yearly'].includes(billingCycle)) {
      return res.status(400).json({ error: 'billingCycle must be monthly or yearly.' });
    }

    const currentPlan = db
      .prepare('SELECT * FROM pricing_plans WHERE slug = ?')
      .get(req.user.plan_slug);
    const targetPlan = db
      .prepare('SELECT * FROM pricing_plans WHERE slug = ? AND is_active = 1')
      .get(targetPlanSlug);

    if (!targetPlan) {
      return res.status(404).json({ error: 'Target pricing plan not found.' });
    }
    if (targetPlan.is_custom) {
      return res.status(400).json({ error: 'Custom plans require contacting sales.' });
    }

    const currentPrice = Number(currentPlan?.monthly_price || 0);
    const targetPrice = Number(targetPlan.monthly_price || 0);

    if (targetPlan.slug === req.user.plan_slug && billingCycle === req.user.billing_cycle) {
      return res.status(400).json({ error: 'You are already on this plan and billing cycle.' });
    }

    const isUpgrade = targetPrice > currentPrice;
    if (isUpgrade) {
      return res.json({
        requiresCheckout: true,
        direction: 'upgrade',
        currentPlan: currentPlan?.name || req.user.plan_slug,
        targetPlan: { ...targetPlan, features: JSON.parse(targetPlan.features_json || '[]') },
        billingCycle,
      });
    }

    // Downgrade or free tier switch or billing cycle switch
    const direction = targetPrice < currentPrice ? 'downgrade' : 'cycle_change';
    db.prepare('UPDATE users SET plan_slug = ?, billing_cycle = ? WHERE id = ?').run(
      targetPlan.slug,
      billingCycle,
      req.user.id
    );

    const sessionId = `plan_${direction}_${Date.now()}_${req.user.id}`;
    db.prepare(
      `INSERT INTO payments (
        user_id, email, plan_slug, billing_cycle, amount, currency, provider, provider_session_id, status, metadata_json
      ) VALUES (?, ?, ?, ?, 0, 'USD', 'sandbox', ?, 'paid', ?)`
    ).run(
      req.user.id,
      req.user.email,
      targetPlan.slug,
      billingCycle,
      sessionId,
      JSON.stringify({ direction, fromPlan: req.user.plan_slug })
    );

    const updatedUser = db
      .prepare(
        'SELECT id, name, email, role, plan_slug, billing_cycle, status, company, created_at FROM users WHERE id = ?'
      )
      .get(req.user.id);

    res.json({
      requiresCheckout: false,
      direction,
      user: updatedUser,
      message:
        direction === 'downgrade'
          ? `Successfully downgraded to ${targetPlan.name} (${billingCycle}).`
          : `Billing cycle updated to ${billingCycle} on ${targetPlan.name}.`,
    });
  });

  return router;
}
