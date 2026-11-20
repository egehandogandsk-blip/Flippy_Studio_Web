import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const FAQS = [
  {
    q: 'What is Flippy Studio and how does it work?',
    a: 'Flippy Studio is a hybrid desktop design-to-engine platform built on a C++/Rust core and WebGL/PixiJS canvas. It connects your vector and pixel UI designs directly to game engines via WebSockets and Protobuf, turning UI layers into native engine prefabs and widgets in sub-millisecond speeds.',
  },
  {
    q: 'Which game engines and design tools are supported?',
    a: 'Flippy natively supports Unity (C# UGUI & UI Toolkit), Unreal Engine 5 (C++ & UMG/Slate), and Godot 4 (GDScript/C# Control Nodes) simultaneously, with zero manual export/import cycles.',
  },
  {
    q: 'How does the live synchronization pipeline operate?',
    a: 'Every component placed on the Flippy Hybrid Canvas is parsed by Flippy Core into parametric attributes (color, geometry, 9-slice margins, pivot, anchors, state hierarchy) and streamed over local IPC / WebSockets directly into your running engine editor.',
  },
  {
    q: 'Will design updates break existing game logic or script references?',
    a: 'No. Flippy maintains semantic node IDs and hierarchy integrity. Visual updates, layout adjustments, and asset swaps update the engine prefab non-destructively while preserving your bound C#, C++, or GDScript references.',
  },
  {
    q: 'Is Flippy Studio a cloud service or does it run locally?',
    a: 'Flippy runs locally as a high-performance desktop application with local AI (Flippy Vision & Style-Trained Stable Diffusion) for zero-latency security, while offering optional cloud team sync and enterprise APIs.',
  },
  {
    q: 'How does it integrate with version control systems (Git, Perforce)?',
    a: 'Flippy Core generates deterministic, clean engine packages and design tokens that commit cleanly to GitHub, GitLab, and Perforce without binary merge conflicts.',
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative border-t border-white/10 px-6 py-24 sm:px-10">
      <div className="mx-auto max-w-[1380px] border border-white/10 bg-[#050609] p-8 sm:p-14">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-neutral-400">
              FAQs
            </p>
            <h2 className="text-3xl font-medium leading-tight tracking-tight text-white sm:text-5xl">
              Answers to your most common questions.
            </h2>
            <p className="mt-4 text-xs text-neutral-400">
              Here&apos;s everything you need to know before getting started.
            </p>
          </div>

          <div className="lg:col-span-7">
            <div className="divide-y divide-white/10 border border-white/10 bg-black/40">
              {FAQS.map((item, idx) => {
                const isOpen = openIndex === idx;
                return (
                  <div key={item.q}>
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? null : idx)}
                      className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-sm font-medium text-white transition-colors hover:bg-white/[0.03]"
                    >
                      <span>{item.q}</span>
                      {isOpen ? (
                        <Minus className="h-4 w-4 shrink-0 text-[#00C2FF]" />
                      ) : (
                        <Plus className="h-4 w-4 shrink-0 text-neutral-400" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-5 text-xs leading-relaxed text-neutral-400">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
