import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { siteConfig } from '../data/site-config';
import { CornerWeb, HangingSpider, SpiderSenseBadge } from './SpiderWebDecor';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

function useDayCounter() {
  const [days, setDays] = useState(0);
  useEffect(() => {
    const startDate = new Date(`${siteConfig.anniversaryDate}T00:00:00`);
    const calc = () => {
      const now = new Date();
      const diff = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
      setDays(diff);
    };
    calc();
    const id = setInterval(calc, 1000 * 60 * 60); // update hourly
    return () => clearInterval(id);
  }, []);
  return days;
}

export default function Hero({ refreshTrigger }) {
  const days = useDayCounter();
  const [heroImage, setHeroImage] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const fetchHero = async () => {
      const { data } = await supabase
        .from('gallery')
        .select('image')
        .eq('tag', 'hero')
        .order('created_at', { ascending: false })
        .limit(1);
      if (data && data.length > 0 && data[0].image) {
        setHeroImage(data[0].image);
      }
    };
    fetchHero();

    const channel = supabase
      .channel('hero-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery' }, fetchHero)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [refreshTrigger]);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-20 px-5 md:px-16 overflow-hidden"
    >
      {/* Spider-Verse Corner Webs */}
      <CornerWeb position="top-left" size={180} color="#ff6fa5" />
      <CornerWeb position="top-right" size={180} color="#00f0ff" />
      <HangingSpider className="top-0 right-12 md:right-28" />

      {/* Halftone BG layer */}
      <div className="fixed inset-0 halftone-bg opacity-[0.08] pointer-events-none z-0" />
      {/* Web lines layer */}
      <div className="fixed inset-0 web-lines opacity-25 pointer-events-none z-0" />

      {/* Logo / Title */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="text-center mb-8 relative z-20 flex flex-col items-center gap-3"
      >
        <SpiderSenseBadge text="SPIDER-VERSE ADVENTURE" />

        <motion.h1
          className="font-[Anybody] text-[72px] md:text-[120px] font-black text-[#aa2c62] italic tracking-tighter leading-none select-none relative"
          style={{ textShadow: '6px 6px 0px #f4a6c1, 12px 12px 0px #111111' }}
          animate={{ rotate: [-1, 1, -1] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        >
          ZeeVerlyn
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="inline-block font-[Bricolage_Grotesque] text-xl text-[#1d1b18] mt-2 bg-[#fff8f3] px-4 py-1.5 border-2 border-[#1d1b18] comic-shadow-pink rotate-[1deg]"
        >
          {siteConfig.tagline} 🕸️✨
        </motion.p>
      </motion.div>

      {/* Couple Comic Frame with Web Corner accents */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotate: -4 }}
        animate={{ opacity: 1, scale: 1, rotate: -2 }}
        transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
        whileHover={{ rotate: 0, scale: 1.02 }}
        className="relative w-full max-w-2xl mx-auto z-10 mb-10 halftone-shadow-hero"
      >
        <div className="bg-[#fff8f3] border-4 border-[#1d1b18] p-3 md:p-4 relative">
          {/* Inner Corner Web Details */}
          <div className="absolute top-1 left-1 pointer-events-none z-20 opacity-70">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M0 0 L40 0 M0 0 L0 40 M0 0 L40 40 M20 0 Q15 15 0 20" stroke="#111" strokeWidth="2" />
              <path d="M0 0 L40 40" stroke="#ff6fa5" strokeWidth="1.5" />
            </svg>
          </div>
          <div className="absolute top-1 right-1 pointer-events-none z-20 opacity-70 scale-x-[-1]">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M0 0 L40 0 M0 0 L0 40 M0 0 L40 40 M20 0 Q15 15 0 20" stroke="#111" strokeWidth="2" />
              <path d="M0 0 L40 40" stroke="#00f0ff" strokeWidth="1.5" />
            </svg>
          </div>

          <div className="border-2 border-[#1d1b18] overflow-hidden relative group">
            {/* Pink tint overlay */}
            <div className="absolute inset-0 bg-[#ff6fa5]/15 mix-blend-multiply group-hover:opacity-0 transition-opacity z-10 pointer-events-none" />

            {/* Photo display / placeholder */}
            <div className="w-full aspect-[4/3] md:aspect-[16/9] bg-[#f4a6c1] flex flex-col items-center justify-center relative overflow-hidden">
              {heroImage ? (
                <>
                  <img
                    src={heroImage}
                    alt="Chapter 1 Couple Photo"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                  <div className="hidden absolute inset-0 flex-col items-center justify-center bg-[#f4a6c1]">
                    <div className="absolute inset-0 halftone-bg-pink opacity-40" />
                    <span className="font-[Anybody] text-6xl font-black text-[#aa2c62] opacity-40">ZV</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="absolute inset-0 halftone-bg-pink opacity-40" />
                  <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                    <line stroke="#111" strokeWidth="1.5" x1="0" x2="100%" y1="0" y2="100%" />
                    <line stroke="#111" strokeWidth="1.5" x1="100%" x2="0" y1="0" y2="100%" />
                    <circle cx="50%" cy="50%" r="20%" stroke="#111" strokeWidth="1" fill="none" />
                    <circle cx="50%" cy="50%" r="35%" stroke="#111" strokeWidth="1" fill="none" />
                  </svg>
                  <div className="relative z-10 text-center">
                    <p className="font-[Anybody] text-6xl font-black text-[#aa2c62] opacity-40">ZV</p>
                    <p className="font-[Hanken_Grotesk] text-sm font-bold text-[#8a4b63] mt-2 uppercase tracking-widest">
                      Add your couple photo here 🕷️
                    </p>
                    <p className="font-[Hanken_Grotesk] text-xs text-[#514347] mt-1">
                      Buka Love Studio 💕 untuk ganti foto
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Caption box with Spider badge */}
            <div className="absolute bottom-4 right-4 bg-[#fff8f3] border-2 border-[#1d1b18] px-4 py-2 comic-shadow z-20 rotate-[2deg] flex items-center gap-1.5">
              <span className="text-sm">🕸️</span>
              <span className="font-[Hanken_Grotesk] text-xs font-bold tracking-widest uppercase">Chapter 1.</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Day Counter Badge */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.7 }}
        className="relative z-20"
      >
        <div className="bg-[#1d1b18] text-[#fff8f3] border-2 border-[#1d1b18] rounded-full px-8 md:px-12 py-5 text-center comic-shadow-pink relative overflow-hidden hover:-translate-y-1 transition-transform">
          {/* Inner halftone pattern */}
          <div className="absolute inset-0 halftone-bg opacity-10" />
          <p className="relative z-10 font-[Hanken_Grotesk] text-xs uppercase tracking-[0.2em] text-[#d6c1c6] mb-1">
            Together since {new Date(siteConfig.anniversaryDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <p className="relative z-10 font-[Anybody] text-4xl md:text-6xl font-black text-[#ffb0cb] tracking-tight leading-none">
            {days}
          </p>
          <p className="relative z-10 font-[Anybody] text-lg font-bold text-[#ff6fa5] mt-1 flex items-center justify-center gap-1.5">
            <span>days and counting</span>
            <span className="text-[#00f0ff]">🕸️</span>
            <span>♥</span>
          </p>
        </div>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-20"
      >
        <p className="font-[Hanken_Grotesk] text-xs uppercase tracking-widest text-[#514347]">Scroll Down</p>
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="material-symbols-outlined text-[#aa2c62]"
        >
          expand_more
        </motion.span>
      </motion.div>
    </section>
  );
}
