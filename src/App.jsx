import { useState, useEffect } from 'react';
import './index.css';
import LoadingScreen from './components/LoadingScreen';
import SpiderWebCanvas from './components/SpiderWebCanvas';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Timeline from './components/Timeline';
import Gallery from './components/Gallery';
import Favorites from './components/Favorites';
import Playlist from './components/Playlist';
import Letter from './components/Letter';
import Footer from './components/Footer';
import AdminModal from './components/AdminModal';
import { favoritesData } from './data/favorites';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [favoriteCards, setFavoriteCards] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('favoriteCards');
      return saved ? JSON.parse(saved) : favoritesData;
    }
    return favoritesData;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('favoriteCards', JSON.stringify(favoriteCards));
    }
  }, [favoriteCards]);

  const triggerDataRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="relative min-h-screen bg-[#fff8f3] text-[#1d1b18] overflow-x-hidden">
      {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
      <SpiderWebCanvas />
      <Navbar onOpenAdmin={() => setIsAdminOpen(true)} />
      <main>
        <Hero refreshTrigger={refreshTrigger} />
        <Timeline refreshTrigger={refreshTrigger} />
        <Gallery refreshTrigger={refreshTrigger} />
        <Favorites favoriteCards={favoriteCards} />
        <Playlist refreshTrigger={refreshTrigger} />
        <Letter />
      </main>
      <Footer />
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onDataChange={triggerDataRefresh}
        favoriteCards={favoriteCards}
        setFavoriteCards={setFavoriteCards}
      />
    </div>
  );
}


