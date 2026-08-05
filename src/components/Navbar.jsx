import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { label: 'Home', href: '#hero' },
  { label: 'Timeline', href: '#timeline' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Favorites', href: '#favorites' },
  { label: 'Playlist', href: '#playlist' },
  { label: 'Letter', href: '#letter' },
];

export default function Navbar({ onOpenAdmin }) {
  const [activeSection, setActiveSection] = useState('hero');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      const sections = navLinks.map(l => l.href.replace('#', ''));
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 120) {
          setActiveSection(id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex flex-col md:flex-row items-center justify-between w-full px-5 md:px-16 py-3 transition-all duration-300 ${
          scrolled
            ? 'bg-[#fff8f3]/95 backdrop-blur-sm border-b-2 border-[#1d1b18] shadow-[4px_4px_0px_0px_rgba(29,27,24,1)]'
            : 'bg-transparent'
        }`}
      >
        {/* Brand + mobile toggle row */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <button
            onClick={() => handleNavClick('#hero')}
            className="font-[Anybody] text-3xl font-black text-[#aa2c62] italic tracking-tighter hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
          >
            ZeeVerlyn
          </button>
          <button
            className="md:hidden p-2 border-2 border-[#1d1b18] bg-[#fff8f3] hover:bg-[#f4a6c1] transition-colors"
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined">{mobileOpen ? 'close' : 'menu'}</span>
          </button>
        </div>

        {/* Desktop nav pill */}
        <div className="hidden md:flex items-center gap-1 rounded-full border-2 border-[#1d1b18] bg-[#fff8f3] px-6 py-2 shadow-[4px_4px_0px_0px_rgba(29,27,24,1)] mx-auto">
          {navLinks.map(link => {
            const id = link.href.replace('#', '');
            const isActive = activeSection === id;
            return (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.href)}
                className={`font-[Hanken_Grotesk] text-[11px] tracking-[0.1em] font-bold px-4 py-2 uppercase transition-all hover:-translate-y-0.5 hover:-translate-x-0.5 ${
                  isActive
                    ? 'text-[#aa2c62] underline decoration-2 underline-offset-4'
                    : 'text-[#514347] hover:text-[#8a4b63]'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </div>

        {/* CTA buttons */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={onOpenAdmin}
            className="border-2 border-[#1d1b18] bg-[#ff6fa5] text-white font-[Anybody] text-[13px] font-bold px-4 py-2 rounded-full comic-shadow-sm hover:-translate-y-0.5 transition-transform flex items-center gap-1"
            title="Buka Love Studio ZeeVerlyn"
          >
            <span>🎨</span>
            <span>Love Studio</span>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-[60px] left-0 right-0 z-40 bg-[#fff8f3] border-b-2 border-[#1d1b18] flex flex-col"
          >
            {navLinks.map(link => {
              const id = link.href.replace('#', '');
              const isActive = activeSection === id;
              return (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className={`font-[Hanken_Grotesk] text-[12px] tracking-[0.1em] font-bold uppercase px-8 py-4 text-left border-b border-[#d6c1c6] transition-all ${
                    isActive
                      ? 'bg-[#f4a6c1] text-[#aa2c62]'
                      : 'text-[#514347] hover:bg-[#f9f2ed]'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
            <button
              onClick={() => { setMobileOpen(false); if (onOpenAdmin) onOpenAdmin(); }}
              className="font-[Anybody] text-[12px] tracking-[0.1em] font-black uppercase px-8 py-4 text-left bg-[#111111] text-[#00f0ff] flex items-center gap-2"
            >
              <span>🎨</span>
              <span>Love Studio</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
