import { motion } from 'framer-motion';

// Corner SVG Spider Web Component
export function CornerWeb({ position = 'top-left', className = '', color = '#ff6fa5', size = 140 }) {
  const getTransforms = () => {
    switch (position) {
      case 'top-right':
        return 'top-0 right-0 scale-x-[-1]';
      case 'bottom-left':
        return 'bottom-0 left-0 scale-y-[-1]';
      case 'bottom-right':
        return 'bottom-0 right-0 scale-x-[-1] scale-y-[-1]';
      case 'top-left':
      default:
        return 'top-0 left-0';
    }
  };

  return (
    <div
      className={`absolute pointer-events-none z-20 opacity-80 transition-opacity duration-300 ${getTransforms()} ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full filter drop-shadow-[2px_2px_0px_#111111]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Radial Web Strands */}
        <line x1="0" y1="0" x2="100" y2="0" stroke="#111111" strokeWidth="2.2" />
        <line x1="0" y1="0" x2="0" y2="100" stroke="#111111" strokeWidth="2.2" />
        <line x1="0" y1="0" x2="100" y2="100" stroke="#111111" strokeWidth="2.2" />
        <line x1="0" y1="0" x2="100" y2="40" stroke="#111111" strokeWidth="1.6" />
        <line x1="0" y1="0" x2="40" y2="100" stroke="#111111" strokeWidth="1.6" />

        <line x1="0" y1="0" x2="100" y2="100" stroke={color} strokeWidth="1.2" />
        <line x1="0" y1="0" x2="100" y2="40" stroke={color} strokeWidth="1" />
        <line x1="0" y1="0" x2="40" y2="100" stroke={color} strokeWidth="1" />

        {/* Concentric Smooth Web Arcs - Ring 1 to 4 */}
        <path d="M 20 0 Q 16 16 0 20" stroke="#111111" strokeWidth="1.8" fill="none" />
        <path d="M 20 0 Q 16 16 0 20" stroke={color} strokeWidth="1" fill="none" />

        <path d="M 45 0 Q 36 36 0 45" stroke="#111111" strokeWidth="1.8" fill="none" />
        <path d="M 45 0 Q 36 36 0 45" stroke={color} strokeWidth="1.2" fill="none" />

        <path d="M 70 0 Q 56 56 0 70" stroke="#111111" strokeWidth="1.8" fill="none" />
        <path d="M 70 0 Q 56 56 0 70" stroke={color} strokeWidth="1.2" fill="none" />

        <path d="M 95 0 Q 76 76 0 95" stroke="#111111" strokeWidth="2" fill="none" />
        <path d="M 95 0 Q 76 76 0 95" stroke={color} strokeWidth="1.4" fill="none" />

        {/* Dewdrops */}
        <circle cx="45" cy="18" r="2" fill="#00f0ff" stroke="#111" strokeWidth="0.8" />
        <circle cx="18" cy="45" r="2" fill="#ff6fa5" stroke="#111" strokeWidth="0.8" />
        <circle cx="62" cy="25" r="2.2" fill="#ffd900" stroke="#111" strokeWidth="0.8" />
      </svg>
    </div>
  );
}

// Hanging Spider animation component
export function HangingSpider({ className = '', style = {} }) {
  return (
    <motion.div
      className={`absolute z-30 pointer-events-none flex flex-col items-center origin-top ${className}`}
      style={style}
      animate={{ rotate: [-5, 5, -5] }}
      transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
    >
      {/* Spider Web String */}
      <div className="w-[1.5px] bg-[#111111] h-20 relative">
        <div className="absolute inset-0 w-full bg-[#ff6fa5] opacity-80" />
      </div>

      {/* Spider Body */}
      <div className="relative -mt-1 hover:scale-125 transition-transform pointer-events-auto cursor-pointer group">
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Spider Legs */}
          <path d="M16 12 Q8 6 4 10" stroke="#111111" strokeWidth="2" strokeLinecap="round" />
          <path d="M16 14 Q6 10 2 16" stroke="#111111" strokeWidth="2" strokeLinecap="round" />
          <path d="M16 16 Q6 18 3 24" stroke="#111111" strokeWidth="2" strokeLinecap="round" />
          <path d="M16 18 Q8 24 6 28" stroke="#111111" strokeWidth="2" strokeLinecap="round" />

          <path d="M16 12 Q24 6 28 10" stroke="#111111" strokeWidth="2" strokeLinecap="round" />
          <path d="M16 14 Q26 10 30 16" stroke="#111111" strokeWidth="2" strokeLinecap="round" />
          <path d="M16 16 Q26 18 29 24" stroke="#111111" strokeWidth="2" strokeLinecap="round" />
          <path d="M16 18 Q24 24 26 28" stroke="#111111" strokeWidth="2" strokeLinecap="round" />

          {/* Abdomen & Thorax */}
          <ellipse cx="16" cy="20" rx="6" ry="7" fill="#ff6fa5" stroke="#111111" strokeWidth="2" />
          <circle cx="16" cy="12" r="4.5" fill="#111111" />

          {/* Spider Mark */}
          <path d="M16 16 L14 20 L16 19 L18 20 Z" fill="#ffffff" />
          <circle cx="14.5" cy="11" r="1" fill="#00f0ff" />
          <circle cx="17.5" cy="11" r="1" fill="#00f0ff" />
        </svg>

        {/* Hover speech bubble */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#111111] text-[#fff8f3] text-[9px] font-[Hanken_Grotesk] font-bold uppercase tracking-wider px-2.5 py-1 whitespace-nowrap rounded comic-shadow-sm pointer-events-none">
          Spider-Gwen! 🕷️
        </div>
      </div>
    </motion.div>
  );
}

// Spider-Sense Indicator badge
export function SpiderSenseBadge({ text = "SPIDER-SENSE ACTIVATED!" }) {
  return (
    <div className="relative inline-flex items-center gap-1.5 bg-[#111111] text-[#00f0ff] border-2 border-[#00f0ff] px-3.5 py-1 font-[Anybody] text-xs font-black uppercase tracking-wider comic-shadow-pink animate-pulse">
      <span className="text-[#ff6fa5] font-black text-sm">⚡</span>
      <span>{text}</span>
      <span className="text-[#ffd900] font-black text-sm">⚡</span>
    </div>
  );
}

// Smooth Seamless Spider Web Section Divider
export function SpiderWebDivider({ title = "" }) {
  return (
    <div className="relative w-full py-6 flex items-center justify-center my-4 overflow-hidden">
      {/* Continuous Horizontal Web Thread spanning edge to edge */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center">
        {/* Left Web Bridge */}
        <div className="flex-1 h-[2px] bg-[#111111] relative">
          <div className="h-full bg-gradient-to-r from-transparent via-[#ff6fa5] to-[#111111] w-full" />
        </div>

        {/* Center Web Node Knot */}
        <div className="relative z-10 mx-4">
          <div className="bg-[#fff8f3] border-2 border-[#111111] px-6 py-2 comic-shadow-sm flex items-center gap-3 rotate-[-1deg]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#111111" strokeWidth="1.8" fill="#f4a6c1" />
              <path d="M12 2 V22 M2 12 H22 M4.9 4.9 L19.1 19.1 M4.9 19.1 L19.1 4.9" stroke="#111111" strokeWidth="1.2" />
              <circle cx="12" cy="12" r="5" stroke="#ff6fa5" strokeWidth="1.5" fill="none" />
              <circle cx="12" cy="12" r="2" fill="#111111" />
            </svg>

            {title ? (
              <span className="font-[Anybody] text-xs md:text-sm font-black uppercase text-[#aa2c62] tracking-wider">
                {title}
              </span>
            ) : (
              <span className="font-[Anybody] text-xs font-bold uppercase text-[#111111] tracking-widest">
                THWIP! 🕸️
              </span>
            )}

            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="scale-x-[-1]">
              <circle cx="12" cy="12" r="10" stroke="#111111" strokeWidth="1.8" fill="#f4a6c1" />
              <path d="M12 2 V22 M2 12 H22 M4.9 4.9 L19.1 19.1 M4.9 19.1 L19.1 4.9" stroke="#111111" strokeWidth="1.2" />
              <circle cx="12" cy="12" r="5" stroke="#ff6fa5" strokeWidth="1.5" fill="none" />
              <circle cx="12" cy="12" r="2" fill="#111111" />
            </svg>
          </div>
        </div>

        {/* Right Web Bridge */}
        <div className="flex-1 h-[2px] bg-[#111111] relative">
          <div className="h-full bg-gradient-to-l from-transparent via-[#00f0ff] to-[#111111] w-full" />
        </div>
      </div>
    </div>
  );
}
