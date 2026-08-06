import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { letterData } from '../data/letter';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { CornerWeb, SpiderWebDivider } from './SpiderWebDecor';

export default function Letter({ refreshTrigger }) {
  const [remoteLetterData, setRemoteLetterData] = useState(null);

  useEffect(() => {
    const fetchLetter = async () => {
      if (!isSupabaseConfigured) return;

      try {
        const { data, error } = await supabase.from('letters').select('*').limit(1).single();
        if (error) {
          console.error('Failed to load letter from Supabase:', error);
          return;
        }

        if (data) {
          const paragraphs = Array.isArray(data.paragraphs)
            ? data.paragraphs
            : typeof data.paragraphs === 'string'
              ? data.paragraphs.split('\n').filter((p) => p.trim() !== '')
              : [];

          setRemoteLetterData({
            greeting: data.greeting || letterData.greeting,
            paragraphs: paragraphs.length ? paragraphs : letterData.paragraphs,
            closing: data.closing || letterData.closing,
            signature: data.signature || letterData.signature,
          });
        }
      } catch (err) {
        console.error('Error fetching letter data:', err);
      }
    };

    fetchLetter();

    let channel;
    if (isSupabaseConfigured) {
      channel = supabase
        .channel('letters-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'letters' }, () => {
          fetchLetter();
        })
        .subscribe();
    }

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [refreshTrigger]);

  const displayData = remoteLetterData || letterData;

  return (
    <section id="letter" className="relative py-16 sm:py-24 px-4 sm:px-8 md:px-16 min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <CornerWeb position="top-right" size={140} color="#ff6fa5" />
      <CornerWeb position="bottom-left" size={140} color="#00f0ff" />

      <div className="absolute inset-0 bg-[#fff8f3]" />
      <div className="absolute inset-0 halftone-bg opacity-[0.07] pointer-events-none" />

      <div className="relative z-10 w-full max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 sm:mb-8"
        >
          <h2
            className="font-[Anybody] text-4xl sm:text-5xl md:text-6xl font-black uppercase text-[#1d1b18] leading-none break-words inline-block max-w-full"
            style={{ textShadow: '4px 4px 0px #f4a6c1' }}
          >
            A Letter
          </h2>
          <p className="font-[Bricolage_Grotesque] text-base sm:text-lg text-[#514347] mt-2.5 italic">
            Written from the heart across the Spider-Verse 💌🕸️
          </p>
        </motion.div>

        <SpiderWebDivider title="SEALED WITH A THWIP 🕸️" />

        {/* The Letter card: Re-animates every time scrolled into view */}
        <motion.article
          initial={{ opacity: 0, scale: 0.94, rotate: 3 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative bg-white border-2 border-[#1d1b18] p-5 sm:p-10 md:p-14 flex flex-col gap-6 sm:gap-8 mt-6 sm:mt-8 overflow-hidden w-full"
          style={{ boxShadow: '6px 6px 0px 0px #1d1b18' }}
        >
          <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none opacity-30">
            <svg viewBox="0 0 60 60" fill="none" className="w-full h-full">
              <line x1="60" y1="0" x2="0" y2="0" stroke="#111" strokeWidth="2" />
              <line x1="60" y1="0" x2="60" y2="60" stroke="#111" strokeWidth="2" />
              <line x1="60" y1="0" x2="0" y2="60" stroke="#ff6fa5" strokeWidth="1.5" />
            </svg>
          </div>

          <div className="washi-tape hidden sm:block" style={{ top: '-10px', left: '-20px', transform: 'rotate(-15deg)', backgroundColor: '#ff6fa5' }} />
          <div className="washi-tape hidden sm:block" style={{ bottom: '-10px', right: '-20px', transform: 'rotate(-10deg)', backgroundColor: '#ff6fa5' }} />

          <div className="absolute inset-2 border border-[#d6c1c6] opacity-50 pointer-events-none" />

          {/* Header */}
          <header>
            <h1 className="font-[Kalam] text-3xl sm:text-4xl md:text-5xl text-[#1d1b18] leading-tight flex items-center justify-between gap-2 break-words">
              <span>{displayData.greeting}</span>
              <span className="text-xl sm:text-2xl flex-shrink-0 animate-pulse">🕸️</span>
            </h1>
          </header>

          {/* Body paragraphs */}
          <div className="font-[Kalam] text-lg sm:text-xl md:text-2xl text-[#474646] leading-relaxed space-y-4 sm:space-y-6 break-words">
            {displayData.paragraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          {/* Signature */}
          <footer className="mt-4 sm:mt-6 text-right flex flex-col items-end gap-1.5">
            <p className="font-[Kalam] text-lg sm:text-xl text-[#1d1b18]">{displayData.closing}</p>
            <p
              className="font-[Kalam] text-2xl sm:text-3xl md:text-4xl font-bold -rotate-2 mt-1 break-words"
              style={{ color: '#aa2c62' }}
            >
              {displayData.signature}
            </p>
            <div className="flex items-center gap-1 mt-1 text-[#ff6fa5]">
              <span
                className="material-symbols-outlined text-2xl sm:text-3xl animate-bounce"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                favorite
              </span>
              <span className="text-xl sm:text-2xl">🕸️</span>
            </div>
          </footer>
        </motion.article>
      </div>
    </section>
  );
}
