import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CornerWeb, SpiderSenseBadge } from './SpiderWebDecor';

export default function LoadingScreen({ onComplete }) {
  const [displayProgress, setDisplayProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [thwipBurst, setThwipBurst] = useState(false);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const startTime = performance.now();
    const duration = 2400; // 2.4s total smooth load time

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progressRatio = Math.min(elapsed / duration, 1);

      // Smooth Ease-Out Quintic curve for realistic loading acceleration & deceleration
      const easedProgress = 1 - Math.pow(1 - progressRatio, 4);
      const currentPercent = Math.round(easedProgress * 100);

      setDisplayProgress(currentPercent);

      if (progressRatio < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Trigger THWIP burst right at 100%
        setThwipBurst(true);
        setTimeout(() => {
          setIsDone(true);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 700); // Allow smooth exit transition
        }, 400);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [onComplete]);

  const letters = "ZeeVerlyn".split("");

  return (
    <AnimatePresence mode="wait">
      {!isDone && (
        <motion.div
          key="loading-screen"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.12,
            filter: "blur(14px)",
          }}
          transition={{
            duration: 0.75,
            ease: [0.16, 1, 0.3, 1], // Ultra-smooth cubic-bezier transition
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#fff8f3] text-[#1d1b18] overflow-hidden select-none"
        >
          {/* Corner Spider Webs */}
          <CornerWeb position="top-left" size={200} color="#ff6fa5" />
          <CornerWeb position="top-right" size={200} color="#00f0ff" />
          <CornerWeb position="bottom-left" size={200} color="#00f0ff" />
          <CornerWeb position="bottom-right" size={200} color="#ff6fa5" />

          {/* Halftone & Grid Layer */}
          <div className="absolute inset-0 halftone-bg opacity-10 pointer-events-none" />
          <div className="absolute inset-0 web-lines opacity-20 pointer-events-none" />

          {/* Optional THWIP Burst Effect on 100% Finish */}
          {thwipBurst && (
            <motion.div
              initial={{ scale: 0, opacity: 0.9 }}
              animate={{ scale: 3.5, opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute w-72 h-72 rounded-full border-4 border-[#00f0ff] pointer-events-none z-30"
              style={{
                background: "radial-gradient(circle, rgba(255,111,165,0.4) 0%, rgba(0,240,255,0.2) 60%, transparent 80%)",
              }}
            />
          )}

          {/* Center Content Container */}
          <div className="relative z-10 flex flex-col items-center max-w-lg px-6 text-center">
            {/* Top Spider-Sense Badge */}
            <motion.div
              initial={{ opacity: 0, y: -25, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="mb-6"
            >
              <SpiderSenseBadge text="WEAVING OUR UNIVERSE... 🕸️" />
            </motion.div>

            {/* ZeeVerlyn Animated Main Logo */}
            <div className="relative mb-8 flex items-center justify-center">
              {/* Web line background thread with pulsing glow */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute inset-x-[-50px] top-1/2 -translate-y-1/2 h-[3px] bg-[#111111] opacity-70 origin-center"
              >
                <div className="h-full bg-gradient-to-r from-[#ff6fa5] via-[#00f0ff] to-[#ff6fa5] animate-pulse" />
              </motion.div>

              {/* Staggered Floating ZeeVerlyn Letters */}
              <div className="relative flex gap-1 sm:gap-2.5">
                {letters.map((char, index) => (
                  <motion.span
                    key={index}
                    initial={{
                      opacity: 0,
                      y: 35,
                      scale: 0.3,
                      rotate: index % 2 === 0 ? -15 : 15,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      rotate: index % 2 === 0 ? -2 : 2,
                    }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.05,
                      ease: [0.34, 1.56, 0.64, 1], // Spring bounce effect on entrance
                    }}
                    className="inline-block relative"
                  >
                    <motion.span
                      animate={{
                        y: [0, -10, 0],
                      }}
                      transition={{
                        duration: 2.2,
                        repeat: Infinity,
                        repeatType: "mirror",
                        delay: index * 0.12,
                        ease: "easeInOut",
                      }}
                      className="font-[Anybody] text-5xl sm:text-7xl md:text-8xl font-black italic tracking-tighter block"
                      style={{
                        color: index < 3 ? '#aa2c62' : index < 6 ? '#ff6fa5' : '#00f0ff',
                        textShadow:
                          index % 2 === 0
                            ? '4px 4px 0px #1d1b18, 7px 7px 0px #f4a6c1'
                            : '4px 4px 0px #1d1b18, 7px 7px 0px #00f0ff',
                      }}
                    >
                      {char}
                    </motion.span>
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Subtitle Badge */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="font-[Bricolage_Grotesque] text-xs sm:text-sm font-semibold text-[#514347] mb-8 bg-[#fff8f3] border-2 border-[#1d1b18] px-4 py-1.5 comic-shadow-pink rotate-[-1deg]"
            >
              Spider-Verse Love Story & Memories ✨
            </motion.p>

            {/* Progress Container */}
            <div className="w-full max-w-xs sm:max-w-sm relative mb-3">
              <div className="flex items-center justify-between text-xs font-[Hanken_Grotesk] font-bold uppercase tracking-widest text-[#1d1b18] mb-2 px-1">
                <span className="flex items-center gap-1.5">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                    className="text-[#ff6fa5] inline-block"
                  >
                    🕸️
                  </motion.span>
                  <span className="font-[Anybody] font-black text-[#111111]">THWIP!</span>
                </span>
                <span className="font-[Anybody] font-black text-[#aa2c62] text-sm tabular-nums">
                  {displayProgress}%
                </span>
              </div>

              {/* Progress Bar Track */}
              <div className="h-5 w-full bg-white border-2 border-[#1d1b18] comic-shadow-sm relative overflow-hidden p-0.5 rounded-sm">
                <div className="absolute inset-0 halftone-bg opacity-20 pointer-events-none" />

                {/* Smooth 60FPS Animated Fill Bar */}
                <div
                  className="h-full bg-gradient-to-r from-[#ff6fa5] via-[#f4a6c1] to-[#00f0ff] border-r-2 border-[#1d1b18] relative transition-[width] duration-75 ease-linear"
                  style={{ width: `${displayProgress}%` }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.3)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.3)_50%,rgba(255,255,255,0.3)_75%,transparent_75%,transparent)] bg-[length:16px_16px]" />
                </div>

                {/* Smooth Spider Icon Crawling */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 pointer-events-none z-20 transition-[left] duration-75 ease-linear"
                  style={{ left: `calc(${Math.min(94, Math.max(3, displayProgress))}% - 10px)` }}
                >
                  <motion.span
                    animate={{ y: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 0.4 }}
                    className="text-xs inline-block"
                  >
                    🕷️
                  </motion.span>
                </div>
              </div>
            </div>

            {/* Dynamic Status Text */}
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
              className="font-[Hanken_Grotesk] text-[11px] uppercase tracking-widest text-[#aa2c62] font-bold h-4"
            >
              {displayProgress < 35
                ? "Connecting Spider-Threads... 🕸️"
                : displayProgress < 75
                ? "Loading Memories & Playlist... 🎵"
                : "Welcome to Our Universe! 💕"}
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
