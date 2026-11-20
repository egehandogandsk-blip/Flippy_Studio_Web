import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { PricingPlan } from '../lib/api';
import { CheckoutModal } from './CheckoutModal';

interface PricingSectionProps {
  plans: PricingPlan[];
  yearlyDiscountPercent?: number;
}

export function PricingSection({ plans, yearlyDiscountPercent = 20 }: PricingSectionProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [checkoutPlan, setCheckoutPlan] = useState<PricingPlan | null>(null);
  const navigate = useNavigate();

  const handlePlanClick = (plan: PricingPlan) => {
    if (plan.is_custom) {
      navigate('/contact');
      return;
    }
    setCheckoutPlan(plan);
  };

  const renderPrice = (plan: PricingPlan) => {
    if (plan.is_custom || plan.price_label === 'Contact Us') {
      return { main: 'Contact Us', sub: 'Per month' };
    }
    if (plan.price_label && plan.price_label.includes('-')) {
      return { main: plan.price_label, sub: 'One-time or monthly pack' };
    }
    const base = Number(plan.monthly_price || 0);
    if (base === 0) {
      return { main: '$0', sub: 'Per month' };
    }
    const discount = plan.yearly_discount_percent ?? yearlyDiscountPercent;
    const effective =
      billingCycle === 'yearly' ? Math.round(base * (1 - discount / 100) * 100) / 100 : base;
    return {
      main: `$${Number.isInteger(effective) ? effective : effective.toFixed(2)}`,
      sub:
        billingCycle === 'yearly'
          ? `Per month · billed $${(effective * 12).toFixed(0)}/yr`
          : 'Per month',
    };
  };

  return (
    <section id="pricing" className="relative border-t border-white/10 px-6 py-24 sm:px-10">
      <div className="mx-auto max-w-[1380px]">
        <div className="mb-10 grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-neutral-400">
              Pricing
            </p>
            <h2 className="text-3xl font-medium leading-tight tracking-tight text-white sm:text-5xl">
              We aren&apos;t just selling a license; we are charging for the time we save.
            </h2>
          </div>
          <div className="lg:col-span-5 lg:text-right">
            <p className="ml-auto max-w-xs text-left text-xs leading-relaxed text-neutral-400 lg:text-right">
              In a high-speed industry, efficiency is the ultimate currency.
            </p>
          </div>
        </div>

        {/* Monthly / Yearly Toggle matching screenshot */}
        <div className="mb-10 flex items-center gap-3">
          <span
            className={`text-sm font-medium ${
              billingCycle === 'monthly' ? 'text-white' : 'text-neutral-500'
            }`}
          >
            Monthly
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={billingCycle === 'yearly'}
            onClick={() =>
              setBillingCycle((c) => (c === 'monthly' ? 'yearly' : 'monthly'))
            }
            className="relative inline-flex h-6 w-12 items-center rounded-full border border-white/25 bg-black p-0.5 transition-colors"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                billingCycle === 'yearly' ? 'translate-x-6 bg-[#00C2FF]' : 'translate-x-0.5'
              }`}
            />
          </button>
          <span
            className={`text-sm font-medium ${
              billingCycle === 'yearly' ? 'text-white' : 'text-neutral-500'
            }`}
          >
            Yearly
          </span>
          <span className="bg-white px-2.5 py-0.5 text-[11px] font-bold text-black">
            {yearlyDiscountPercent}% OFF
          </span>
        </div>

        {/* 6 Pricing Cards Grid (2 rows of 3) */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const { main, sub } = renderPrice(plan);
            const popular = Boolean(plan.is_popular);
            return (
              <div
                key={plan.id}
                className={`flex flex-col justify-between border p-7 transition-all ${
                  popular
                    ? 'corner-fold-blue border-[#0047FF]/60 bg-gradient-to-br from-[#0e2046] via-[#091229] to-[#05070d]'
                    : 'border-white/15 bg-[#06070a] hover:border-white/30'
                }`}
              >
                <div>
                  <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                  <p className="mt-2 min-h-[48px] text-xs leading-relaxed text-neutral-400">
                    {plan.description}
                  </p>

                  <div className="mt-6 border-b border-white/10 pb-6">
                    <div className="text-4xl font-semibold tracking-tight text-white">{main}</div>
                    <div className="mt-1 text-xs text-neutral-400">{sub}</div>
                  </div>

                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2.5 text-xs text-neutral-300">
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-white/25 text-white">
                          <Check className="h-2.5 w-2.5" />
                        </span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => handlePlanClick(plan)}
                  className="mt-8 w-fit bg-white px-6 py-2.5 text-xs font-semibold text-black transition-colors hover:bg-[#0047FF] hover:text-white"
                >
                  {plan.cta_label || 'Get Started'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <CheckoutModal
        plan={checkoutPlan}
        billingCycle={billingCycle}
        onClose={() => setCheckoutPlan(null)}
      />
    </section>
  );
}
