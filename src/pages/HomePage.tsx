import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { apiFetch, PricingPlan, Release } from '../lib/api';
import { HeroShader } from '../components/HeroShader';
import { MatrixBackground } from '../components/MatrixBackground';
import { PricingSection } from '../components/PricingSection';
import { EngineBridgeSection } from '../components/EngineBridgeSection';
import { DownloadSection } from '../components/DownloadSection';
import { FaqSection } from '../components/FaqSection';
import { NewsletterSection } from '../components/NewsletterSection';

function useCountdown(targetIso?: string) {
  const [timeLeft, setTimeLeft] = useState({ d: 54, h: 18, m: 17, s: 8 });

  useEffect(() => {
    if (!targetIso) return;
    const target = new Date(targetIso).getTime();
    if (Number.isNaN(target)) return;

    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ d, h, m, s });
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [targetIso]);

  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(timeLeft.d)}D ${pad(timeLeft.h)}H ${pad(timeLeft.m)}M ${pad(timeLeft.s)}S`;
}

export function HomePage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [releases, setReleases] = useState<Release[]>([]);

  const loadSiteData = () => {
    apiFetch<{
      settings: Record<string, string>;
      plans: PricingPlan[];
      releases: Release[];
    }>('/api/site-data')
      .then((res) => {
        setSettings(res.settings || {});
        setPlans(res.plans || []);
        setReleases(res.releases || []);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadSiteData();
  }, []);

  const countdown = useCountdown(settings.countdown_target);

  return (
    <div className="relative min-h-screen bg-[#040507] text-white">
      {/* Global subtle animated matrix backdrop */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-60">
        <MatrixBackground className="h-full w-full" />
      </div>

      <div className="relative z-10">
        {/* HERO SECTION */}
        <section className="relative -mt-[62px] flex min-h-[88vh] items-end overflow-hidden px-6 pb-20 pt-36 sm:px-10">
          <HeroShader />
          <div className="pointer-events-none absolute inset-0 opacity-30">
            <MatrixBackground className="h-full w-full" />
          </div>

          <div className="relative z-10 mx-auto w-full max-w-[1380px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="max-w-3xl"
            >
              <p className="mb-3 text-xs font-medium tracking-wide text-neutral-300">
                {settings.hero_eyebrow || 'The Next Generation Game UI Design Platform'}
              </p>
              <h1 className="text-4xl font-medium leading-[1.08] tracking-tight text-white sm:text-6xl">
                {settings.hero_title ||
                  'The AI Platform Powering Instant Canvas-to-Engine UI Production'}
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-neutral-300">
                {settings.hero_subtitle ||
                  'We eliminate the billion-dollar bottleneck between game design and engineering. Flippy synchronizes vector components, responsive layouts, and state hierarchies into production-ready game engine prefabs at sub-millisecond speeds.'}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-6">
                <div className="font-mono text-sm font-semibold tracking-wider text-white">
                  {countdown}
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/download"
                    className="bg-white px-5 py-2.5 text-xs font-semibold text-black transition-colors hover:bg-[#0047FF] hover:text-white"
                  >
                    Download Beta
                  </Link>
                  <a
                    href="#pricing"
                    className="border border-white/30 bg-black/30 px-5 py-2.5 text-xs font-semibold text-white backdrop-blur transition-colors hover:border-white"
                  >
                    View Plans
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* OVERVIEW / METRICS SECTION */}
        <section id="overview" className="relative border-t border-white/10 px-6 py-28 sm:px-10">
          <div className="mx-auto grid max-w-[1380px] gap-16 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-6">
              <p className="mb-3 font-mono text-xs uppercase tracking-widest text-neutral-400">
                Revolutionizing Production with Real-Time Synergy
              </p>
              <h2 className="text-4xl font-medium leading-tight tracking-tight text-white sm:text-5xl">
                If it&apos;s on your canvas, it&apos;s already in your engine
              </h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-neutral-400">
                We aren&apos;t just building another design tool; we are building the central
                nervous system of modern production.
              </p>
              <Link
                to="/contact"
                className="mt-8 inline-block bg-white px-7 py-3 text-xs font-semibold text-black transition-colors hover:bg-[#0047FF] hover:text-white"
              >
                Contact Us
              </Link>
            </div>

            <div className="space-y-8 lg:col-span-6 lg:pl-12">
              {[
                { val: '100%', label: 'Global Game-Tech Accessibility' },
                { val: '20x', label: 'Engine-Agnostic Power' },
                { val: '0x', label: 'Zero-Export Workflow' },
              ].map((m) => (
                <div key={m.label} className="border-b border-white/10 pb-6 last:border-b-0">
                  <div className="text-5xl font-medium tracking-tight text-white sm:text-6xl">
                    {m.val}
                  </div>
                  <div className="mt-2 text-sm text-neutral-400">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HIGH-PERFORMANCE CORE SECTION */}
        <section id="product" className="relative border-t border-white/10 px-6 py-24 sm:px-10">
          <div className="mx-auto grid max-w-[1380px] gap-14 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-6">
              <div className="overflow-hidden border border-white/10 bg-[#05060a]">
                <img
                  src="/images/lWNc8UPiMjCTpqv72h04C7xKKc.avif"
                  alt="Flippy Studio High-Performance Core"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-6">
              <h2 className="text-4xl font-medium tracking-tight text-white sm:text-5xl">
                High-Performance Core
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-neutral-400">
                We aren&apos;t just coding a tool; we are optimizing the binary flow of creativity.
                Our roadmap is built on low-level performance, not high-level promises.
              </p>

              <ul className="mt-6 space-y-2.5 text-sm text-neutral-300">
                <li className="flex gap-2">
                  <span className="text-[#00C2FF]">•</span>
                  <span>
                    A memory-safe design environment built on a C++ and Rust core, optimized for
                    heavy production assets.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#00C2FF]">•</span>
                  <span>
                    Hardware-accelerated canvas powered by PixiJS and WebGL, ensuring a stutter-free
                    professional workflow.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#00C2FF]">•</span>
                  <span>
                    Native integration of WebSockets and Protobuf (Protocol Buffers) for sub-100ms
                    binary data synchronization.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#00C2FF]">•</span>
                  <span>
                    A responsive and scalable desktop interface developed with React, TypeScript,
                    and Tailwind CSS.
                  </span>
                </li>
              </ul>

              <div className="mt-8 space-y-2.5 border-t border-white/10 pt-6 text-sm font-medium text-neutral-200">
                {[
                  '"Live-Sync" Engine Bridge',
                  '"Make with AI" Module',
                  'Advanced Production Management',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#00C2FF]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PROBLEM VS SOLUTION SECTION */}
        <section className="relative border-t border-white/10 px-6 py-24 sm:px-10">
          <div className="mx-auto max-w-[1380px]">
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-neutral-400">
              The Fatal Gap in Creative Workflows
            </p>
            <h2 className="max-w-2xl text-3xl font-medium leading-tight tracking-tight text-white sm:text-5xl">
              Revolutionizing Production with Real-Time Synergy
            </h2>
            <p className="mt-4 max-w-xl text-sm text-neutral-400">
              &quot;Every manual export is a lost dollar. Standard workflows create a 40% efficiency
              leak in high-budget production pipelines.&quot;
            </p>

            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              <div className="border border-white/15 bg-[#06070b] p-8 sm:p-10">
                <h3 className="mb-6 text-2xl font-medium text-white">The problem</h3>
                <ul className="space-y-4 text-sm text-neutral-400">
                  {[
                    'The "Export-Import" Hell',
                    'Lack of Real-Time Synergy',
                    'Inefficient Resource Management',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <X className="h-4 w-4 text-neutral-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="corner-fold-blue border border-white/20 bg-gradient-to-br from-[#141923] via-[#0b0e15] to-[#06070b] p-8 sm:p-10">
                <h3 className="mb-6 text-2xl font-medium text-white">The solution</h3>
                <ul className="space-y-4 text-sm text-neutral-200">
                  {[
                    'Zero-Export Workflow',
                    'Production-Ready AI Integration',
                    'Engine-Agnostic Power',
                    'Production-Ready Output',
                    'Cross-Engine Integration',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-white" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES BENTO GRID */}
        <section id="features" className="relative border-t border-white/10 px-6 py-24 sm:px-10">
          <div className="mx-auto max-w-[1380px]">
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-neutral-400">
              Features
            </p>
            <h2 className="max-w-xl text-3xl font-medium leading-tight tracking-tight text-white sm:text-5xl">
              Build better with AI-driven growth made simple.
            </h2>
            <p className="mt-4 max-w-lg text-sm text-neutral-400">
              AI that delivers proven results. We remove technical friction so you can focus on
              high-impact growth.
            </p>

            {/* Row 1: 3 Cards */}
            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              <div className="group flex flex-col justify-between border border-white/15 bg-[#06070b] p-6">
                <div className="mb-6 overflow-hidden border border-white/10 bg-black">
                  <img
                    src="/images/lWNc8UPiMjCTpqv72h04C7xKKc.avif"
                    alt="Concept to Code"
                    className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-medium text-white">Concept to Code</h3>
                  <p className="mt-2 text-xs leading-relaxed text-neutral-400">
                    Powered by a C++/Rust Core and WebSockets, Flippy ensures sub-millisecond data
                    synchronization between your canvas and your game build.
                  </p>
                </div>
              </div>

              <div className="group flex flex-col justify-between border border-white/15 bg-[#06070b] p-6">
                <div className="mb-6 overflow-hidden border border-white/10 bg-black">
                  <img
                    src="/images/HAsIE9Aq2mpVTxiDpD0N4mFeOI.avif"
                    alt="AI to Assets / Train"
                    className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-medium text-white">AI to Assets / Train</h3>
                  <p className="mt-2 text-xs leading-relaxed text-neutral-400">
                    Our AI doesn&apos;t just generate images; it generates structured, consistent,
                    and optimized assets ready for the engine, maintaining your project&apos;s
                    unique art style automatically.
                  </p>
                </div>
              </div>

              <div className="group flex flex-col justify-between border border-white/15 bg-[#06070b] p-6">
                <div className="mb-6 overflow-hidden border border-white/10 bg-black">
                  <img
                    src="/images/xfoT2XzBrnLXk7r22b3xvNjgSHk.avif"
                    alt="Design to Engine"
                    className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-medium text-white">Design to Engine</h3>
                  <p className="mt-2 text-xs leading-relaxed text-neutral-400">
                    Build once, sync everywhere. Flippy&apos;s core architecture allows simultaneous
                    synchronization across multiple engines (Unity, Unreal, Godot), ensuring a
                    unified production line.
                  </p>
                </div>
              </div>
            </div>

            {/* Row 2: 2 Wide Interactive Cards */}
            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <div className="group flex flex-col justify-between border border-white/15 bg-[#06070b] p-6">
                <div className="overflow-hidden border border-white/10 bg-black">
                  <img
                    src="/images/9KoWhcWi1RCukPzpWnKDLCByfVM.avif"
                    alt="Designer-Centric Co-Pilot"
                    className="h-80 w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="mt-6">
                  <h3 className="text-xl font-medium text-white">Designer-Centric Co-Pilot</h3>
                  <p className="mt-2 text-xs leading-relaxed text-neutral-400">
                    The AI doesn&apos;t replace the designer; it acts as a high-speed assistant that
                    handles repetitive tasks and explores creative variations within seconds.
                  </p>
                </div>
              </div>

              <div className="group flex flex-col justify-between border border-white/15 bg-[#06070b] p-6">
                <div className="overflow-hidden border border-white/10 bg-black">
                  <img
                    src="/images/9eeFRX3eJ8iBestQ8P5ZNqs8D0.avif"
                    alt="Flippy Vision Semantic Scan"
                    className="h-80 w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="mt-6">
                  <h3 className="text-xl font-medium text-white">Flippy Vision</h3>
                  <p className="mt-2 text-xs leading-relaxed text-neutral-400">
                    A local AI layer that automatically detects drawings on the canvas (buttons,
                    panels, sliders, 2D characters, backgrounds, etc.) and identifies &quot;what
                    they are.&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <PricingSection
          plans={plans}
          yearlyDiscountPercent={Number(settings.yearly_discount_percent || 20)}
        />

        {/* LIVE-SYNC ENGINE BRIDGE */}
        <EngineBridgeSection />

        {/* INSTALLABLE PACKAGES DOWNLOAD AREA */}
        <DownloadSection releases={releases} onDownloaded={loadSiteData} />

        {/* FAQ ACCORDION */}
        <FaqSection />

        {/* FINAL CTA BANNER */}
        <section className="relative overflow-hidden border-t border-white/10 bg-gradient-to-br from-neutral-600/30 via-[#0a0b0e] to-[#040507] px-6 py-24 sm:px-10">
          <div className="mx-auto max-w-[1380px]">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-medium leading-tight tracking-tight text-white sm:text-5xl">
                Your &quot;Game Design&quot; future belongs in your hands. Start building today.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-neutral-300">
                We aren&apos;t just building another design tool; we are building the central
                nervous system of modern production. &quot;If it&apos;s on your canvas, it&apos;s
                already in your engine.&quot;
              </p>
              <Link
                to="/contact"
                className="mt-8 inline-block bg-white px-7 py-3 text-xs font-semibold text-black transition-colors hover:bg-[#0047FF] hover:text-white"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>

        {/* NEWSLETTER SUBSCRIBE */}
        <NewsletterSection />
      </div>
    </div>
  );
}
