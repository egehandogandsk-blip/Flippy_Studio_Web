import { Link } from 'react-router-dom';
import { FlippyLogo } from './Navbar';

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#040507] px-6 py-16 sm:px-10">
      <div className="mx-auto max-w-[1380px]">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-6">
            <div className="mb-4 text-xl">
              <FlippyLogo />
            </div>
            <p className="max-w-md text-xs leading-relaxed text-neutral-400">
              Branchout Studio is a platform company that develops and publishes innovative digital
              products for the gaming sector and creative industries, with the goal of growing this
              ecosystem. Our studio was established under Branchout Turkey, which has a strong
              methodological background in corporate strategy and business development.
            </p>
          </div>

          <div className="md:col-span-3">
            <h4 className="mb-4 text-sm font-semibold text-white">Pages</h4>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>
                <Link to="/#overview" className="transition-colors hover:text-white">
                  Overview
                </Link>
              </li>
              <li>
                <Link to="/#product" className="transition-colors hover:text-white">
                  Product
                </Link>
              </li>
              <li>
                <Link to="/#features" className="transition-colors hover:text-white">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/#pricing" className="transition-colors hover:text-white">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/download" className="transition-colors hover:text-white">
                  Download
                </Link>
              </li>
              <li>
                <Link to="/studio" className="transition-colors hover:text-white">
                  Studio
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="mb-4 text-sm font-semibold text-white">Socials</h4>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>
                <a
                  href="https://www.linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-white"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-white"
                >
                  Instagram
                </a>
              </li>
              <li>
                <Link to="/contact" className="transition-colors hover:text-white">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 text-xs text-neutral-500 sm:flex-row sm:items-center">
          <p>© 2026 Branchout Studio All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/contact" className="hover:text-neutral-300">
              Privacy policy
            </Link>
            <Link to="/contact" className="hover:text-neutral-300">
              Terms of service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
