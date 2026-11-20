import { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, Box, Cpu, Sparkles, Crosshair } from 'lucide-react';

export function CoreCanvasMockup() {
  const [activeNode, setActiveNode] = useState<'Frame' | 'Component' | 'Group' | 'Auto layout'>('Component');

  const nodes = [
    { name: 'Frame', color: 'border-amber-500/50 text-amber-300', dot: 'bg-amber-400' },
    { name: 'Component', color: 'border-purple-500/50 text-purple-300', dot: 'bg-purple-400' },
    { name: 'Group', color: 'border-emerald-500/50 text-emerald-300', dot: 'bg-emerald-400' },
    { name: 'Auto layout', color: 'border-cyan-500/50 text-cyan-300', dot: 'bg-cyan-400' },
  ] as const;

  return (
    <div className="relative mx-auto w-full max-w-[580px] select-none">
      {/* Main Flippy Studio Desktop Frame */}
      <div className="relative overflow-hidden rounded-xl border border-white/15 bg-[#090b10] p-5 shadow-[0_25px_80px_rgba(0,71,255,0.18)]">
        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <span className="inline-block h-2 w-2 rounded-full bg-[#00C2FF] animate-pulse" />
            <span>Flippy Studio v0.9.4</span>
          </div>
          <span className="font-mono text-[10px] text-[#00C2FF]">LIVE-SYNC: 0.4ms</span>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Left Panel */}
          <div className="col-span-5 space-y-2.5">
            <p className="text-[10px] text-neutral-400">Good Morning, Developer</p>
            <p className="text-xs font-semibold text-white">What would you like to open in Flippy?</p>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
              <p className="text-[11px] font-semibold text-white">Flippy Studio</p>
              <p className="mt-1 text-[10px] text-neutral-400">
                Design-to-Engine canvas. Sync to Unity, Unreal and Godot.
              </p>
              <div className="mt-2.5 inline-flex items-center gap-1 rounded bg-[#0047FF] px-2.5 py-1 text-[10px] font-semibold text-white">
                + New Design File
              </div>
            </div>
            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5 opacity-75">
              <p className="text-[10px] font-medium text-neutral-300">AI Studio</p>
              <p className="text-[9px] text-neutral-500">Full integrated train AI model system</p>
            </div>
          </div>

          {/* Community Grid */}
          <div className="col-span-7">
            <div className="mb-2 flex items-center justify-between text-[10px] text-neutral-400">
              <span>Community Design Systems</span>
              <span className="text-[#00C2FF]">Trending</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { title: 'Abstract 1.0', grad: 'from-blue-600/40 to-indigo-950' },
                { title: 'Grayscale UI', grad: 'from-neutral-600/30 to-neutral-950' },
                { title: 'Cyber HUD', grad: 'from-cyan-500/30 to-slate-950' },
                { title: 'RPG Inventory', grad: 'from-purple-600/30 to-neutral-950' },
              ].map((card) => (
                <div
                  key={card.title}
                  className={`h-16 rounded-md border border-white/10 bg-gradient-to-br ${card.grad} p-2 flex flex-col justify-end`}
                >
                  <span className="text-[10px] font-medium text-white/90">{card.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Animated Node Hierarchy Overlay */}
      <motion.div
        initial={{ y: 12, opacity: 0.9 }}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative -mt-12 ml-auto mr-4 w-[270px] rounded-xl border border-white/20 bg-[#0b0e16]/95 p-3 shadow-2xl backdrop-blur-md"
      >
        <div className="mb-2 flex items-center justify-between text-[10px] font-mono text-neutral-400">
          <span className="flex items-center gap-1">
            <Layers className="h-3 w-3 text-[#00C2FF]" />
            SCENE HIERARCHY
          </span>
          <span className="text-emerald-400">● SYNCED</span>
        </div>
        <div className="space-y-1.5">
          {nodes.map((node) => {
            const isSelected = activeNode === node.name;
            return (
              <button
                key={node.name}
                type="button"
                onClick={() => setActiveNode(node.name)}
                className={`flex w-full items-center justify-between rounded border px-2.5 py-1.5 text-left text-[11px] transition-all ${
                  isSelected
                    ? `${node.color} bg-white/10 shadow-[0_0_15px_rgba(0,194,255,0.2)]`
                    : 'border-white/10 bg-white/[0.02] text-neutral-400 hover:border-white/20'
                }`}
              >
                <span className="flex items-center gap-2 font-mono">
                  <span className={`h-1.5 w-1.5 rounded-full ${node.dot}`} />
                  {node.name}
                </span>
                <span className="font-mono text-[9px] opacity-70">RectTransform</span>
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

export function CoPilotDifficultyDemo() {
  const [selected, setSelected] = useState<'EASY' | 'NORMAL' | 'HARD' | 'INSANITY'>('HARD');

  const levels = [
    { id: 'EASY', desc: 'Story focused combat & forgiving HUD' },
    { id: 'NORMAL', desc: 'Balanced tactical pacing & standard telemetry' },
    { id: 'HARD', desc: 'Enemies deal +45% damage. Precision required.' },
    { id: 'INSANITY', desc: 'Permadeath mode. Minimalist diegetic HUD.' },
  ] as const;

  return (
    <div className="relative h-full min-h-[260px] overflow-hidden rounded-lg border border-white/10 bg-[#06080d] p-4">
      <div className="mb-3 flex items-center justify-between font-mono text-[10px] text-neutral-400">
        <span className="flex items-center gap-1.5 text-[#00C2FF]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00C2FF]" />
          Frame_Difficulty_Screen_1
        </span>
        <span>Set Flow → Auto-Bind C#</span>
      </div>

      <div className="space-y-1.5">
        {levels.map((lvl) => {
          const active = selected === lvl.id;
          return (
            <button
              key={lvl.id}
              type="button"
              onClick={() => setSelected(lvl.id)}
              className={`relative flex w-full items-center justify-between border px-3 py-2 text-left transition-all ${
                active
                  ? 'border-emerald-400 bg-emerald-500/10 text-white'
                  : 'border-white/10 bg-white/[0.02] text-neutral-400 hover:border-white/25'
              }`}
            >
              <span className="font-mono text-xs font-semibold tracking-wider">{lvl.id}</span>
              {active && (
                <motion.span
                  layoutId="copilot-badge"
                  className="rounded bg-red-600 px-2 py-0.5 font-mono text-[9px] font-bold text-white"
                >
                  A SELECT
                </motion.span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-3 border-t border-white/10 pt-2.5 font-mono text-[10px] text-neutral-400">
        <span className="text-[#00C2FF]">Co-Pilot State:</span>{' '}
        {levels.find((l) => l.id === selected)?.desc}
      </div>
    </div>
  );
}

export function VisionCanvasDemo() {
  const [hoveredBox, setHoveredBox] = useState<string>('Character Sprite');

  const boxes = [
    {
      id: 'Text',
      label: 'Text · Font 48px',
      pos: 'left-4 top-8 w-28 h-16',
      border: 'border-cyan-400',
      tagBg: 'bg-cyan-500/20 text-cyan-300',
    },
    {
      id: 'Weapon',
      label: 'Weapon · Image Asset',
      pos: 'left-28 top-24 w-24 h-12',
      border: 'border-fuchsia-400',
      tagBg: 'bg-fuchsia-500/20 text-fuchsia-300',
    },
    {
      id: 'Character Sprite',
      label: 'Character Sprite · 1024px',
      pos: 'right-6 top-14 w-32 h-36',
      border: 'border-yellow-400',
      tagBg: 'bg-yellow-500/20 text-yellow-300',
    },
    {
      id: 'Button',
      label: 'Button · Interaction Hover',
      pos: 'right-4 top-3 w-28 h-8',
      border: 'border-indigo-400',
      tagBg: 'bg-indigo-500/20 text-indigo-300',
    },
  ];

  return (
    <div className="relative h-full min-h-[260px] overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-[#0d1b3e] via-[#081024] to-[#05060a] p-4">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 flex items-center justify-between font-mono text-[10px] text-neutral-300">
        <span className="flex items-center gap-1.5">
          <Crosshair className="h-3.5 w-3.5 text-[#00C2FF]" />
          FLIPPY VISION AI · SEMANTIC SCAN
        </span>
        <span className="rounded bg-white/10 px-2 py-0.5 text-[9px] text-white">
          Detected: {hoveredBox}
        </span>
      </div>

      {/* Bounding boxes */}
      <div className="relative mt-4 h-[195px]">
        {boxes.map((box) => {
          const active = hoveredBox === box.id;
          return (
            <button
              key={box.id}
              type="button"
              onMouseEnter={() => setHoveredBox(box.id)}
              onClick={() => setHoveredBox(box.id)}
              className={`absolute ${box.pos} border ${box.border} transition-all ${
                active ? 'bg-white/10 shadow-[0_0_20px_rgba(0,194,255,0.25)]' : 'bg-transparent opacity-75'
              }`}
            >
              <span
                className={`absolute -top-5 left-0 whitespace-nowrap px-1.5 py-0.5 font-mono text-[9px] ${box.tagBg}`}
              >
                {box.label}
              </span>
              {/* Corner handles */}
              <span className="absolute -left-1 -top-1 h-1.5 w-1.5 bg-white" />
              <span className="absolute -right-1 -top-1 h-1.5 w-1.5 bg-white" />
              <span className="absolute -bottom-1 -left-1 h-1.5 w-1.5 bg-white" />
              <span className="absolute -bottom-1 -right-1 h-1.5 w-1.5 bg-white" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AiLayersVisual() {
  const layers = ['AI Style Training', 'Custom Library', 'Generative AI', 'Optimized Asset Ready'];
  return (
    <div className="flex h-44 flex-col items-center justify-center gap-2 py-2">
      {layers.map((layer, idx) => (
        <motion.div
          key={layer}
          whileHover={{ scale: 1.04, borderColor: 'rgba(0,194,255,0.6)' }}
          className="flex w-4/5 items-center justify-between rounded border border-white/15 bg-white/[0.03] px-3 py-2 text-[11px] font-medium text-neutral-200 backdrop-blur"
          style={{ transform: `perspective(600px) rotateX(18deg) translateY(${idx * -2}px)` }}
        >
          <span>{layer}</span>
          <Sparkles className="h-3 w-3 text-[#00C2FF]" />
        </motion.div>
      ))}
    </div>
  );
}

export function DesignToEngineVisual() {
  return (
    <div className="flex h-44 flex-col items-center justify-between py-2 text-center">
      <div className="flex items-center gap-2 rounded border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-bold">
        <Cpu className="h-3.5 w-3.5 text-[#00C2FF]" />
        Flippy <span className="text-[10px] font-mono text-[#00C2FF]">CORE</span>
      </div>
      <div className="h-4 w-px bg-gradient-to-b from-[#00C2FF] to-white/20" />
      <div className="flex flex-wrap justify-center gap-1.5">
        {['color', 'shape', 'status', 'spacing', 'effect'].map((tok) => (
          <span
            key={tok}
            className="rounded-full border border-white/15 bg-black/50 px-2 py-0.5 font-mono text-[9px] text-neutral-300"
          >
            {tok}
          </span>
        ))}
      </div>
      <div className="grid w-full grid-cols-3 gap-2 pt-2">
        {['Unity', 'Unreal', 'Godot'].map((eng) => (
          <div
            key={eng}
            className="flex items-center justify-center gap-1 rounded border border-white/10 bg-white/[0.03] py-1.5 text-[10px] font-semibold text-neutral-200"
          >
            <Box className="h-3 w-3 text-[#0047FF]" />
            {eng}
          </div>
        ))}
      </div>
    </div>
  );
}
