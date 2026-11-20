import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Shield, User as UserIcon, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function FlippyLogo({ dark = false }: { dark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 font-bold tracking-tight">
      <svg
        width="24"
        height="24"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <path
          d="M8 26V14C8 8.477 12.477 4 18 4H26V9.5H18C15.515 9.5 13.5 11.515 13.5 14V26H8Z"
          fill={dark ? '#050507' : '#FFFFFF'}
        />
        <path
          d="M15.5 20.5V15C15.5 13.343 16.843 12 18.5 12H24V17H19.5V20.5H15.5Z"
          fill="#0047FF"
        />
      </svg>
      <span className={dark ? 'text-[#050507]' : 'text-white'}>Flippy</span>
    </span>
  );
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSectionLink = (hash: string) => {
    setMobileOpen(false);
    if (location.pathname !== '/') {
      navigate('/' + hash);
      return;
    }
    const el = document.querySelector(hash);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full px-4 pt-3 sm:px-8">
      <div className="mx-auto flex max-w-[1380px] items-stretch gap-2">
        {/* Main crisp white navbar bar matching screenshot */}
        <div className="flex flex-1 items-center justify-between bg-white px-5 py-2.5 text-[#050507] shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
          <Link to="/" className="text-lg">
            <FlippyLogo dark />
          </Link>

          <nav className="hidden items-center gap-6 text-[13px] font-medium text-neutral-700 lg:flex">
            <button
              onClick={() => handleSectionLink('#overview')}
              className="transition-colors hover:text-[#0047FF]"
            >
              Overview
            </button>
            <button
              onClick={() => handleSectionLink('#product')}
              className="transition-colors hover:text-[#0047FF]"
            >
              Product
            </button>
            <button
              onClick={() => handleSectionLink('#features')}
              className="transition-colors hover:text-[#0047FF]"
            >
              Features
            </button>
            <button
              onClick={() => handleSectionLink('#pricing')}
              className="transition-colors hover:text-[#0047FF]"
            >
              Pricing
            </button>
            <button
              onClick={() => handleSectionLink('#engines')}
              className="transition-colors hover:text-[#0047FF]"
            >
              Game Engines
            </button>
            <button
              onClick={() => handleSectionLink('#faq')}
              className="transition-colors hover:text-[#0047FF]"
            >
              FAQ
            </button>
            <Link to="/studio" className="transition-colors hover:text-[#0047FF]">
              Studio
            </Link>
            <Link
              to="/download"
              className="inline-flex items-center gap-1 font-semibold text-[#0047FF] transition-colors hover:text-black"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </Link>
          </nav>

          <button
            className="p-1 text-black lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Separated Contact & Auth/Admin blocks matching screenshot geometry */}
        <div className="hidden items-stretch gap-2 lg:flex">
          <Link
            to="/contact"
            className="flex items-center bg-white px-6 text-[13px] font-semibold text-[#050507] shadow-[0_12px_40px_rgba(0,0,0,0.45)] transition-colors hover:bg-[#0047FF] hover:text-white"
          >
            Contact
          </Link>
          {user ? (
            <>
              <Link
                to="/account"
                className="flex items-center gap-1.5 border border-white/20 bg-[#0b0d14]/90 px-4 text-[13px] font-medium text-white backdrop-blur transition-colors hover:border-[#00C2FF]"
              >
                <UserIcon className="h-3.5 w-3.5 text-[#00C2FF]" />
                <span>{user.name.split(' ')[0]}</span>
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 bg-[#0047FF] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#0036cc]"
                >
                  <Shield className="h-3.5 w-3.5" />
                  <span>Admin</span>
                </Link>
              )}
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center border border-white/20 bg-[#0b0d14]/90 px-5 text-[13px] font-medium text-white backdrop-blur transition-colors hover:border-white hover:bg-white hover:text-black"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="mx-auto mt-2 max-w-[1380px] border border-white/15 bg-[#0a0b0e] p-5 text-sm lg:hidden">
          <div className="flex flex-col gap-3">
            <button onClick={() => handleSectionLink('#overview')} className="text-left text-neutral-300 hover:text-white">
              Overview
            </button>
            <button onClick={() => handleSectionLink('#product')} className="text-left text-neutral-300 hover:text-white">
              Product
            </button>
            <button onClick={() => handleSectionLink('#features')} className="text-left text-neutral-300 hover:text-white">
              Features
            </button>
            <button onClick={() => handleSectionLink('#pricing')} className="text-left text-neutral-300 hover:text-white">
              Pricing
            </button>
            <button onClick={() => handleSectionLink('#engines')} className="text-left text-neutral-300 hover:text-white">
              Game Engines
            </button>
            <button onClick={() => handleSectionLink('#faq')} className="text-left text-neutral-300 hover:text-white">
              FAQ
            </button>
            <Link to="/studio" onClick={() => setMobileOpen(false)} className="text-neutral-300 hover:text-white">
              Studio
            </Link>
            <Link to="/download" onClick={() => setMobileOpen(false)} className="text-[#00C2FF]">
              Download
            </Link>
            <Link to="/contact" onClick={() => setMobileOpen(false)} className="text-white font-semibold">
              Contact
            </Link>
            <div className="mt-2 flex gap-2 border-t border-white/10 pt-3">
              {user ? (
                <>
                  <Link
                    to="/account"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 border border-white/20 px-3 py-2 text-center"
                  >
                    Account
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 bg-[#0047FF] px-3 py-2 text-center font-semibold"
                    >
                      Admin Panel
                    </Link>
                  )}
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 bg-white px-3 py-2 text-center font-semibold text-black"
                >
                  Sign In / Sign Up
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
