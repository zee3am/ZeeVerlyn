import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { playlistData } from '../data/playlist';
import { CornerWeb, SpiderWebDivider } from './SpiderWebDecor';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const MUSIC_NOTES = ['♩', '♪', '♫', '♬'];

function NoteIcon({ note, style }) {
  return (
    <motion.span
      animate={{ y: [0, -8, 0], rotate: [-10, 10, -10] }}
      transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
      className="absolute font-[Anybody] text-2xl text-[#f4a6c1] opacity-70 pointer-events-none select-none"
      style={style}
    >
      {note}
    </motion.span>
  );
}

function SongCard({ song, index }) {
  const coverColor = song.coverColor || ['#FFD9E4','#F4A6C1','#FF6FA5','#FFB0CB'][index % 4];
  const duration = song.duration || null;
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: '-20px' }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="flex-none w-[240px] sm:w-[270px] md:w-[300px] bg-white border-2 border-[#111111] p-3.5 sm:p-4 flex flex-col gap-3 sm:gap-4 halftone-card snap-center relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-8 h-8 opacity-40 pointer-events-none">
        <svg viewBox="0 0 30 30" fill="none">
          <line x1="30" y1="0" x2="0" y2="0" stroke="#111" strokeWidth="2" />
          <line x1="30" y1="0" x2="30" y2="30" stroke="#111" strokeWidth="2" />
          <line x1="30" y1="0" x2="0" y2="30" stroke="#ff6fa5" strokeWidth="1.5" />
        </svg>
      </div>

      <div className="relative w-full aspect-square border-2 border-[#111111] overflow-hidden group"
        style={{ backgroundColor: coverColor }}
      >
        {song.coverImage ? (
          <>
            <img
              src={song.coverImage}
              alt={song.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
            <div className="hidden absolute inset-0 flex-col items-center justify-center">
              <div className="absolute inset-0 halftone-bg-pink opacity-40" />
              <span className="font-[Anybody] text-4xl font-black text-[#1d1b18] opacity-30 relative z-10">
                {MUSIC_NOTES[index % 4]}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="absolute inset-0 halftone-bg-pink opacity-40" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-[Anybody] text-4xl font-black text-[#1d1b18] opacity-30">
                {MUSIC_NOTES[index % 4]}
              </span>
            </div>
          </>
        )}
      </div>

      <div className="flex-1 mt-0.5 min-w-0">
        <h3 className="font-[Anybody] text-lg sm:text-xl font-black uppercase leading-tight truncate">{song.title}</h3>
        <p className="font-[Bricolage_Grotesque] text-xs sm:text-sm text-[#514347] mt-1 truncate">{song.artist}</p>
      </div>

      <div className="flex items-center gap-2.5 mt-auto pt-2.5 border-t-2 border-dashed border-[#111111]">
        <a
          href={song.link}
          target="_blank"
          rel="noopener noreferrer"
          className="w-9 h-9 flex-none bg-[#ff6fa5] border-2 border-[#111111] rounded-full flex items-center justify-center hover:-translate-y-0.5 shadow-[2px_2px_0px_0px_rgba(29,27,24,1)] active:translate-y-0 active:shadow-none transition-all group"
          title="Open in Spotify"
        >
          <span className="material-symbols-outlined text-white text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
            play_arrow
          </span>
        </a>

        <div className="flex-1 h-2 bg-[#e8e1dc] border border-[#111111] relative">
          <div
            className="absolute top-0 left-0 h-full bg-[#f4a6c1] border-r border-[#111111]"
            style={{ width: `${30 + (index * 15) % 60}%` }}
          >
            <div className="absolute -right-1 -top-1 w-2.5 h-2.5 bg-[#ff6fa5] border border-[#111111] rounded-full" />
          </div>
        </div>

        {duration && (
          <span className="font-[Hanken_Grotesk] text-[9px] sm:text-[10px] font-bold tracking-wider text-[#514347]">
            {duration}
          </span>
        )}
      </div>
    </motion.article>
  );
}

export default function Playlist({ refreshTrigger }) {
  const containerRef = useRef(null);
  const [songs, setSongs] = useState(playlistData);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const fetchPlaylist = async () => {
      const { data, error } = await supabase
        .from('playlist')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        setSongs(data.map(s => ({
          ...s,
          coverImage: s.cover_image || null,
          coverColor: s.cover_color || null,
        })));
      }
    };
    fetchPlaylist();

    const channel = supabase
      .channel('playlist-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'playlist' }, fetchPlaylist)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [refreshTrigger]);

  const scrollLeft = () => containerRef.current?.scrollBy({ left: -280, behavior: 'smooth' });
  const scrollRight = () => containerRef.current?.scrollBy({ left: 280, behavior: 'smooth' });

  return (
    <section id="playlist" className="relative py-16 sm:py-24 px-4 sm:px-8 md:px-16 bg-[#f3ede8] overflow-hidden">
      <CornerWeb position="top-left" size={130} color="#ff6fa5" />
      <CornerWeb position="bottom-right" size={130} color="#00f0ff" />

      <div className="absolute inset-0 halftone-bg opacity-[0.07] pointer-events-none" />

      <NoteIcon note="♬" style={{ top: '10%', left: '3%', fontSize: '32px' }} />
      <NoteIcon note="♫" style={{ top: '25%', right: '4%', fontSize: '28px' }} />

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex flex-col md:flex-row items-start md:items-end justify-between gap-4 sm:gap-6"
        >
          <div>
            <div className="bg-[#1d1b18] text-[#fff8f3] py-1.5 px-4 rounded-2xl comic-bubble inline-block mb-3 border-2 border-[#1d1b18]">
              <p className="font-[Bricolage_Grotesque] text-xs sm:text-base">Songs that remind us of us 🎵🕸️</p>
            </div>
            <div className="relative inline-block max-w-full">
              <h2
                className="font-[Anybody] text-4xl sm:text-5xl md:text-6xl font-black uppercase text-[#1d1b18] leading-none break-words"
                style={{ textShadow: '4px 4px 0px #f4a6c1' }}
              >
                Our Playlist
              </h2>
            </div>
          </div>

          <div className="flex gap-2 self-end md:self-auto">
            <button
              onClick={scrollLeft}
              className="w-10 h-10 sm:w-12 sm:h-12 bg-white border-2 border-[#111111] flex items-center justify-center hover:-translate-y-0.5 shadow-[3px_3px_0px_0px_rgba(29,27,24,1)] active:translate-y-0 transition-all group"
              aria-label="Scroll left"
            >
              <span className="material-symbols-outlined text-lg sm:text-2xl group-hover:text-[#aa2c62]">arrow_back</span>
            </button>
            <button
              onClick={scrollRight}
              className="w-10 h-10 sm:w-12 sm:h-12 bg-[#f4a6c1] border-2 border-[#111111] flex items-center justify-center hover:-translate-y-0.5 shadow-[3px_3px_0px_0px_rgba(29,27,24,1)] active:translate-y-0 transition-all"
              aria-label="Scroll right"
            >
              <span className="material-symbols-outlined text-lg sm:text-2xl">arrow_forward</span>
            </button>
          </div>
        </motion.div>

        <SpiderWebDivider title="SPIDER-VERSE SOUNDTRACK 🎧" />

        <div
          ref={containerRef}
          className="flex overflow-x-auto hide-scrollbar gap-4 sm:gap-6 pb-6 pt-3 px-1 -mx-1 snap-x snap-mandatory mt-4"
        >
          {songs.map((song, i) => (
            <SongCard key={song.id} song={song} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
