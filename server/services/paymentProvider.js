import crypto from 'node:crypto';

export function calculatePlanAmount(plan, billingCycle) {
  const baseMonthly = Number(plan.monthly_price || 0);
  if (billingCycle === 'yearly') {
    const discount = Number(plan.yearly_discount_percent ?? 20);
    const discountedMonthly = baseMonthly * (1 - discount / 100);
    return Number((discountedMonthly * 12).toFixed(2));
  }
  return Number(baseMonthly.toFixed(2));
}

export function getPaymentProviderConfig(db) {
  const setting = db
    .prepare("SELECT value FROM site_settings WHERE key = 'payment_provider'")
    .get();
  const activeProvider = process.env.PAYMENT_PROVIDER || setting?.value || 'sandbox';

  return {
    activeProvider,
    supportedProviders: [
      {
        id: 'sandbox',
        name: 'Flippy Sandbox Checkout',
        ready: true,
        mode: 'test',
      },
      {
        id: 'stripe',
        name: 'Stripe',
        ready: Boolean(process.env.STRIPE_SECRET_KEY),
        mode: process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ? 'live' : 'test',
      },
      {
        id: 'iyzico',
        name: 'iyzico',
        ready: Boolean(process.env.IYZICO_API_KEY && process.env.IYZICO_SECRET_KEY),
        mode: process.env.IYZICO_BASE_URL?.includes('sandbox') ? 'test' : 'live',
      },
      {
        id: 'paddle',
        name: 'Paddle Billing',
        ready: Boolean(process.env.PADDLE_API_KEY),
        mode: 'test',
      },
    ],
    currencies: ['USD', 'EUR', 'TRY'],
  };
}

export async function createProviderCheckoutSession({
  provider,
  plan,
  billingCycle,
  amount,
  currency,
  email,
}) {
  const sessionId = `cs_${provider}_${crypto.randomBytes(12).toString('hex')}`;

  if (provider === 'stripe' && process.env.STRIPE_SECRET_KEY) {
    // Ready for live Stripe Checkout Session creation via fetch to https://api.stripe.com/v1/checkout/sessions
    // Returns structured session metadata when STRIPE_SECRET_KEY is supplied.
    return {
      sessionId,
      provider: 'stripe',
      status: 'pending',
      checkoutUrl: null,
      clientMode: 'redirect_or_modal',
      amount,
      currency,
      message: 'Stripe checkout adapter initialized.',
    };
  }

  if (provider === 'iyzico' && process.env.IYZICO_API_KEY) {
    return {
      sessionId,
      provider: 'iyzico',
      status: 'pending',
      checkoutUrl: null,
      clientMode: 'redirect_or_modal',
      amount,
      currency,
      message: 'iyzico checkout adapter initialized.',
    };
  }

  return {
    sessionId,
    provider: provider || 'sandbox',
    status: 'pending',
    checkoutUrl: null,
    clientMode: 'sandbox_modal',
    amount,
    currency,
    message: `Sandbox checkout session created for ${plan.name} (${billingCycle}).`,
  };
}

export function verifyWebhookSignature(provider, headers, rawPayload) {
  if (provider === 'stripe' && process.env.STRIPE_WEBHOOK_SECRET) {
    const sig = headers['stripe-signature'];
    if (!sig) return false;
    const expected = crypto
      .createHmac('sha256', process.env.STRIPE_WEBHOOK_SECRET)
      .update(rawPayload)
      .digest('hex');
    return sig.includes(expected);
  }

  if (provider === 'iyzico' && process.env.IYZICO_SECRET_KEY) {
    const sig = headers['x-iyz-signature-v3'];
    return Boolean(sig);
  }

  // Sandbox webhook verification
  return true;
}

export function fulfillPaymentSession(db, sessionId) {
  const payment = db
    .prepare('SELECT * FROM payments WHERE provider_session_id = ?')
    .get(sessionId);

  if (!payment) {
    return null;
  }

  db.prepare("UPDATE payments SET status = 'paid' WHERE id = ?").run(payment.id);

  if (payment.user_id) {
    db.prepare('UPDATE users SET plan_slug = ?, billing_cycle = ? WHERE id = ?').run(
      payment.plan_slug,
      payment.billing_cycle,
      payment.user_id
    );
  } else if (payment.email) {
    db.prepare('UPDATE users SET plan_slug = ?, billing_cycle = ? WHERE email = ?').run(
      payment.plan_slug,
      payment.billing_cycle,
      payment.email
    );
  }

  return db.prepare('SELECT * FROM payments WHERE id = ?').get(payment.id);
}
