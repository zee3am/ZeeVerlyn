import { CornerWeb } from './SpiderWebDecor';

export default function Footer() {
  const year = new Date().getFullYear();

  const handleNavClick = (href) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="relative w-full bg-[#1d1b18] border-t-4 border-[#111111] overflow-hidden">
      <CornerWeb position="top-right" size={130} color="#ff6fa5" />
      <CornerWeb position="bottom-left" size={130} color="#00f0ff" />

      {/* Halftone BG */}
      <div className="absolute inset-0 halftone-bg opacity-10 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-16 py-12 flex flex-col md:flex-row justify-between items-center gap-8">
        {/* Brand */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <span
            className="font-[Anybody] text-4xl font-black italic text-[#f4a6c1] tracking-tighter flex items-center gap-2"
            style={{ textShadow: '4px 4px 0px #ff6fa5' }}
          >
            <span>ZeeVerlyn</span>
            <span className="text-2xl text-[#00f0ff]">🕸️</span>
          </span>
          <p className="font-[Bricolage_Grotesque] text-sm text-[#837377] italic">
            Our Story, Our Spider-Verse ✨
          </p>
          <p className="font-[Hanken_Grotesk] text-xs text-[#514347] mt-1">
            © {year} ZeeVerlyn Archive • Hand-drawn with Spider-Sense & Love 💕
          </p>
        </div>

        {/* Nav links */}
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {[
            { label: 'Home', href: '#hero' },
            { label: 'Timeline', href: '#timeline' },
            { label: 'Gallery', href: '#gallery' },
            { label: 'Favorites', href: '#favorites' },
            { label: 'Playlist', href: '#playlist' },
            { label: 'Letter', href: '#letter' },
          ].map(link => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link.href)}
              className="font-[Hanken_Grotesk] text-xs font-bold uppercase tracking-widest text-[#d6c1c6] hover:text-[#ff6fa5] transition-colors"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Heart & Spider badge */}
        <div className="bg-[#ff6fa5] border-2 border-[#f4a6c1] px-5 py-3 rotate-[-1deg] comic-shadow-pink flex items-center gap-2">
          <p className="font-[Anybody] text-sm font-black text-white uppercase tracking-wider">
            Made with ♥ across the Spider-Verse
          </p>
          <span className="text-base">🕸️</span>
        </div>
      </div>

      {/* Bottom strip */}
      <div className="h-3 w-full bg-[#ff6fa5] border-t-2 border-[#f4a6c1]" />
    </footer>
  );
}
