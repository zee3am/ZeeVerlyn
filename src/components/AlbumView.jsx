import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, animate } from 'framer-motion';
import { CornerWeb } from './SpiderWebDecor';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export default function AlbumView({ album, onClose }) {
  const [photos, setPhotos] = useState(() => album.photos || []);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);
  const isDraggingRef = useRef(false);
  const pointerStartXRef = useRef(0);
  const scrollStartLeftRef = useRef(0);

  useEffect(() => {
    setActiveIndex(0);
    if (album.photos && album.photos.length > 0) {
      setPhotos([...album.photos].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)));
      return;
    }

    if (!isSupabaseConfigured || !album?.id) return;

    const fetchPhotos = async () => {
      const { data, error } = await supabase
        .from('gallery_photos')
        .select('*')
        .eq('album_id', album.id)
        .order('sort_order', { ascending: true });
      if (!error && data) setPhotos(data);
    };

    fetchPhotos();
  }, [album]);

  useEffect(() => {
    if (!isSupabaseConfigured || !album?.id) return;

    const fetchPhotos = async () => {
      try {
        const { data, error } = await supabase
          .from('gallery_photos')
          .select('*')
          .eq('album_id', album.id)
          .order('sort_order', { ascending: true });
        if (error) {
          console.error('Failed to load photos for album', album.id, error);
          return;
        }
        if (data) setPhotos(data);
      } catch (err) {
        console.error('Error fetching album photos for', album.id, err);
      }
    };

    // initial fetch
    fetchPhotos();

    // subscribe to realtime changes for this album's photos
    const channel = supabase
      .channel(`album-photos-${album.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'gallery_photos', filter: `album_id=eq.${album.id}` },
        async () => {
          // refetch safely on any change
          await fetchPhotos();
        }
      )
      .subscribe();

    // Polling fallback: refetch every 10s in case realtime websocket fails
    const pollId = setInterval(() => {
      fetchPhotos();
    }, 10000);

    return () => {
      clearInterval(pollId);
      try {
        supabase.removeChannel(channel);
      } catch (err) {
        console.error('Error removing album photos channel:', err);
      }
    };
  }, [album]);

  const scrollToIndex = (index) => {
    if (!scrollRef.current || !photos[index]) return;
    const child = scrollRef.current.children[index];
    if (!child) return;
    scrollRef.current.scrollTo({ left: child.offsetLeft, behavior: 'smooth' });
    setActiveIndex(index);
  };

  const handlePrev = () => {
    const nextIndex = Math.max(0, activeIndex - 1);
    scrollToIndex(nextIndex);
  };

  const handleNext = () => {
    const nextIndex = Math.min(photos.length - 1, activeIndex + 1);
    scrollToIndex(nextIndex);
  };

  const updateActiveIndex = () => {
    if (!scrollRef.current || photos.length === 0) return;
    const container = scrollRef.current;
    const itemWidth = container.children[0]?.clientWidth || container.clientWidth;
    const index = Math.round(container.scrollLeft / (itemWidth + 12));
    setActiveIndex(Math.min(Math.max(0, index), photos.length - 1));
  };

  const handlePointerDown = (event) => {
    if (!scrollRef.current) return;
    isDraggingRef.current = true;
    pointerStartXRef.current = event.clientX;
    scrollStartLeftRef.current = scrollRef.current.scrollLeft;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!isDraggingRef.current || !scrollRef.current) return;
    const delta = pointerStartXRef.current - event.clientX;
    scrollRef.current.scrollLeft = scrollStartLeftRef.current + delta;
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    updateActiveIndex();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-[#111111]/85 backdrop-blur-sm p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.85, rotate: -3 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0.85 }}
          className="relative bg-[#fff8f3] border-4 border-[#111111] p-4 sm:p-6 w-full max-w-6xl max-h-[90vh] overflow-hidden comic-shadow-pink"
          onClick={(e) => e.stopPropagation()}
        >
          <CornerWeb position="top-left" size={80} color="#ff6fa5" />

          <button
            onClick={onClose}
            className="absolute top-2 right-2 sm:-top-3 sm:-right-3 w-9 h-9 sm:w-10 sm:h-10 bg-[#ff6fa5] border-2 border-[#111111] rounded-full flex items-center justify-center comic-shadow-sm z-30 hover:-translate-y-0.5 transition-transform"
          >
            <span className="material-symbols-outlined text-white text-lg sm:text-xl">close</span>
          </button>

          <div className="relative z-10 mb-4">
            <p className="font-[Anybody] text-2xl sm:text-3xl font-black uppercase text-[#1d1b18] leading-tight">
              {album.title || album.albumName || 'Album'}
            </p>
            {album.description && (
              <p className="text-sm text-[#514347] mt-2">{album.description}</p>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={handlePrev}
              disabled={activeIndex === 0}
              className="absolute left-3 top-1/2 z-20 -translate-y-1/2 w-10 h-10 rounded-full bg-[#ff6fa5] border-2 border-[#111111] text-white comic-shadow-sm hover:scale-105 transition-transform disabled:opacity-40"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={activeIndex >= photos.length - 1}
              className="absolute right-3 top-1/2 z-20 -translate-y-1/2 w-10 h-10 rounded-full bg-[#ff6fa5] border-2 border-[#111111] text-white comic-shadow-sm hover:scale-105 transition-transform disabled:opacity-40"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>

            <div
              ref={scrollRef}
              className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory touch-pan-x"
              style={{ WebkitOverflowScrolling: 'touch' }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              onScroll={updateActiveIndex}
            >
              {photos.map((photo, index) => (
                <div
                  key={photo.id ?? index}
                  className="snap-center min-w-[80vw] sm:min-w-[55vw] lg:min-w-[40vw] border-2 border-[#111111] bg-[#fff8f3] overflow-hidden"
                >
                  {photo.image ? (
                    <img src={photo.image} alt={album.title || 'Foto'} className="w-full h-[60vh] sm:h-[70vh] object-cover" />
                  ) : (
                    <div className="h-[60vh] sm:h-[70vh] flex items-center justify-center bg-[#f4a6c1]">
                      <span className="material-symbols-outlined text-5xl text-[#1d1b18] opacity-40">photo_camera</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="absolute left-1/2 bottom-4 z-20 -translate-x-1/2 rounded-full bg-[#111111] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white">
            {photos.length === 0 ? '0 / 0' : `${activeIndex + 1} / ${photos.length}`}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

