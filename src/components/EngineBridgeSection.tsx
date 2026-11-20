import { useState } from 'react';
import { motion } from 'framer-motion';

const ENGINES = [
  {
    id: 'unity',
    name: 'Unity',
    badge: 'C# · UGUI / UI Toolkit',
    latency: '0.38 ms',
    output: 'RectTransform + Prefab Hierarchy',
  },
  {
    id: 'unreal',
    name: 'UNREAL ENGINE',
    badge: 'C++ · UMG / Slate',
    latency: '0.44 ms',
    output: 'UUserWidget + Slate Slot Tree',
  },
  {
    id: 'godot',
    name: 'GODOT',
    badge: 'GDScript / C# · Control Nodes',
    latency: '0.31 ms',
    output: 'Control Node Scene (.tscn)',
  },
];

export function EngineBridgeSection() {
  const [activeEngine, setActiveEngine] = useState('unity');
  const current = ENGINES.find((e) => e.id === activeEngine) || ENGINES[0];

  return (
    <section id="engines" className="relative border-t border-white/10 px-6 py-24 sm:px-10">
      <div className="mx-auto max-w-[1380px]">
        <div className="mb-12 grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-neutral-400">
              &quot;Live-Sync&quot; Engine Bridge
            </p>
            <h2 className="text-3xl font-medium leading-tight tracking-tight text-white sm:text-5xl">
              Eliminates traditional export/import cycles by streaming live production data between
              the canvas and the engine.
            </h2>
          </div>
          <div className="lg:col-span-5 lg:text-right">
            <p className="ml-auto max-w-sm text-left text-xs leading-relaxed text-neutral-400 lg:text-right">
              Ensures data integrity by allowing changes to reflect across both the design
              environment and the game build simultaneously.
            </p>
          </div>
        </div>

        <div className="grid overflow-hidden border border-white/15 bg-[#080a0f] lg:grid-cols-12">
          {/* Left Engine Selector */}
          <div className="flex flex-col justify-center gap-3 border-b border-white/10 bg-gradient-to-br from-[#0b1328] to-[#05060a] p-8 lg:col-span-5 lg:border-b-0 lg:border-r">
            {ENGINES.map((engine) => {
              const selected = engine.id === activeEngine;
              return (
                <button
                  key={engine.id}
                  type="button"
                  onClick={() => setActiveEngine(engine.id)}
                  className={`flex items-center justify-between border px-6 py-5 text-left transition-all ${
                    selected
                      ? 'border-[#00C2FF] bg-[#0047FF]/20 text-white shadow-[0_0_30px_rgba(0,71,255,0.25)]'
                      : 'border-white/15 bg-black/40 text-neutral-300 hover:border-white/30'
                  }`}
                >
                  <div>
                    <div className="text-xl font-bold tracking-wide">{engine.name}</div>
                    <div className="mt-1 font-mono text-[11px] text-neutral-400">{engine.badge}</div>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        selected ? 'bg-emerald-400 animate-ping' : 'bg-neutral-600'
                      }`}
                    />
                    <span className={selected ? 'text-emerald-400' : 'text-neutral-500'}>
                      {selected ? engine.latency : 'Ready'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Description with Signature Blue Corner Fold */}
          <div className="corner-fold-blue flex flex-col justify-between p-8 sm:p-12 lg:col-span-7">
            <div>
              <h3 className="mb-6 text-2xl font-medium text-white sm:text-3xl">
                A massive shift in our development speed
              </h3>
              <div className="space-y-4 text-sm leading-relaxed text-neutral-400">
                <p>
                  All resource inputs such as Game UI components, 2D assets, design systems, and
                  atlas maps placed on the hybrid canvas are aggregated into a single smart hub
                  within the Flippy ecosystem and semantically defined.
                </p>
                <p>
                  All processed components are broken down based on their parametric attributes such
                  as color, geometric shape, animation status, spacing, font, and sprite type and
                  converted into optimized packages that target engines can read directly.
                </p>
                <p>
                  The prepared smart packages are simultaneously transferred to Unity, Unreal
                  Engine, and Godot as ready-to-use objects with their hierarchical structures
                  preserved, at speeds of less than a millisecond, via version control systems
                  (GitHub) and local plugins.
                </p>
              </div>
            </div>

            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 flex flex-wrap items-center justify-between gap-4 border border-white/10 bg-black/50 px-4 py-3 font-mono text-xs"
            >
              <div>
                <span className="text-neutral-500">ACTIVE TARGET:</span>{' '}
                <span className="text-white font-semibold">{current.name}</span>
              </div>
              <div>
                <span className="text-neutral-500">GENERATED:</span>{' '}
                <span className="text-[#00C2FF]">{current.output}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
