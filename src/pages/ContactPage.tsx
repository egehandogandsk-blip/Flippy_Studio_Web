import { useState } from 'react';
import { Mail, CheckCircle2, Loader2, Send } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { MatrixBackground } from '../components/MatrixBackground';

export function ContactPage() {
  const [formOpen, setFormOpen] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('general');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sentInfo, setSentInfo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSentInfo(null);
    try {
      const res = await apiFetch<{ message: string }>('/api/contact', {
        method: 'POST',
        body: JSON.stringify({ name, email, subject, category, message }),
      });
      setSentInfo(res.message);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setError(err.message || 'Failed to send message.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#040507] px-6 py-20 text-white sm:px-10">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-50">
        <MatrixBackground className="h-full w-full" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1380px]">
        <p className="mb-2 text-xs text-neutral-400">Contact us</p>
        <h1 className="text-4xl font-medium tracking-tight text-white sm:text-5xl">
          How can we help you?
        </h1>

        {/* Main Contact Box matching screenshot 13 */}
        <div className="mt-10 border border-white/15 bg-[#06070a]/90 p-8 sm:p-12">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="max-w-xs text-sm leading-relaxed text-neutral-300">
                We&apos;re here to listen, help, and make things happen.
              </p>

              <button
                type="button"
                onClick={() => setFormOpen((v) => !v)}
                className="mt-6 inline-flex items-center gap-2 bg-white px-6 py-3 text-xs font-semibold text-black transition-colors hover:bg-[#0047FF] hover:text-white"
              >
                <Mail className="h-3.5 w-3.5" />
                Send E-Mail
              </button>

              <div className="mt-8 space-y-2 border-t border-white/10 pt-6 font-mono text-xs text-neutral-400">
                <p>DIRECT: hello@branchout.studio</p>
                <p>STUDIO: Branchout Studio · Istanbul / Global</p>
              </div>
            </div>

            <div className="lg:col-span-7">
              {formOpen && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {sentInfo && (
                    <div className="flex items-center gap-2 border border-emerald-500/40 bg-emerald-500/10 p-3.5 text-xs text-emerald-300">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>{sentInfo}</span>
                    </div>
                  )}
                  {error && (
                    <div className="border border-red-500/40 bg-red-500/10 p-3.5 text-xs text-red-300">
                      {error}
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs text-neutral-400">Your Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alex Mercer"
                        className="w-full border border-white/15 bg-black/60 px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#0047FF]"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs text-neutral-400">Email Address</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alex@studio.com"
                        className="w-full border border-white/15 bg-black/60 px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#0047FF]"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs text-neutral-400">Subject</label>
                      <input
                        type="text"
                        required
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Enterprise / Custom AI Model Inquiry"
                        className="w-full border border-white/15 bg-black/60 px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#0047FF]"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs text-neutral-400">Department</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full border border-white/15 bg-black/60 px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#0047FF]"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="sales">Enterprise &amp; Custom Model</option>
                        <option value="support">Technical Support</option>
                        <option value="partnership">Partnership / Investor</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs text-neutral-400">Message</label>
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us about your game project, target engine, or studio requirements..."
                      className="w-full border border-white/15 bg-black/60 px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#0047FF]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 bg-[#0047FF] px-6 py-3 text-xs font-semibold text-white transition-colors hover:bg-[#0036cc] disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* CEO Message Banner matching screenshot 14 */}
        <div className="corner-fold-white mt-12 border border-white/15 bg-gradient-to-r from-[#1a2234] via-[#262b36] to-[#11141c] p-8 sm:p-14">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <p className="mb-3 text-xs font-medium text-neutral-300">CEO message</p>
              <blockquote className="text-2xl font-medium leading-snug tracking-tight text-white sm:text-4xl">
                &ldquo;At flippy, we believe in a future where game design is available to everyone,
                and we grow with the most important technology of our time.&rdquo;
              </blockquote>
            </div>
            <div className="space-y-3 text-xs text-neutral-300 lg:col-span-4 lg:text-right">
              <p className="font-medium text-white">We aren&apos;t just coding a tool.</p>
              <p>We are optimizing the binary flow of creativity.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
