import { useState } from 'react';
import { Download, Monitor, Cpu, Check, Copy, Lock } from 'lucide-react';
import { Release } from '../lib/api';

const PLATFORM_LABELS: Record<string, string> = {
  windows: 'Windows x64',
  macos: 'macOS Universal',
  linux: 'Linux AppImage',
  unity: 'Unity Plugin',
  unreal: 'Unreal Engine 5',
  godot: 'Godot 4 Addon',
};

export function DownloadSection({
  releases,
  onDownloaded,
}: {
  releases: Release[];
  onDownloaded?: () => void;
}) {
  const [filter, setFilter] = useState<'all' | 'desktop' | 'plugins'>('all');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const filtered = releases.filter((r) => {
    if (filter === 'desktop') return ['windows', 'macos', 'linux'].includes(r.platform);
    if (filter === 'plugins') return ['unity', 'unreal', 'godot'].includes(r.platform);
    return true;
  });

  const handleCopySha = (id: number, sha: string) => {
    navigator.clipboard?.writeText(sha);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleDownload = (release: Release) => {
    if (!release.is_available) return;
    window.open(`/api/releases/${release.id}/download`, '_blank');
    if (onDownloaded) {
      setTimeout(onDownloaded, 600);
    }
  };

  return (
    <section id="downloads" className="relative border-t border-white/10 px-6 py-24 sm:px-10">
      <div className="mx-auto max-w-[1380px]">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-[#00C2FF]">
              Installer Packages &amp; Engine Bridges
            </p>
            <h2 className="text-3xl font-medium tracking-tight text-white sm:text-5xl">
              Download Flippy Studio
            </h2>
            <p className="mt-3 max-w-xl text-sm text-neutral-400">
              Install the standalone C++/Rust Hybrid Canvas desktop application and connect your
              preferred game engine with native Live-Sync plugins.
            </p>
          </div>

          <div className="flex border border-white/15 bg-[#0a0b0e] p-1 text-xs">
            {[
              { id: 'all', label: 'All Packages' },
              { id: 'desktop', label: 'Desktop App' },
              { id: 'plugins', label: 'Engine Plugins' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id as any)}
                className={`px-4 py-2 font-medium transition-colors ${
                  filter === tab.id
                    ? 'bg-white text-black'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((rel) => {
            const isDesktop = ['windows', 'macos', 'linux'].includes(rel.platform);
            return (
              <div
                key={rel.id}
                className="flex flex-col justify-between border border-white/15 bg-[#080a0f] p-6 transition-colors hover:border-white/30"
              >
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 font-mono text-xs text-[#00C2FF]">
                      {isDesktop ? (
                        <Monitor className="h-4 w-4" />
                      ) : (
                        <Cpu className="h-4 w-4" />
                      )}
                      {PLATFORM_LABELS[rel.platform] || rel.platform}
                    </span>
                    <span className="border border-white/15 px-2 py-0.5 font-mono text-[10px] text-neutral-300">
                      {rel.version}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-white">{rel.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-neutral-400">
                    {rel.release_notes}
                  </p>

                  <div className="mt-4 space-y-1.5 border-t border-white/10 pt-4 font-mono text-[11px] text-neutral-400">
                    <div className="flex justify-between">
                      <span>Package</span>
                      <span className="truncate max-w-[190px] text-neutral-200">
                        {rel.file_name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Size · Downloads</span>
                      <span className="text-neutral-200">
                        {rel.file_size} · {rel.download_count}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span>SHA-256</span>
                      <button
                        type="button"
                        onClick={() => handleCopySha(rel.id, rel.sha256)}
                        className="inline-flex items-center gap-1 text-neutral-300 hover:text-[#00C2FF]"
                        title="Copy SHA-256"
                      >
                        <span>{rel.sha256.slice(0, 12)}...</span>
                        {copiedId === rel.id ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  {rel.is_available ? (
                    <button
                      type="button"
                      onClick={() => handleDownload(rel)}
                      className="flex w-full items-center justify-center gap-2 bg-white py-2.5 text-xs font-semibold text-black transition-colors hover:bg-[#0047FF] hover:text-white"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download Installer
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="flex w-full cursor-not-allowed items-center justify-center gap-2 border border-white/15 bg-white/[0.03] py-2.5 text-xs font-medium text-neutral-500"
                    >
                      <Lock className="h-3.5 w-3.5" />
                      Upcoming Release
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
