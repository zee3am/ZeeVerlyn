import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { galleryData, galleryTags } from '../data/gallery';
import { CornerWeb, SpiderWebDivider } from './SpiderWebDecor';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import AlbumView from './AlbumView';

function GalleryCard({ album, onClick, index }) {
  const coverImage = album.cover_image;
  const title = album.title || album.albumName || 'Album';
  const description = album.description || album.caption || 'Our favourite moments';
  const photoCount = album.photo_count ?? album.photos?.length ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: '-20px' }}
      transition={{ duration: 0.4, delay: (index % 3) * 0.08 }}
      whileHover={{ y: -6, scale: 1.02 }}
      onClick={() => onClick(album)}
      className="cursor-pointer group relative border-2 border-[#111111] bg-white overflow-hidden comic-shadow"
    >
      <div className="absolute top-0 right-0 w-8 h-8 sm:w-10 sm:h-10 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
        <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
          <path d="M40 0 L0 0 M40 0 L40 40 M40 0 L0 40" stroke="#111" strokeWidth="2" />
          <path d="M40 0 L0 40" stroke="#ff6fa5" strokeWidth="1.5" />
        </svg>
      </div>

      {coverImage ? (
        <div className="relative">
          <img
            src={coverImage}
            alt={title}
            className="w-full object-cover aspect-square group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div
            className="hidden w-full aspect-square flex-col items-center justify-center absolute inset-0"
            style={{ backgroundColor: album.color || '#f4a6c1' }}
          >
            <div className="absolute inset-0 halftone-bg opacity-20" />
            <span className="material-symbols-outlined text-4xl sm:text-5xl text-[#1d1b18] opacity-40 relative z-10">photo_camera</span>
          </div>
        </div>
      ) : (
        <div
          className="w-full aspect-square flex flex-col items-center justify-center relative overflow-hidden p-2 text-center"
          style={{ backgroundColor: album.color || '#f4a6c1' }}
        >
          <div className="absolute inset-0 halftone-bg opacity-20" />
          <span className="material-symbols-outlined text-3xl sm:text-5xl text-[#1d1b18] opacity-40 relative z-10">photo_camera</span>
          <p className="font-[Hanken_Grotesk] text-[10px] sm:text-xs text-[#1d1b18] opacity-70 mt-1 relative z-10 uppercase tracking-widest break-words">
            Album belum ada cover
          </p>
        </div>
      )}

      <div className="absolute top-0 left-0 m-3 rounded-full bg-[#111111]/95 text-white text-[10px] font-[Hanken_Grotesk] font-bold uppercase tracking-widest px-2 py-1 border border-[#fff8f3]">
        {photoCount} photo{photoCount === 1 ? '' : 's'}
      </div>

      <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 flex items-center gap-1 bg-[#111111] text-white font-[Hanken_Grotesk] text-[9px] sm:text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 sm:py-1 max-w-[80%] truncate">
        <span className="text-[#00f0ff]">🕸️</span>
        <span className="truncate">{album.tag || 'gallery'}</span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-[#1d1b18]/95 px-2.5 sm:px-3 py-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
        <p className="font-[Hanken_Grotesk] text-[11px] sm:text-xs text-white break-words line-clamp-2">{description}</p>
      </div>
    </motion.div>
  );
}

export default function Gallery({ refreshTrigger }) {
  const [activeTag, setActiveTag] = useState('All');
  const [activeAlbum, setActiveAlbum] = useState(null);
  const [albums, setAlbums] = useState([]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const fetchAlbums = async () => {
      const { data, error } = await supabase
        .from('gallery_albums')
        .select('*, gallery_photos(id)')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setAlbums(data.map((album) => ({
          ...album,
          photo_count: album.gallery_photos?.length ?? 0,
        })));
      }
    };

    fetchAlbums();

    const channel = supabase
      .channel('gallery-albums-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery_albums' }, fetchAlbums)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery_photos' }, fetchAlbums)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [refreshTrigger]);

  const fallbackAlbums = Object.values(
    galleryData.reduce((acc, item) => {
      const key = item.album || `single-${item.id}`;
      if (!acc[key]) {
        acc[key] = {
          id: key,
          title: item.album || item.caption,
          description: '',
          cover_image: item.image,
          tag: item.tag,
          color: item.color,
          photo_count: 0,
        };
      }
      acc[key].photo_count += 1;
      return acc;
    }, {})
  );

  const allAlbums = isSupabaseConfigured ? albums : fallbackAlbums;

  const allTags = isSupabaseConfigured
    ? ['All', ...new Set(allAlbums.map((a) => a.tag))]
    : galleryTags;

  const filtered = activeTag.toLowerCase() === 'all'
    ? allAlbums
    : allAlbums.filter((a) => a.tag?.toLowerCase() === activeTag.toLowerCase());

  return (
    <section id="gallery" className="relative py-16 sm:py-24 px-4 sm:px-8 md:px-16 bg-[#f9f2ed] overflow-hidden">
      <CornerWeb position="top-right" size={140} color="#00f0ff" />
      <CornerWeb position="bottom-left" size={140} color="#ff6fa5" />

      <div className="absolute inset-0 halftone-bg opacity-[0.06] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="bg-[#1d1b18] text-[#fff8f3] py-1.5 px-4 sm:px-6 inline-block mb-4 comic-bubble border-2 border-[#1d1b18]">
            <p className="font-[Bricolage_Grotesque] text-sm sm:text-base md:text-lg">Our favourite moments 📸🕸️</p>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 sm:gap-6">
            <div className="relative inline-block max-w-full">
              <h2
                className="font-[Anybody] text-4xl sm:text-5xl md:text-6xl font-black uppercase text-[#1d1b18] leading-none break-words"
                style={{ textShadow: '4px 4px 0px #f4a6c1' }}
              >
                Our Gallery
              </h2>
            </div>

            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className={`font-[Hanken_Grotesk] text-[10px] sm:text-xs font-bold tracking-wider uppercase px-3 sm:px-4 py-1.5 sm:py-2 border-2 border-[#111111] transition-all hover:-translate-y-0.5 ${
                    activeTag.toLowerCase() === tag.toLowerCase()
                      ? 'bg-[#ff6fa5] text-white comic-shadow'
                      : 'bg-[#fff8f3] text-[#1d1b18] hover:bg-[#f4a6c1]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <SpiderWebDivider title="SPIDER-VERSE SNAPSHOTS 📸" />

        <motion.div
          layout
          className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5 mt-6"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((album, i) => (
              <motion.div
                key={album.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25 }}
              >
                <GalleryCard album={album} onClick={setActiveAlbum} index={i} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {activeAlbum && <AlbumView album={activeAlbum} onClose={() => setActiveAlbum(null)} />}
    </section>
  );
}
