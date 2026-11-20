import { Link } from 'react-router-dom';
import { Linkedin } from 'lucide-react';
import { MatrixBackground } from '../components/MatrixBackground';

const PILLARS = [
  {
    num: '1',
    title: 'Define',
    desc: "We clarify the brand's strategic direction, positioning, and story.",
  },
  {
    num: '2',
    title: 'Design',
    desc: "Develop the brand's visual and verbal identity in an original, aesthetic.",
  },
  {
    num: '3',
    title: 'Implement',
    desc: 'We turn strategy into projects and deliver impactful results.',
  },
];

const TEAM = [
  {
    name: 'Egehan Doğan',
    role: 'Co-Founder / CEO',
    image: '/images/7rgOVOvDvrEVTBvDSvL7ynrNTM.avif',
    linkedin: 'https://www.linkedin.com',
  },
  {
    name: 'Şeyma Doğan',
    role: 'Co-Founder / CMO',
    image: '/images/vL0Kon6kXOSxVMdMcC9GZA5xI.webp',
    linkedin: 'https://www.linkedin.com',
  },
  {
    name: 'Gönül Kamalı',
    role: 'Business Consultant',
    image: '/images/Mm7TieArdbFOCq7F21DtM6e1qlw.webp',
    linkedin: 'https://www.linkedin.com',
  },
  {
    name: 'Veysi İşler',
    role: 'Investment Consultant',
    image: '/images/SaDQtJpRKFa65qSz29rIa7G3Tm0.webp',
    linkedin: 'https://www.linkedin.com',
  },
  {
    name: 'Kürşat Doğan',
    role: 'Chief Finance Officer',
    image: '/images/NhWMYTHP1A6TQ8y1EAPLflNPAPc.webp',
    linkedin: 'https://www.linkedin.com',
  },
  {
    name: 'Rümeysa Ünal',
    role: 'Technology Assistant',
    image: '/images/LEvnyYOSP1QczcCRJ2CWnvqJmUM.webp',
    linkedin: 'https://www.linkedin.com',
  },
];

const ROADMAP = [
  { id: 'A1', title: 'Talent Acquisition, Setup & Architectural Preparation' },
  { id: 'A2', title: 'Process Integration & Hybrid Canvas Development' },
  { id: 'A3', title: 'Technical Unity Integration & Multi-Engine Core' },
  { id: 'A4', title: 'Unreal Engine & Godot Integrations & Object Recognition' },
  { id: 'A5', title: 'Stable Diffusion Layer & Automated QA Pipeline' },
  { id: 'A6', title: 'Self-Healing AI & Closed Beta Preparation' },
  { id: 'A7', title: 'Closed Beta Distribution & Feedback Optimization' },
  { id: 'A8', title: 'Global SaaS Infrastructure & Monetization Integration' },
  { id: 'A9', title: 'Open Beta Global Launch & Growth Hacking' },
  { id: 'A10', title: 'Vibe Coding (No-Code Smart Logic) Integration' },
  { id: 'A11', title: 'Enterprise Tier Infrastructure & On-Premise AI' },
  { id: 'A12', title: 'Commercial SaaS Release (v1.0 Global Release)' },
];

export function StudioPage() {
  return (
    <div className="relative min-h-screen bg-[#040507] text-white">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-50">
        <MatrixBackground className="h-full w-full" />
      </div>

      <div className="relative z-10">
        {/* STUDIO HERO SECTION (matching screenshot 1) */}
        <section className="px-6 pb-20 pt-10 sm:px-10">
          <div className="mx-auto max-w-[1380px]">
            <div className="relative overflow-hidden border border-white/10 bg-gradient-to-br from-[#0028b8] via-[#4a1e5c] to-[#7a3f00] px-8 pb-14 pt-32 sm:px-14 sm:pt-44">
              {/* Subtle Studio Asterisk Watermark */}
              <div
                className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-10"
                aria-hidden="true"
              >
                <svg width="320" height="320" viewBox="0 0 100 100" fill="white">
                  <path d="M44 5h12v34l24-24 8.5 8.5L64.5 47H95v12H64.5l24 24-8.5 8.5-24-24V95H44V67.5l-24 24L11.5 83l24-24H5V47h30.5l-24-24L20 14.5l24 24V5z" />
                </svg>
              </div>

              <div className="relative z-10 max-w-2xl">
                <p className="mb-3 text-xs font-medium text-neutral-200">Branchout Studio</p>
                <h1 className="text-3xl font-medium leading-[1.12] tracking-tight text-white sm:text-5xl">
                  From early-stage teams to global-scale companies, we strategically unlock the
                  potential within the game.
                </h1>
                <p className="mt-4 text-xs leading-relaxed text-neutral-200 sm:text-sm">
                  We offer game companies a comprehensive growth ecosystem by providing
                  industry-specific brand consulting
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* WE ARE + 3 PILLARS (matching screenshot 2) */}
        <section className="border-t border-white/10 px-6 py-24 sm:px-10">
          <div className="mx-auto max-w-[1380px]">
            <div className="mx-auto max-w-3xl text-center">
              <p className="mb-4 text-xs font-medium text-neutral-400">We Are</p>
              <h2 className="text-3xl font-medium leading-tight tracking-tight text-white sm:text-5xl">
                Branchout Studio Games was founded to help game studios grow{' '}
                <span className="text-neutral-500">
                  not only their products but also their brands.
                </span>
              </h2>
            </div>

            <div className="mt-16 grid gap-5 md:grid-cols-3">
              {PILLARS.map((item) => (
                <div
                  key={item.num}
                  className="border border-white/15 bg-[#06070a]/90 p-8 transition-colors hover:border-white/30"
                >
                  <div className="mb-8 text-2xl font-medium text-[#0066ff]">{item.num}</div>
                  <h3 className="text-xl font-medium text-white">{item.title}</h3>
                  <p className="mt-3 text-xs leading-relaxed text-neutral-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WIDE CREATION OS BANNER (matching screenshot 3) */}
        <section className="px-6 py-8 sm:px-10">
          <div className="mx-auto max-w-[1380px]">
            <div className="corner-fold-white overflow-hidden border border-white/15 bg-black">
              <img
                src="/images/BPu0bmmFmbv72iUplN9L5OJet9c.avif"
                alt="Flippy Real-Time Creation OS"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </section>

        {/* VISION QUOTE (matching screenshot 4) */}
        <section className="px-6 py-24 sm:px-10">
          <div className="mx-auto max-w-[1380px]">
            <div className="max-w-2xl">
              <p className="mb-3 text-xs font-medium text-neutral-400">Vision</p>
              <h2 className="text-3xl font-medium leading-snug tracking-tight text-white sm:text-4xl">
                We believe every product carries a story, and that story only becomes true value
                when told authentically, and a real brand when experienced meaningfully.
              </h2>
            </div>
          </div>
        </section>

        {/* TEAM SECTION (matching screenshots 5 & 6) */}
        <section className="border-t border-white/10 px-6 py-24 sm:px-10">
          <div className="mx-auto max-w-[1380px]">
            <p className="mb-2 text-xs font-medium text-neutral-400">Team</p>
            <h2 className="mb-12 max-w-lg text-3xl font-medium leading-tight tracking-tight text-white sm:text-4xl">
              Meet our industry experts team members
            </h2>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {TEAM.map((member) => (
                <div key={member.name} className="group">
                  <div className="overflow-hidden border border-white/10 bg-[#0b0c10]">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-base font-medium text-white">{member.name}</h3>
                    <p className="mt-0.5 text-xs text-neutral-400">{member.role}</p>
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${member.name} LinkedIn`}
                      className="mt-2.5 inline-flex h-5 w-5 items-center justify-center border border-white/25 text-neutral-400 transition-colors hover:border-white hover:text-white"
                    >
                      <Linkedin className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRESERVED: TÜBİTAK 1507 R&D GRANT */}
        <section className="border-t border-white/10 px-6 py-20 sm:px-10">
          <div className="mx-auto max-w-[1380px]">
            <div className="corner-fold-blue border border-white/15 bg-[#080a0f] p-8 sm:p-12">
              <p className="font-mono text-xs uppercase tracking-widest text-neutral-400">
                1507 TÜBİTAK KOBİ Ar-Ge Başlangıç Destek Programı
              </p>
              <div className="mt-3 text-4xl font-semibold text-white sm:text-5xl">
                1.724.732 TL
              </div>
              <p className="mt-3 max-w-2xl text-sm text-neutral-400">
                Flippy Studio has been awarded national R&amp;D grant support under the TÜBİTAK
                1507 SME R&amp;D Start-Up Support Programme for deep-tech systems programming and
                AI-assisted game engine synchronization.
              </p>
            </div>
          </div>
        </section>

        {/* PRESERVED: ROADMAP A1-A12 */}
        <section className="border-t border-white/10 px-6 py-20 sm:px-10">
          <div className="mx-auto max-w-[1380px]">
            <h2 className="mb-8 text-3xl font-medium">Product &amp; Commercialization Roadmap</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {ROADMAP.map((step) => (
                <div key={step.id} className="border border-white/15 bg-[#07090d] p-5">
                  <span className="font-mono text-xs font-bold text-[#00C2FF]">{step.id}</span>
                  <p className="mt-2 text-xs leading-relaxed text-neutral-200">{step.title}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BOTTOM CTA BANNER (matching screenshot 7) */}
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
      </div>
    </div>
  );
}
