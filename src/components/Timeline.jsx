import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { timelineData } from '../data/timeline';
import { CornerWeb, SpiderWebDivider } from './SpiderWebDecor';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const ICONS = ['favorite', 'local_cafe', 'star', 'flight', 'celebration', 'camera_alt', 'restaurant', 'hiking'];

function formatDate(dateStr) {
  if (!dateStr) return '';
  if (dateStr.includes('X')) return dateStr;
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function TimelineItem({ item, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, amount: 0.2 });
  const isLeft = index % 2 === 0;
  const icon = item.icon || ICONS[index % ICONS.length];
  const isHighlight = item.title?.toLowerCase().includes('jadian') || item.isHighlight;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: isLeft ? -70 : 70 }}
      animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: isLeft ? -70 : 70 }}
      transition={{ duration: 0.6, delay: 0.05, ease: 'easeOut' }}
      className="relative flex justify-between items-center w-full group"
    >
      <div className={`w-[45%] md:w-5/12 ${isLeft ? 'flex justify-end pr-2 sm:pr-6 md:pr-10' : 'pr-2 sm:pr-6 md:pr-10'}`}>
        {isLeft && <Card item={item} icon={icon} dateStr={formatDate(item.date)} />}
      </div>

      <motion.div
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        className={`absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center z-10 border-2 border-[#111111] rounded-full transition-transform ${
          isHighlight
            ? 'w-8 h-8 sm:w-10 sm:h-10 bg-[#ff6fa5] ring-2 sm:ring-4 ring-[#00f0ff]/50'
            : 'w-6 h-6 sm:w-8 sm:h-8 bg-[#f4a6c1]'
        }`}
      >
        <span
          className={`material-symbols-outlined text-[#111111] ${isHighlight ? 'text-[16px] sm:text-[20px]' : 'text-[12px] sm:text-[16px]'}`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {icon}
        </span>
      </motion.div>

      <div className={`w-[45%] md:w-5/12 ${!isLeft ? 'flex justify-start pl-2 sm:pl-6 md:pl-10' : 'pl-2 sm:pl-6 md:pl-10'}`}>
        {!isLeft && <Card item={item} icon={icon} dateStr={formatDate(item.date)} />}
      </div>
    </motion.div>
  );
}

function Card({ item, dateStr }) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      className="bg-white border-2 border-[#111111] p-3 sm:p-5 comic-shadow relative transition-transform w-full max-w-sm overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-8 h-8 sm:w-12 sm:h-12 pointer-events-none opacity-70">
        <svg viewBox="0 0 50 50" fill="none" className="w-full h-full">
          <line x1="50" y1="0" x2="0" y2="0" stroke="#111" strokeWidth="2" />
          <line x1="50" y1="0" x2="50" y2="50" stroke="#111" strokeWidth="2" />
          <line x1="50" y1="0" x2="0" y2="50" stroke="#ff6fa5" strokeWidth="1.5" />
          <path d="M 30 0 Q 30 20 50 20" stroke="#111" strokeWidth="1.5" />
        </svg>
      </div>

      <div className="inline-flex items-center gap-1 bg-[#111111] text-white font-[Hanken_Grotesk] text-[9px] sm:text-[11px] font-bold tracking-widest uppercase px-2 sm:px-3 py-0.5 sm:py-1 mb-2 sm:mb-3 max-w-full truncate shadow-sm">
        <span className="text-[#00f0ff] animate-pulse">🕸️</span>
        <span className="truncate">{dateStr}</span>
      </div>

      <h3 className="font-[Anybody] text-base sm:text-2xl font-black text-[#1d1b18] mb-1 sm:mb-2 leading-tight break-words">
        {item.title}
      </h3>
      <p className="font-[Hanken_Grotesk] text-[11px] sm:text-sm text-[#514347] leading-relaxed break-words">
        {item.description}
      </p>

      {item.image ? (
        <div className="mt-2.5 sm:mt-4 relative bg-white border border-[#d6c1c6] p-1 sm:p-2 rotate-1">
          <div className="tape" style={{ top: '-5px', left: '-8px', transform: 'rotate(-15deg)' }} />
          <img
            key={item.image}
            src={item.image}
            alt={item.title}
            className="w-full h-28 sm:h-40 object-cover border border-[#111111]"
          />
        </div>
      ) : (
        <div className="mt-2.5 sm:mt-4 border-2 border-dashed border-[#d6c1c6] h-20 sm:h-28 flex items-center justify-center bg-[#f9f2ed] rotate-1 px-2 text-center">
          <span className="font-[Hanken_Grotesk] text-[10px] sm:text-xs text-[#837377] uppercase tracking-wider">
            Belum ada foto 📸
          </span>
        </div>
      )}
    </motion.div>
  );
}

export default function Timeline({ refreshTrigger }) {
  const [items, setItems] = useState(timelineData);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const fetchTimeline = async () => {
      const { data, error } = await supabase
        .from('timeline')
        .select('*')
        .order('date', { ascending: true });
      if (!error && data && data.length > 0) setItems(data);
    };
    fetchTimeline();

    const channel = supabase
      .channel('timeline-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'timeline' }, fetchTimeline)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [refreshTrigger]);

  return (
    <section id="timeline" className="relative py-16 sm:py-24 px-3 sm:px-8 md:px-16 overflow-hidden">
      <CornerWeb position="top-left" size={130} color="#ff6fa5" />
      <CornerWeb position="bottom-right" size={130} color="#00f0ff" />

      <div className="absolute inset-0 halftone-bg opacity-[0.06] pointer-events-none z-0" />

      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-16 relative inline-block w-full"
        >
          <div className="inline-block relative max-w-full px-2">
            <h2 className="font-[Anybody] text-4xl sm:text-6xl md:text-7xl font-black text-[#1d1b18] uppercase relative z-10 break-words leading-none">
              Our Timeline
            </h2>
            <div className="absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3 w-full h-full bg-[#f4a6c1] border-2 border-[#1d1b18] -rotate-2 z-0 comic-shadow" />
          </div>
          <p className="font-[Bricolage_Grotesque] text-base sm:text-lg text-[#514347] mt-4 px-2">
            Every chapter of our story, connected like spider webs 💕🕸️
          </p>
        </motion.div>

        <SpiderWebDivider title="SPIDER-VERSE CHAPTERS 🕸️" />

        <div className="relative mt-8 sm:mt-12">
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0 border-l-2 border-dashed border-[#111111] z-0" />

          <div className="flex flex-col gap-10 sm:gap-16 md:gap-24">
            {items.map((item, i) => (
              <TimelineItem key={item.id} item={item} index={i} />
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mt-12 sm:mt-16"
        >
          <div className="bg-[#ff6fa5] border-2 border-[#111111] px-5 sm:px-6 py-2.5 sm:py-3 comic-shadow rotate-[-1deg] font-[Anybody] font-black text-white text-sm sm:text-lg uppercase flex items-center gap-2 text-center">
            <span>More chapters coming soon...</span>
            <span className="text-[#00f0ff] animate-spin">🕸️</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
