import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { CornerWeb } from './SpiderWebDecor';

export default function AdminModal({ isOpen, onClose, onDataChange, favoriteCards, setFavoriteCards }) {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');

  const [galleryList, setGalleryList] = useState([]);
  const [timelineList, setTimelineList] = useState([]);
  const [playlistList, setPlaylistList] = useState([]);
  const [letterData, setLetterData] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Hero (Chapter 1) photo states
  const [heroItem, setHeroItem] = useState(null);
  const [heroPhotoFile, setHeroPhotoFile] = useState(null);
  const [heroPhotoPreview, setHeroPhotoPreview] = useState(null);
  const heroFileInputRef = useRef(null);
  const [heroUrlInput, setHeroUrlInput] = useState('');

  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const fileInputRef = useRef(null);

  const [editPhotoPreview, setEditPhotoPreview] = useState(null);
  const [editPhotoFile, setEditPhotoFile] = useState(null);
  const editFileInputRef = useRef(null);

  // Timeline-specific photo states
  const [timelinePhotoPreview, setTimelinePhotoPreview] = useState(null);
  const [timelinePhotoFile, setTimelinePhotoFile] = useState(null);
  const timelineFileInputRef = useRef(null);
  const [editTimelinePhotoPreview, setEditTimelinePhotoPreview] = useState(null);
  const [editTimelinePhotoFile, setEditTimelinePhotoFile] = useState(null);
  const editTimelineFileInputRef = useRef(null);

  const [editingGallery, setEditingGallery] = useState(null);
  const [editingTimeline, setEditingTimeline] = useState(null);
  const [editingSong, setEditingSong] = useState(null);
  const [editingFavorite, setEditingFavorite] = useState(null);

  const [newGallery, setNewGallery] = useState({ caption: '', image: '', tag: 'dates' });
  const [newTimeline, setNewTimeline] = useState({ title: '', date: '', description: '', image: '', icon: 'favorite', is_highlight: false });
  const [newSong, setNewSong] = useState({ title: '', artist: '', link: 'https://open.spotify.com', duration: '3:30', cover_image: '' });

  const [editFavoriteAvatarFile, setEditFavoriteAvatarFile] = useState(null);
  const [editFavoriteAvatarPreview, setEditFavoriteAvatarPreview] = useState(null);
  const editFavoriteAvatarFileInputRef = useRef(null);

  const fetchAdminData = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    setLoading(true);
    try {
      if (activeTab === 'hero') {
        const { data } = await supabase.from('gallery').select('*').eq('tag', 'hero').order('created_at', { ascending: false }).limit(1);
        if (data && data.length > 0) {
          setHeroItem(data[0]);
          setHeroUrlInput(data[0].image || '');
        } else {
          setHeroItem(null);
          setHeroUrlInput('');
        }
      } else if (activeTab === 'gallery') {
        const { data } = await supabase.from('gallery').select('*').neq('tag', 'hero').order('created_at', { ascending: false });
        if (data) setGalleryList(data);
      } else if (activeTab === 'favorites') {
        // favorites are handled by app state, no Supabase table is required here
      } else if (activeTab === 'timeline') {
        const { data } = await supabase.from('timeline').select('*').order('date', { ascending: true });
        if (data) setTimelineList(data);
      } else if (activeTab === 'playlist') {
        const { data } = await supabase.from('playlist').select('*').order('created_at', { ascending: false });
        if (data) setPlaylistList(data);
      } else if (activeTab === 'letter') {
        const { data } = await supabase.from('letters').select('*').limit(1).single();
        if (data) {
          const paras = Array.isArray(data.paragraphs) ? data.paragraphs.join('\n') : data.paragraphs;
          setLetterData({ ...data, paragraphs: paras });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (isOpen && isAuthenticated) fetchAdminData();
  }, [isOpen, isAuthenticated, fetchAdminData]);

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pin === '070126') { setIsAuthenticated(true); setPinError(false); }
    else setPinError(true);
  };

  const uploadPhotoToStorage = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const { error } = await supabase.storage.from('gallery-photos').upload(fileName, file, { cacheControl: '3600', upsert: false });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('gallery-photos').getPublicUrl(fileName);
    return publicUrl;
  };

  const handleHeroPhotoFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setHeroPhotoFile(file);
    setHeroPhotoPreview(URL.createObjectURL(file));
  };

  const clearHeroPhoto = () => {
    setHeroPhotoFile(null);
    setHeroPhotoPreview(null);
    if (heroFileInputRef.current) heroFileInputRef.current.value = '';
  };

  const handleSaveHeroPhoto = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (isSupabaseConfigured) {
      let imageUrl = heroUrlInput;
      if (heroPhotoFile) {
        setUploadingPhoto(true);
        try { imageUrl = await uploadPhotoToStorage(heroPhotoFile); }
        catch (err) { setMessage('Gagal upload foto: ' + err.message); setLoading(false); setUploadingPhoto(false); return; }
        setUploadingPhoto(false);
      }
      if (!imageUrl) {
        setMessage('Pilih foto dari perangkat atau masukkan URL foto!');
        setLoading(false);
        return;
      }
      if (heroItem) {
        const { error } = await supabase.from('gallery')
          .update({ image: imageUrl })
          .eq('id', heroItem.id);
        if (!error) {
          setMessage('Foto Chapter 1 berhasil diperbarui! 🌟');
          clearHeroPhoto();
          fetchAdminData();
          if (onDataChange) onDataChange();
        } else setMessage('Error: ' + error.message);
      } else {
        const { error } = await supabase.from('gallery')
          .insert([{ caption: 'Chapter 1 Hero Photo', image: imageUrl, tag: 'hero' }]);
        if (!error) {
          setMessage('Foto Chapter 1 berhasil ditambahkan! 🌟');
          clearHeroPhoto();
          fetchAdminData();
          if (onDataChange) onDataChange();
        } else setMessage('Error: ' + error.message);
      }
    } else {
      setMessage('Mode demo: Supabase belum terhubung!');
    }
    setLoading(false);
  };

  const handlePhotoFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setNewGallery((prev) => ({ ...prev, image: '' }));
  };

  const handleEditPhotoFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setEditPhotoFile(file);
    setEditPhotoPreview(URL.createObjectURL(file));
  };

  const handleEditFavoriteAvatarFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setEditFavoriteAvatarFile(file);
    setEditFavoriteAvatarPreview(URL.createObjectURL(file));
  };

  const clearEditFavoriteAvatar = () => {
    setEditFavoriteAvatarFile(null);
    setEditFavoriteAvatarPreview(null);
    if (editFavoriteAvatarFileInputRef.current) editFavoriteAvatarFileInputRef.current.value = '';
  };

  const clearAddPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const clearEditPhoto = () => {
    setEditPhotoFile(null);
    setEditPhotoPreview(null);
    if (editFileInputRef.current) editFileInputRef.current.value = '';
  };

  const handleTimelinePhotoFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setTimelinePhotoFile(file);
    setTimelinePhotoPreview(URL.createObjectURL(file));
    setNewTimeline((prev) => ({ ...prev, image: '' }));
  };

  const handleEditTimelinePhotoFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setEditTimelinePhotoFile(file);
    setEditTimelinePhotoPreview(URL.createObjectURL(file));
  };

  const clearTimelineAddPhoto = () => {
    setTimelinePhotoFile(null);
    setTimelinePhotoPreview(null);
    if (timelineFileInputRef.current) timelineFileInputRef.current.value = '';
  };

  const clearTimelineEditPhoto = () => {
    setEditTimelinePhotoFile(null);
    setEditTimelinePhotoPreview(null);
    if (editTimelineFileInputRef.current) editTimelineFileInputRef.current.value = '';
  };

  const handleAddGallery = async (e) => {
    e.preventDefault();
    if (!newGallery.caption) return;
    setLoading(true);
    if (isSupabaseConfigured) {
      let imageUrl = newGallery.image;
      if (photoFile) {
        setUploadingPhoto(true);
        try { imageUrl = await uploadPhotoToStorage(photoFile); }
        catch (err) { setMessage('Gagal upload foto: ' + err.message); setLoading(false); setUploadingPhoto(false); return; }
        setUploadingPhoto(false);
      }
      const { error } = await supabase.from('gallery').insert([{ ...newGallery, image: imageUrl }]);
      if (!error) {
        setMessage('Foto berhasil ditambahkan! 📸');
        setNewGallery({ caption: '', image: '', tag: 'dates' });
        clearAddPhoto();
        fetchAdminData();
        if (onDataChange) onDataChange();
      } else setMessage('Error: ' + error.message);
    } else setMessage('Mode demo: Supabase belum terhubung!');
    setLoading(false);
  };

  const handleAddTimeline = async (e) => {
    e.preventDefault();
    if (!newTimeline.title || !newTimeline.date) return;
    setLoading(true);
    if (isSupabaseConfigured) {
      let imageUrl = newTimeline.image;
      if (timelinePhotoFile) {
        setUploadingPhoto(true);
        try { imageUrl = await uploadPhotoToStorage(timelinePhotoFile); }
        catch (err) { setMessage('Gagal upload foto: ' + err.message); setLoading(false); setUploadingPhoto(false); return; }
        setUploadingPhoto(false);
      }
      const { error } = await supabase.from('timeline').insert([{ ...newTimeline, image: imageUrl }]);
      if (!error) {
        setMessage('Timeline berhasil ditambahkan! 📖');
        setNewTimeline({ title: '', date: '', description: '', image: '', icon: 'favorite', is_highlight: false });
        clearTimelineAddPhoto();
        fetchAdminData();
        if (onDataChange) onDataChange();
      } else setMessage('Error: ' + error.message);
    } else setMessage('Mode demo: Supabase belum terhubung!');
    setLoading(false);
  };

  const handleAddSong = async (e) => {
    e.preventDefault();
    if (!newSong.title || !newSong.artist) return;
    setLoading(true);
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('playlist').insert([newSong]);
      if (!error) {
        setMessage('Lagu berhasil ditambahkan! 🎧');
        setNewSong({ title: '', artist: '', link: 'https://open.spotify.com', duration: '3:30' });
        fetchAdminData();
        if (onDataChange) onDataChange();
      } else setMessage('Error: ' + error.message);
    } else setMessage('Mode demo: Supabase belum terhubung!');
    setLoading(false);
  };

  const handleUpdateFavorite = async (e) => {
    e.preventDefault();
    if (!editingFavorite) return;
    setLoading(true);

    let avatarUrl = editingFavorite.avatar || null;
    if (editFavoriteAvatarFile) {
      if (!isSupabaseConfigured) {
        setMessage('Supabase belum terhubung, tidak bisa upload avatar file.');
        setLoading(false);
        return;
      }
      setUploadingPhoto(true);
      try {
        avatarUrl = await uploadPhotoToStorage(editFavoriteAvatarFile);
      } catch (err) {
        setMessage('Gagal upload avatar: ' + err.message);
        setLoading(false);
        setUploadingPhoto(false);
        return;
      }
      setUploadingPhoto(false);
    }

    const updatedCards = favoriteCards.map((item) => {
      if (item.id !== editingFavorite.id) return item;
      return {
        ...item,
        name: editingFavorite.name,
        role: editingFavorite.role,
        emoji: editingFavorite.emoji,
        avatar: avatarUrl || item.avatar,
        favoriteColor: editingFavorite.favoriteColor || editingFavorite.favorite_color || item.favoriteColor,
        favoriteSong: editingFavorite.favoriteSong || editingFavorite.favorite_song || item.favoriteSong,
        favoriteFood: editingFavorite.favoriteFood || editingFavorite.favorite_food || item.favoriteFood,
        funFact: editingFavorite.funFact || editingFavorite.fun_fact || item.funFact,
      };
    });
    setFavoriteCards(updatedCards);
    setEditingFavorite(null);
    clearEditFavoriteAvatar();
    setMessage('Profil card diperbarui! ✏️');
    if (onDataChange) onDataChange();
    setLoading(false);
    onClose();
  };

  const handleUpdateGallery = async (e) => {
    e.preventDefault();
    if (!editingGallery) return;
    setLoading(true);
    if (isSupabaseConfigured) {
      let imageUrl = editingGallery.image;
      if (editPhotoFile) {
        setUploadingPhoto(true);
        try { imageUrl = await uploadPhotoToStorage(editPhotoFile); }
        catch (err) { setMessage('Gagal upload foto: ' + err.message); setLoading(false); setUploadingPhoto(false); return; }
        setUploadingPhoto(false);
      }
      const { error } = await supabase.from('gallery')
        .update({ caption: editingGallery.caption, image: imageUrl, tag: editingGallery.tag })
        .eq('id', editingGallery.id);
      if (!error) { setMessage('Foto diperbarui! ✏️'); setEditingGallery(null); clearEditPhoto(); fetchAdminData(); if (onDataChange) onDataChange(); }
      else setMessage('Error: ' + error.message);
    }
    setLoading(false);
  };

  const handleUpdateTimeline = async (e) => {
    e.preventDefault();
    if (!editingTimeline) return;
    setLoading(true);
    if (isSupabaseConfigured) {
      let imageUrl = editingTimeline.image;
      if (editTimelinePhotoFile) {
        setUploadingPhoto(true);
        try { imageUrl = await uploadPhotoToStorage(editTimelinePhotoFile); }
        catch (err) { setMessage('Gagal upload foto: ' + err.message); setLoading(false); setUploadingPhoto(false); return; }
        setUploadingPhoto(false);
      }
      const { error } = await supabase.from('timeline')
        .update({ title: editingTimeline.title, date: editingTimeline.date, description: editingTimeline.description, icon: editingTimeline.icon, is_highlight: editingTimeline.is_highlight, image: imageUrl })
        .eq('id', editingTimeline.id);
      if (!error) { setMessage('Timeline diperbarui! ✏️'); setEditingTimeline(null); clearTimelineEditPhoto(); fetchAdminData(); if (onDataChange) onDataChange(); }
      else setMessage('Error: ' + error.message);
    }
    setLoading(false);
  };

  const handleUpdateSong = async (e) => {
    e.preventDefault();
    if (!editingSong) return;
    setLoading(true);
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('playlist')
        .update({ title: editingSong.title, artist: editingSong.artist, link: editingSong.link, duration: editingSong.duration, cover_image: editingSong.cover_image || '' })
        .eq('id', editingSong.id);
      if (!error) { setMessage('Lagu diperbarui! ✏️'); setEditingSong(null); fetchAdminData(); if (onDataChange) onDataChange(); }
      else setMessage('Error: ' + error.message);
    }
    setLoading(false);
  };

  const handleUpdateLetter = async (e) => {
    e.preventDefault();
    if (!letterData) return;
    setLoading(true);
    if (isSupabaseConfigured) {
      const paragraphsArray = typeof letterData.paragraphs === 'string'
        ? letterData.paragraphs.split('\n').filter((p) => p.trim() !== '')
        : letterData.paragraphs;
      const { error } = await supabase.from('letters')
        .update({ greeting: letterData.greeting, paragraphs: paragraphsArray, closing: letterData.closing, signature: letterData.signature })
        .eq('id', letterData.id);
      if (!error) { setMessage('Surat diperbarui! 💌'); if (onDataChange) onDataChange(); }
      else setMessage('Error: ' + error.message);
    }
    setLoading(false);
  };

  const handleDeleteItem = async (table, id) => {
    if (!window.confirm('Yakin ingin menghapus item ini?')) return;
    setLoading(true);
    if (isSupabaseConfigured) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (!error) { setMessage('Item dihapus! 🗑️'); fetchAdminData(); if (onDataChange) onDataChange(); }
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  const iCls = 'w-full bg-[#fff8f3] border border-[#111111] p-2 text-xs font-[Hanken_Grotesk] focus:outline-none focus:border-[#ff6fa5]';
  const lCls = 'block text-xs font-bold uppercase font-[Hanken_Grotesk] mb-1';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-[#111111]/80 backdrop-blur-md p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative bg-[#fff8f3] border-4 border-[#111111] w-full max-w-2xl max-h-[88vh] overflow-y-auto p-5 sm:p-8 comic-shadow-pink"
        >
          <CornerWeb position="top-left" size={100} color="#ff6fa5" />
          <button onClick={onClose} className="absolute top-3 right-3 w-9 h-9 bg-[#ff6fa5] border-2 border-[#111111] rounded-full flex items-center justify-center comic-shadow-sm hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-white text-lg">close</span>
          </button>

          <div className="text-center mb-6">
            <div className="inline-block bg-[#111111] text-[#00f0ff] px-3 py-1 font-[Anybody] text-xs uppercase font-black tracking-widest border border-[#00f0ff] mb-2 comic-shadow-sm">
              🎨 ZEEVERLYN LOVE STUDIO
            </div>
            <h2 className="font-[Anybody] text-2xl sm:text-3xl font-black text-[#1d1b18] uppercase">Studio Cinta 💕</h2>
            {!isSupabaseConfigured && (
              <p className="font-[Hanken_Grotesk] text-xs text-[#aa2c62] font-semibold mt-1 bg-[#ff6fa5]/15 px-3 py-1 border border-[#ff6fa5] inline-block rounded">
                ⚠️ Supabase keys belum diset di .env
              </p>
            )}
          </div>

          {!isAuthenticated ? (
            <form onSubmit={handlePinSubmit} className="flex flex-col items-center gap-4 py-8">
              <span className="material-symbols-outlined text-5xl text-[#ff6fa5]">lock</span>
              <p className="font-[Hanken_Grotesk] text-sm text-[#514347] text-center">Masukkan Passkey untuk masuk ke Love Studio ZeeVerlyn:</p>
              <input type="password" maxLength="6" placeholder="Passkey" value={pin} onChange={(e) => setPin(e.target.value)}
                className="font-[Anybody] text-center text-2xl tracking-[0.4em] bg-white border-2 border-[#111111] px-4 py-2 w-48 comic-shadow-sm focus:outline-none focus:border-[#ff6fa5]" />
              {pinError && <p className="font-[Hanken_Grotesk] text-xs text-red-600 font-bold">Passkey Salah! Coba lagi.</p>}
              <button type="submit" className="bg-[#ff6fa5] text-white font-[Anybody] font-black text-sm uppercase px-6 py-2.5 border-2 border-[#111111] comic-shadow hover:-translate-y-0.5 transition-transform">
                MASUK LOVE STUDIO 💕
              </button>
            </form>
          ) : (
            <div>
              <div className="flex border-b-2 border-[#111111] gap-1 mb-6 overflow-x-auto pb-1">
                {[
                  { id: 'hero', label: '🌟 Chapter 1' },
                  { id: 'favorites', label: '🃏 Profiles' },
                  { id: 'gallery', label: '📸 Gallery' },
                  { id: 'timeline', label: '📖 Timeline' },
                  { id: 'playlist', label: '🎧 Playlist' },
                  { id: 'letter', label: '💌 Surat' },
                ].map((tab) => (
                  <button key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setEditingGallery(null); setEditingTimeline(null); setEditingSong(null); setEditingFavorite(null); }}
                    className={`font-[Hanken_Grotesk] text-xs font-bold uppercase tracking-wider px-4 py-2 border-t-2 border-x-2 border-[#111111] transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-[#ff6fa5] text-white comic-shadow-sm' : 'bg-white text-[#1d1b18] hover:bg-[#f4a6c1]'}`}>
                    {tab.label}
                  </button>
                ))}
              </div>

              {message && (
                <div className="mb-4 bg-[#00f0ff]/20 border-2 border-[#111111] px-4 py-2 text-xs font-[Hanken_Grotesk] font-bold text-[#111111] flex items-center justify-between">
                  <span>{message}</span>
                  <button onClick={() => setMessage('')} className="text-sm font-black">✕</button>
                </div>
              )}

              {/* ── HERO (CHAPTER 1) TAB ── */}
              {activeTab === 'hero' && (
                <div className="bg-white border-2 border-[#111111] p-4 comic-shadow space-y-4">
                  <h3 className="font-[Anybody] text-sm font-black uppercase text-[#aa2c62]">
                    🌟 Foto Utama Chapter 1 (Hero Section)
                  </h3>
                  <p className="text-xs text-[#514347] font-[Hanken_Grotesk]">
                    Foto ini akan tampil di bingkai komik utama halaman depan (Chapter 1).
                  </p>

                  {heroItem?.image && !heroPhotoPreview && (
                    <div>
                      <label className={lCls}>Foto Terpasang Saat Ini:</label>
                      <img
                        src={heroItem.image}
                        alt="Current Hero"
                        className="h-44 w-full object-cover border-2 border-[#111111] comic-shadow-sm"
                      />
                    </div>
                  )}

                  <form onSubmit={handleSaveHeroPhoto} className="space-y-3">
                    <div>
                      <label className={lCls}>📷 Upload Foto Baru dari Perangkat:</label>
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => heroFileInputRef.current?.click()}
                          className="flex items-center gap-1.5 bg-[#ff6fa5] text-white font-[Anybody] font-black text-xs uppercase px-3 py-2 border-2 border-[#111111] comic-shadow-sm hover:scale-105 transition-transform"
                        >
                          <span className="material-symbols-outlined text-sm">photo_camera</span>
                          Pilih Foto
                        </button>
                        {heroPhotoPreview && (
                          <button type="button" onClick={clearHeroPhoto} className="text-xs text-red-500 font-bold underline font-[Hanken_Grotesk]">
                            Batal Pilih
                          </button>
                        )}
                      </div>
                      <input ref={heroFileInputRef} type="file" accept="image/*" onChange={handleHeroPhotoFileChange} className="hidden" />

                      {heroPhotoPreview && (
                        <div className="mt-2 flex flex-col gap-1">
                          <label className="text-[10px] text-[#514347] font-[Hanken_Grotesk] uppercase font-bold">Preview Foto Baru:</label>
                          <img src={heroPhotoPreview} alt="Preview" className="h-44 w-full object-cover border-2 border-[#111111] comic-shadow-sm" />
                        </div>
                      )}
                    </div>

                    {!heroPhotoFile && (
                      <div>
                        <label className={lCls}>— atau masukkan URL foto:</label>
                        <input
                          type="text"
                          placeholder="https://..."
                          value={heroUrlInput}
                          onChange={(e) => setHeroUrlInput(e.target.value)}
                          className={iCls}
                        />
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-[#00f0ff] text-[#111111] font-[Anybody] font-black text-xs uppercase px-5 py-2.5 border-2 border-[#111111] comic-shadow-sm hover:scale-105 transition-transform disabled:opacity-50"
                    >
                      {uploadingPhoto ? '⏳ MENGUPLOAD FOTO...' : loading ? 'MENYIMPAN...' : 'SIMPAN FOTO CHAPTER 1 🌟'}
                    </button>
                  </form>
                </div>
              )}

              {/* ── FAVORITES TAB ── */}
              {activeTab === 'favorites' && (
                <div className="space-y-6">
                  <div className="bg-white border-2 border-[#111111] p-4 comic-shadow space-y-3">
                    <h3 className="font-[Anybody] text-sm font-black uppercase text-[#aa2c62]">✏️ Edit Dua Hero Profile Card</h3>
                    <p className="text-xs text-[#514347] font-[Hanken_Grotesk]">
                      Ubah hanya dua kartu hero yang sudah ada. Penambahan kartu baru tidak tersedia.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-[Anybody] text-xs font-black uppercase mb-2">Daftar Profil Card:</h4>
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {favoriteCards.length === 0 ? (
                        <p className="text-xs italic text-[#514347]">Belum ada profil card tersimpan.</p>
                      ) : favoriteCards.map((item) => (
                        <div key={item.id} className="bg-white border border-[#111111]">
                          {editingFavorite?.id === item.id ? (
                            <form onSubmit={handleUpdateFavorite} className="p-3 space-y-2">
                              <p className="text-[10px] font-black font-[Anybody] uppercase text-[#aa2c62]">✏️ Edit Profil Card</p>
                              <div className="grid grid-cols-2 gap-2">
                                <input type="text" value={editingFavorite.name}
                                  onChange={(e) => setEditingFavorite({ ...editingFavorite, name: e.target.value })} className={iCls} placeholder="Nama" />
                                <input type="text" value={editingFavorite.role}
                                  onChange={(e) => setEditingFavorite({ ...editingFavorite, role: e.target.value })} className={iCls} placeholder="Peran" />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <input type="text" value={editingFavorite.emoji}
                                  onChange={(e) => setEditingFavorite({ ...editingFavorite, emoji: e.target.value })} className={iCls} placeholder="Emoji" />
                                <input type="color" value={editingFavorite.favoriteColor || editingFavorite.favorite_color || '#f4a6c1'}
                                  onChange={(e) => setEditingFavorite({ ...editingFavorite, favoriteColor: e.target.value, favorite_color: e.target.value })} className={iCls + ' h-10'} />
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <button type="button" onClick={() => editFavoriteAvatarFileInputRef.current?.click()}
                                  className="flex items-center gap-1 bg-[#f4a6c1] text-[#111111] font-[Anybody] font-black text-[10px] uppercase px-2 py-1.5 border border-[#111111] hover:scale-105 transition-transform">
                                  <span className="material-symbols-outlined text-xs">photo_camera</span> Ganti Avatar
                                </button>
                                <input ref={editFavoriteAvatarFileInputRef} type="file" accept="image/*" onChange={handleEditFavoriteAvatarFileChange} className="hidden" />
                                {editFavoriteAvatarPreview && (
                                  <>
                                    <img src={editFavoriteAvatarPreview} alt="Preview" className="h-10 w-10 object-cover border border-[#111111]" />
                                    <button type="button" onClick={clearEditFavoriteAvatar} className="text-[10px] text-red-500 font-bold underline">Hapus</button>
                                  </>
                                )}
                              </div>
                              {!editFavoriteAvatarFile && (
                                <input type="text" value={editingFavorite.avatar || editingFavorite.avatar_url || ''}
                                  onChange={(e) => setEditingFavorite({ ...editingFavorite, avatar: e.target.value })} className={iCls} placeholder="URL avatar" />
                              )}
                              <input type="text" value={editingFavorite.favoriteSong || editingFavorite.favorite_song || ''}
                                onChange={(e) => setEditingFavorite({ ...editingFavorite, favoriteSong: e.target.value, favorite_song: e.target.value })} className={iCls} placeholder="Favorite Song" />
                              <input type="text" value={editingFavorite.favoriteFood || editingFavorite.favorite_food || ''}
                                onChange={(e) => setEditingFavorite({ ...editingFavorite, favoriteFood: e.target.value, favorite_food: e.target.value })} className={iCls} placeholder="Favorite Food" />
                              <textarea value={editingFavorite.funFact || editingFavorite.fun_fact || ''}
                                onChange={(e) => setEditingFavorite({ ...editingFavorite, funFact: e.target.value, fun_fact: e.target.value })}
                                className={iCls + ' h-16 resize-none'} placeholder="Fun Fact" />
                              <div className="flex gap-2">
                                <button type="submit" disabled={loading} className="bg-[#00f0ff] text-[#111111] font-[Anybody] font-black text-[10px] uppercase px-3 py-1.5 border border-[#111111] disabled:opacity-50">
                                  {loading ? 'MENYIMPAN...' : 'SIMPAN ✓'}
                                </button>
                                <button type="button" onClick={() => { setEditingFavorite(null); clearEditFavoriteAvatar(); }} className="bg-white text-[#111111] font-[Anybody] font-black text-[10px] uppercase px-3 py-1.5 border border-[#111111]">BATAL</button>
                              </div>
                            </form>
                          ) : (
                            <div className="flex items-center justify-between p-2.5 text-xs gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                {item.avatar ? (
                                  <img src={item.avatar} alt="" className="h-9 w-9 object-cover border border-[#111111] flex-shrink-0" onError={(e) => { e.target.style.display = 'none'; }} />
                                ) : (
                                  <div className="h-9 w-9 flex-shrink-0 bg-[#f4a6c1] border border-[#111111] flex items-center justify-center">
                                    <span>{item.emoji || '🕷️'}</span>
                                  </div>
                                )}
                                <div className="truncate">
                                  <span className="font-bold">{item.name}</span>
                                  <span className="ml-2 text-[10px] bg-[#111111] text-white px-1.5 py-0.5 uppercase">{item.role || 'Hero'}</span>
                                </div>
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                <button onClick={() => { setEditingFavorite({ ...item }); clearEditFavoriteAvatar(); }} className="bg-[#00f0ff] text-[#111111] font-bold px-2 py-1 text-[10px] border border-[#111111] hover:scale-105 transition-transform">EDIT ✏️</button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── GALLERY TAB ── */}
              {activeTab === 'gallery' && (
                <div className="space-y-6">
                  <form onSubmit={handleAddGallery} className="bg-white border-2 border-[#111111] p-4 comic-shadow space-y-3">
                    <h3 className="font-[Anybody] text-sm font-black uppercase text-[#aa2c62]">➕ Tambah Foto Gallery Baru</h3>
                    <div>
                      <label className={lCls}>Caption Foto:</label>
                      <input type="text" placeholder="Dinner seru di cafe romantis 🤍" value={newGallery.caption}
                        onChange={(e) => setNewGallery({ ...newGallery, caption: e.target.value })} className={iCls} required />
                    </div>
                    <div>
                      <label className={lCls}>📷 Upload Foto dari Perangkat:</label>
                      <div className="flex items-center gap-2 flex-wrap">
                        <button type="button" onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-1.5 bg-[#ff6fa5] text-white font-[Anybody] font-black text-xs uppercase px-3 py-2 border-2 border-[#111111] comic-shadow-sm hover:scale-105 transition-transform">
                          <span className="material-symbols-outlined text-sm">photo_camera</span>
                          Pilih Foto
                        </button>
                        {photoPreview && <button type="button" onClick={clearAddPhoto} className="text-xs text-red-500 font-bold underline font-[Hanken_Grotesk]">Hapus Foto</button>}
                      </div>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoFileChange} className="hidden" />
                      {photoPreview && (
                        <div className="mt-2 flex items-center gap-3">
                          <img src={photoPreview} alt="Preview" className="h-20 w-20 object-cover border-2 border-[#111111] comic-shadow-sm" />
                          <p className="text-[10px] text-[#514347] font-[Hanken_Grotesk]">✅ Foto siap diupload</p>
                        </div>
                      )}
                      {!photoFile && (
                        <div className="mt-2">
                          <label className="text-[10px] text-[#514347] font-[Hanken_Grotesk] uppercase font-bold">— atau masukkan URL foto:</label>
                          <input type="text" placeholder="https://... atau /images/..." value={newGallery.image}
                            onChange={(e) => setNewGallery({ ...newGallery, image: e.target.value })} className={iCls + ' mt-1'} />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className={lCls}>Tag / Kategori:</label>
                      <select value={newGallery.tag} onChange={(e) => setNewGallery({ ...newGallery, tag: e.target.value })} className={iCls}>
                        <option value="dates">dates</option>
                        <option value="travel">travel</option>
                        <option value="random">random</option>
                      </select>
                    </div>
                    <button type="submit" disabled={loading}
                      className="bg-[#00f0ff] text-[#111111] font-[Anybody] font-black text-xs uppercase px-4 py-2 border-2 border-[#111111] comic-shadow-sm hover:scale-105 transition-transform disabled:opacity-50">
                      {uploadingPhoto ? '⏳ MENGUPLOAD FOTO...' : loading ? 'MENYIMPAN...' : 'TAMBAH FOTO 🕸️'}
                    </button>
                  </form>

                  <div>
                    <h4 className="font-[Anybody] text-xs font-black uppercase mb-2">Daftar Foto Terpasang:</h4>
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {galleryList.length === 0 ? (
                        <p className="text-xs italic text-[#514347]">Belum ada item.</p>
                      ) : galleryList.map((item) => (
                        <div key={item.id} className="bg-white border border-[#111111]">
                          {editingGallery?.id === item.id ? (
                            <form onSubmit={handleUpdateGallery} className="p-3 space-y-2">
                              <p className="text-[10px] font-black font-[Anybody] uppercase text-[#aa2c62]">✏️ Edit Foto</p>
                              <input type="text" value={editingGallery.caption}
                                onChange={(e) => setEditingGallery({ ...editingGallery, caption: e.target.value })} className={iCls} placeholder="Caption" />
                              <div className="flex items-center gap-2 flex-wrap">
                                <button type="button" onClick={() => editFileInputRef.current?.click()}
                                  className="flex items-center gap-1 bg-[#f4a6c1] text-[#111111] font-[Anybody] font-black text-[10px] uppercase px-2 py-1.5 border border-[#111111] hover:scale-105 transition-transform">
                                  <span className="material-symbols-outlined text-xs">photo_camera</span> Ganti Foto
                                </button>
                                <input ref={editFileInputRef} type="file" accept="image/*" onChange={handleEditPhotoFileChange} className="hidden" />
                                {editPhotoPreview && (
                                  <>
                                    <img src={editPhotoPreview} alt="Preview" className="h-10 w-10 object-cover border border-[#111111]" />
                                    <button type="button" onClick={clearEditPhoto} className="text-[10px] text-red-500 font-bold underline">Hapus</button>
                                  </>
                                )}
                              </div>
                              {!editPhotoFile && (
                                <input type="text" value={editingGallery.image || ''}
                                  onChange={(e) => setEditingGallery({ ...editingGallery, image: e.target.value })} className={iCls} placeholder="URL Foto" />
                              )}
                              <select value={editingGallery.tag} onChange={(e) => setEditingGallery({ ...editingGallery, tag: e.target.value })} className={iCls}>
                                <option value="dates">dates</option>
                                <option value="travel">travel</option>
                                <option value="random">random</option>
                              </select>
                              <div className="flex gap-2">
                                <button type="submit" disabled={loading} className="bg-[#00f0ff] text-[#111111] font-[Anybody] font-black text-[10px] uppercase px-3 py-1.5 border border-[#111111] disabled:opacity-50">
                                  {uploadingPhoto ? '⏳ UPLOAD...' : 'SIMPAN ✓'}
                                </button>
                                <button type="button" onClick={() => { setEditingGallery(null); clearEditPhoto(); }}
                                  className="bg-white text-[#111111] font-[Anybody] font-black text-[10px] uppercase px-3 py-1.5 border border-[#111111]">BATAL</button>
                              </div>
                            </form>
                          ) : (
                            <div className="flex items-center justify-between p-2.5 text-xs gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                {item.image && (
                                  <img src={item.image} alt="" className="h-9 w-9 object-cover border border-[#111111] flex-shrink-0"
                                    onError={(e) => { e.target.style.display = 'none'; }} />
                                )}
                                <div className="truncate">
                                  <span className="font-bold">{item.caption}</span>
                                  <span className="ml-2 text-[10px] bg-[#111111] text-white px-1.5 py-0.5 uppercase">{item.tag}</span>
                                </div>
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                <button onClick={() => { setEditingGallery({ ...item }); clearEditPhoto(); }}
                                  className="bg-[#00f0ff] text-[#111111] font-bold px-2 py-1 text-[10px] border border-[#111111] hover:scale-105 transition-transform">EDIT ✏️</button>
                                <button onClick={() => handleDeleteItem('gallery', item.id)}
                                  className="bg-red-500 text-white font-bold px-2 py-1 text-[10px] border border-[#111111] hover:scale-105 transition-transform">HAPUS 🗑️</button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── TIMELINE TAB ── */}
              {activeTab === 'timeline' && (
                <div className="space-y-6">
                  <form onSubmit={handleAddTimeline} className="bg-white border-2 border-[#111111] p-4 comic-shadow space-y-3">
                    <h3 className="font-[Anybody] text-sm font-black uppercase text-[#aa2c62]">➕ Tambah Bab Timeline Baru</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={lCls}>Judul Bab:</label>
                        <input type="text" placeholder="Jalan-jalan ke pantai 🌴" value={newTimeline.title}
                          onChange={(e) => setNewTimeline({ ...newTimeline, title: e.target.value })} className={iCls} required />
                      </div>
                      <div>
                        <label className={lCls}>Tanggal:</label>
                        <input type="date" value={newTimeline.date}
                          onChange={(e) => setNewTimeline({ ...newTimeline, date: e.target.value })} className={iCls} required />
                      </div>
                    </div>
                    <div>
                      <label className={lCls}>Deskripsi Cerita:</label>
                      <textarea placeholder="Tuliskan cerita manis bab ini..." value={newTimeline.description}
                        onChange={(e) => setNewTimeline({ ...newTimeline, description: e.target.value })}
                        className={iCls + ' h-16 resize-none'} required />
                    </div>
                    <div>
                      <label className={lCls}>📷 Upload Foto (opsional):</label>
                      <div className="flex items-center gap-2 flex-wrap">
                        <button type="button" onClick={() => timelineFileInputRef.current?.click()}
                          className="flex items-center gap-1.5 bg-[#ff6fa5] text-white font-[Anybody] font-black text-xs uppercase px-3 py-2 border-2 border-[#111111] comic-shadow-sm hover:scale-105 transition-transform">
                          <span className="material-symbols-outlined text-sm">photo_camera</span>
                          Pilih Foto
                        </button>
                        {timelinePhotoPreview && <button type="button" onClick={clearTimelineAddPhoto} className="text-xs text-red-500 font-bold underline font-[Hanken_Grotesk]">Hapus Foto</button>}
                      </div>
                      <input ref={timelineFileInputRef} type="file" accept="image/*" onChange={handleTimelinePhotoFileChange} className="hidden" />
                      {timelinePhotoPreview && (
                        <div className="mt-2 flex items-center gap-3">
                          <img src={timelinePhotoPreview} alt="Preview" className="h-20 w-20 object-cover border-2 border-[#111111] comic-shadow-sm" />
                          <p className="text-[10px] text-[#514347] font-[Hanken_Grotesk]">✅ Foto siap diupload</p>
                        </div>
                      )}
                      {!timelinePhotoFile && (
                        <div className="mt-2">
                          <label className="text-[10px] text-[#514347] font-[Hanken_Grotesk] uppercase font-bold">— atau masukkan URL foto:</label>
                          <input type="text" placeholder="https://..." value={newTimeline.image}
                            onChange={(e) => setNewTimeline({ ...newTimeline, image: e.target.value })} className={iCls + ' mt-1'} />
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={lCls}>Icon (Material Symbol):</label>
                        <input type="text" placeholder="favorite, star, local_cafe..." value={newTimeline.icon}
                          onChange={(e) => setNewTimeline({ ...newTimeline, icon: e.target.value })} className={iCls} />
                      </div>
                      <div className="flex items-end pb-1">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={newTimeline.is_highlight}
                            onChange={(e) => setNewTimeline({ ...newTimeline, is_highlight: e.target.checked })}
                            className="w-4 h-4 accent-[#ff6fa5]" />
                          <span className="font-[Hanken_Grotesk] text-xs font-bold uppercase">Highlight Utama ⭐</span>
                        </label>
                      </div>
                    </div>
                    <button type="submit" disabled={loading}
                      className="bg-[#00f0ff] text-[#111111] font-[Anybody] font-black text-xs uppercase px-4 py-2 border-2 border-[#111111] comic-shadow-sm hover:scale-105 transition-transform disabled:opacity-50">
                      {uploadingPhoto ? '⏳ MENGUPLOAD FOTO...' : loading ? 'MENYIMPAN...' : 'TAMBAH BAB TIMELINE 📖'}
                    </button>
                  </form>

                  <div>
                    <h4 className="font-[Anybody] text-xs font-black uppercase mb-2">Daftar Bab Timeline:</h4>
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {timelineList.map((item) => (
                        <div key={item.id} className="bg-white border border-[#111111]">
                          {editingTimeline?.id === item.id ? (
                            <form onSubmit={handleUpdateTimeline} className="p-3 space-y-2">
                              <p className="text-[10px] font-black font-[Anybody] uppercase text-[#aa2c62]">✏️ Edit Timeline</p>
                              <div className="grid grid-cols-2 gap-2">
                                <input type="text" value={editingTimeline.title}
                                  onChange={(e) => setEditingTimeline({ ...editingTimeline, title: e.target.value })} className={iCls} placeholder="Judul" />
                                <input type="date" value={editingTimeline.date}
                                  onChange={(e) => setEditingTimeline({ ...editingTimeline, date: e.target.value })} className={iCls} />
                              </div>
                              <textarea value={editingTimeline.description}
                                onChange={(e) => setEditingTimeline({ ...editingTimeline, description: e.target.value })}
                                className={iCls + ' h-14 resize-none'} placeholder="Deskripsi" />
                              <div className="flex items-center gap-2 flex-wrap">
                                <button type="button" onClick={() => editTimelineFileInputRef.current?.click()}
                                  className="flex items-center gap-1 bg-[#f4a6c1] text-[#111111] font-[Anybody] font-black text-[10px] uppercase px-2 py-1.5 border border-[#111111] hover:scale-105 transition-transform">
                                  <span className="material-symbols-outlined text-xs">photo_camera</span> Ganti Foto
                                </button>
                                <input ref={editTimelineFileInputRef} type="file" accept="image/*" onChange={handleEditTimelinePhotoFileChange} className="hidden" />
                                {editTimelinePhotoPreview && (
                                  <>
                                    <img src={editTimelinePhotoPreview} alt="Preview" className="h-10 w-10 object-cover border border-[#111111]" />
                                    <button type="button" onClick={clearTimelineEditPhoto} className="text-[10px] text-red-500 font-bold underline">Hapus</button>
                                  </>
                                )}
                              </div>
                              {!editTimelinePhotoFile && (
                                <input type="text" value={editingTimeline.image || ''}
                                  onChange={(e) => setEditingTimeline({ ...editingTimeline, image: e.target.value })} className={iCls} placeholder="URL Foto (opsional)" />
                              )}
                              <div className="grid grid-cols-2 gap-2">
                                <input type="text" value={editingTimeline.icon}
                                  onChange={(e) => setEditingTimeline({ ...editingTimeline, icon: e.target.value })} className={iCls} placeholder="Icon" />
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input type="checkbox" checked={editingTimeline.is_highlight}
                                    onChange={(e) => setEditingTimeline({ ...editingTimeline, is_highlight: e.target.checked })}
                                    className="w-4 h-4 accent-[#ff6fa5]" />
                                  <span className="font-[Hanken_Grotesk] text-[10px] font-bold uppercase">Highlight ⭐</span>
                                </label>
                              </div>
                              <div className="flex gap-2">
                                <button type="submit" disabled={loading} className="bg-[#00f0ff] text-[#111111] font-[Anybody] font-black text-[10px] uppercase px-3 py-1.5 border border-[#111111] disabled:opacity-50">
                                  {uploadingPhoto ? '⏳ UPLOAD...' : 'SIMPAN ✓'}
                                </button>
                                <button type="button" onClick={() => { setEditingTimeline(null); clearTimelineEditPhoto(); }} className="bg-white text-[#111111] font-[Anybody] font-black text-[10px] uppercase px-3 py-1.5 border border-[#111111]">BATAL</button>
                              </div>
                            </form>
                          ) : (
                            <div className="flex items-center justify-between p-2.5 text-xs gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                {item.image && (
                                  <img src={item.image} alt="" className="h-9 w-9 object-cover border border-[#111111] flex-shrink-0"
                                    onError={(e) => { e.target.style.display = 'none'; }} />
                                )}
                                <div className="truncate">
                                  <span className="font-bold">{item.title}</span>
                                  <span className="ml-2 text-[10px] text-[#aa2c62]">({item.date})</span>
                                  {item.is_highlight && <span className="ml-1">⭐</span>}
                                </div>
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                <button onClick={() => { setEditingTimeline({ ...item }); clearTimelineEditPhoto(); }}
                                  className="bg-[#00f0ff] text-[#111111] font-bold px-2 py-1 text-[10px] border border-[#111111] hover:scale-105 transition-transform">EDIT ✏️</button>
                                <button onClick={() => handleDeleteItem('timeline', item.id)}
                                  className="bg-red-500 text-white font-bold px-2 py-1 text-[10px] border border-[#111111] hover:scale-105 transition-transform">HAPUS 🗑️</button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── PLAYLIST TAB ── */}
              {activeTab === 'playlist' && (
                <div className="space-y-6">
                  <form onSubmit={handleAddSong} className="bg-white border-2 border-[#111111] p-4 comic-shadow space-y-3">
                    <h3 className="font-[Anybody] text-sm font-black uppercase text-[#aa2c62]">➕ Tambah Lagu Playlist Baru</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={lCls}>Judul Lagu:</label>
                        <input type="text" placeholder="Sunflower" value={newSong.title}
                          onChange={(e) => setNewSong({ ...newSong, title: e.target.value })} className={iCls} required />
                      </div>
                      <div>
                        <label className={lCls}>Penyanyi / Artist:</label>
                        <input type="text" placeholder="Post Malone, Swae Lee" value={newSong.artist}
                          onChange={(e) => setNewSong({ ...newSong, artist: e.target.value })} className={iCls} required />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={lCls}>Link Spotify:</label>
                        <input type="text" placeholder="https://open.spotify.com/track/..." value={newSong.link}
                          onChange={(e) => setNewSong({ ...newSong, link: e.target.value })} className={iCls} />
                      </div>
                      <div>
                        <label className={lCls}>Durasi (contoh: 3:30):</label>
                        <input type="text" placeholder="3:30" value={newSong.duration}
                          onChange={(e) => setNewSong({ ...newSong, duration: e.target.value })} className={iCls} />
                      </div>
                    </div>
                    <div>
                      <label className={lCls}>🎨 URL Cover Art (dari Spotify):</label>
                      <input type="text" placeholder="https://i.scdn.co/image/..." value={newSong.cover_image}
                        onChange={(e) => setNewSong({ ...newSong, cover_image: e.target.value })} className={iCls} />
                      <p className="text-[10px] text-[#514347] mt-1 font-[Hanken_Grotesk]">
                        💡 Klik kanan foto album di Spotify → "Copy Image Address" lalu paste di sini
                      </p>
                      {newSong.cover_image && (
                        <div className="mt-2 flex items-center gap-3">
                          <img src={newSong.cover_image} alt="Cover preview" className="h-16 w-16 object-cover border-2 border-[#111111] comic-shadow-sm"
                            onError={(e) => { e.target.style.display='none'; }} />
                          <p className="text-[10px] text-[#514347] font-[Hanken_Grotesk]">✅ Preview cover art</p>
                        </div>
                      )}
                    </div>
                    <button type="submit" disabled={loading}
                      className="bg-[#00f0ff] text-[#111111] font-[Anybody] font-black text-xs uppercase px-4 py-2 border-2 border-[#111111] comic-shadow-sm hover:scale-105 transition-transform disabled:opacity-50">
                      {loading ? 'MENYIMPAN...' : 'TAMBAH LAGU 🎧'}
                    </button>
                  </form>

                  <div>
                    <h4 className="font-[Anybody] text-xs font-black uppercase mb-2">Daftar Lagu:</h4>
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {playlistList.map((item) => (
                        <div key={item.id} className="bg-white border border-[#111111]">
                          {editingSong?.id === item.id ? (
                            <form onSubmit={handleUpdateSong} className="p-3 space-y-2">
                              <p className="text-[10px] font-black font-[Anybody] uppercase text-[#aa2c62]">✏️ Edit Lagu</p>
                              <div className="grid grid-cols-2 gap-2">
                                <input type="text" value={editingSong.title}
                                  onChange={(e) => setEditingSong({ ...editingSong, title: e.target.value })} className={iCls} placeholder="Judul" />
                                <input type="text" value={editingSong.artist}
                                  onChange={(e) => setEditingSong({ ...editingSong, artist: e.target.value })} className={iCls} placeholder="Artist" />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <input type="text" value={editingSong.link}
                                  onChange={(e) => setEditingSong({ ...editingSong, link: e.target.value })} className={iCls} placeholder="Link Spotify" />
                                <input type="text" value={editingSong.duration}
                                  onChange={(e) => setEditingSong({ ...editingSong, duration: e.target.value })} className={iCls} placeholder="Durasi" />
                              </div>
                              <div>
                                <label className={lCls}>🎨 URL Cover Art:</label>
                                <input type="text" value={editingSong.cover_image || ''}
                                  onChange={(e) => setEditingSong({ ...editingSong, cover_image: e.target.value })} className={iCls} placeholder="https://i.scdn.co/image/..." />
                                {editingSong.cover_image && (
                                  <img src={editingSong.cover_image} alt="Cover" className="mt-1 h-12 w-12 object-cover border border-[#111111]"
                                    onError={(e) => { e.target.style.display='none'; }} />
                                )}
                              </div>
                              <div className="flex gap-2">
                                <button type="submit" disabled={loading} className="bg-[#00f0ff] text-[#111111] font-[Anybody] font-black text-[10px] uppercase px-3 py-1.5 border border-[#111111] disabled:opacity-50">SIMPAN ✓</button>
                                <button type="button" onClick={() => setEditingSong(null)} className="bg-white text-[#111111] font-[Anybody] font-black text-[10px] uppercase px-3 py-1.5 border border-[#111111]">BATAL</button>
                              </div>
                            </form>
                          ) : (
                            <div className="flex items-center justify-between p-2.5 text-xs gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                {item.cover_image ? (
                                  <img src={item.cover_image} alt="" className="h-9 w-9 object-cover border border-[#111111] flex-shrink-0 rounded-sm"
                                    onError={(e) => { e.target.style.display='none'; }} />
                                ) : (
                                  <div className="h-9 w-9 flex-shrink-0 bg-[#f4a6c1] border border-[#111111] flex items-center justify-center rounded-sm">
                                    <span className="text-base">♫</span>
                                  </div>
                                )}
                                <div className="truncate min-w-0">
                                  <span className="font-bold block truncate">{item.title}</span>
                                  <span className="text-[10px] text-[#514347] truncate block">{item.artist}</span>
                                </div>
                                {item.duration && <span className="ml-auto text-[10px] text-[#514347] flex-shrink-0">{item.duration}</span>}
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                <button onClick={() => setEditingSong({ ...item })}
                                  className="bg-[#00f0ff] text-[#111111] font-bold px-2 py-1 text-[10px] border border-[#111111] hover:scale-105 transition-transform">EDIT ✏️</button>
                                <button onClick={() => handleDeleteItem('playlist', item.id)}
                                  className="bg-red-500 text-white font-bold px-2 py-1 text-[10px] border border-[#111111] hover:scale-105 transition-transform">HAPUS 🗑️</button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── LETTER TAB ── */}
              {activeTab === 'letter' && (
                <div>
                  <div className="bg-white border-2 border-[#111111] p-4 comic-shadow">
                    <h3 className="font-[Anybody] text-sm font-black uppercase text-[#aa2c62] mb-3">💌 Edit Surat Cinta</h3>
                    {!letterData ? (
                      <p className="text-xs italic text-[#514347]">{loading ? 'Memuat data surat...' : 'Surat belum ditemukan di database.'}</p>
                    ) : (
                      <form onSubmit={handleUpdateLetter} className="space-y-3">
                        <div>
                          <label className={lCls}>Salam Pembuka:</label>
                          <input type="text" value={letterData.greeting}
                            onChange={(e) => setLetterData({ ...letterData, greeting: e.target.value })}
                            className={iCls} placeholder="Dear Verlita 💕," />
                        </div>
                        <div>
                          <label className={lCls}>Isi Surat (satu paragraf per baris):</label>
                          <textarea value={letterData.paragraphs}
                            onChange={(e) => setLetterData({ ...letterData, paragraphs: e.target.value })}
                            className={iCls + ' h-36 resize-none'}
                            placeholder={'Paragraf pertama...\nParagraf kedua...\nParagraf ketiga...'} />
                          <p className="text-[10px] text-[#514347] mt-1 font-[Hanken_Grotesk]">
                            💡 Pisahkan setiap paragraf dengan baris baru (Enter)
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className={lCls}>Penutup:</label>
                            <input type="text" value={letterData.closing}
                              onChange={(e) => setLetterData({ ...letterData, closing: e.target.value })}
                              className={iCls} placeholder="Forever & Always," />
                          </div>
                          <div>
                            <label className={lCls}>Tanda Tangan:</label>
                            <input type="text" value={letterData.signature}
                              onChange={(e) => setLetterData({ ...letterData, signature: e.target.value })}
                              className={iCls} placeholder="Zidane 🕸️" />
                          </div>
                        </div>
                        <button type="submit" disabled={loading}
                          className="bg-[#ff6fa5] text-white font-[Anybody] font-black text-xs uppercase px-4 py-2 border-2 border-[#111111] comic-shadow-sm hover:scale-105 transition-transform disabled:opacity-50">
                          {loading ? 'MENYIMPAN...' : 'SIMPAN SURAT 💌'}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
