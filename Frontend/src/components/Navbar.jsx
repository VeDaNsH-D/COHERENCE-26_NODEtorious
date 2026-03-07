import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import logo from '../assets/logo.svg';

const navItems = [
  { label: 'Features', href: '#features' },
  { label: 'Workflow', href: '#workflow' },
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'Security', href: '#security' },
  { label: 'Get Started', href: '#howitworks' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-5 left-0 right-0 z-50 flex justify-center px-4">
      <div className="w-full max-w-6xl rounded-full border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_0_60px_rgba(76,201,240,0.08)]">
        <div className="flex items-center justify-between px-6 py-3 md:px-7">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight text-white">
            <img src={logo} alt="Scout logo" className="h-7 w-7 object-contain" />
            <span>Scout</span>
          </Link>

          <div className="hidden items-center gap-7 lg:flex">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm text-white/65 transition-colors hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              to="/signup"
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="rounded-full bg-gradient-to-r from-[#ff7a18] to-[#ffc371] px-4 py-2 text-sm font-semibold text-[#1a1208] shadow-[0_0_24px_rgba(255,122,24,0.45)] transition hover:shadow-[0_0_34px_rgba(255,122,24,0.6)]"
            >
              Login
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-5 border-t border-white/10 px-6 py-5 lg:hidden"
            >
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="block text-sm text-white/80 transition-colors hover:text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <div className="flex gap-3 pt-1">
                <Link
                  to="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full bg-gradient-to-r from-[#ff7a18] to-[#ffc371] px-4 py-2 text-sm font-semibold text-[#1a1208]"
                >
                  Login
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
