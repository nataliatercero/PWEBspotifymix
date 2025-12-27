import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { 
  getArtistTopTracks, searchTracksByGenre, searchTracksByYear, 
  searchTracksByArtist, searchTracksByMood, getUserProfile, createPlaylist 
} from '@/lib/spotify'; 

export function useSpotifyMixer() {
  const router = useRouter();
  const [token, setToken] = useState(null);

  // ESTADOS DE DATOS 
  const [playlist, setPlaylist] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  
  // ESTADOS DE UI 
  const [activeView, setActiveView] = useState('home');
  const [generationSource, setGenerationSource] = useState('filters');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 1. CARGA INICIAL
  useEffect(() => {
    const t = localStorage.getItem('spotify_token');
    if (!t) router.push('/');
    else setToken(t);

    const savedFavs = localStorage.getItem('my_favorites');
    if (savedFavs) setFavorites(JSON.parse(savedFavs));

    const savedHistory = localStorage.getItem('stm_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, [router]);

  // 2. GESTIÓN DE FAVORITOS
  const toggleFavorite = (track) => {
    const isAlreadyFav = favorites.some(f => f.id === track.id);
    let newFavs;
    if (isAlreadyFav) {
        newFavs = favorites.filter(f => f.id !== track.id);
        toast('Eliminado de favoritos');
    } else {
        newFavs = [...favorites, track];
        toast('Añadido a favoritos', { icon: '❤️' });
    }
    setFavorites(newFavs);
    localStorage.setItem('my_favorites', JSON.stringify(newFavs));
  };

  // 3. GESTIÓN DE HISTORIAL
  const saveToHistory = (tracks, type) => {
    if (tracks.length === 0) return;
    const newEntry = {
        id: Date.now(),
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: type === 'favorites' ? 'Basado en Favoritos' : 'Mix de Filtros',
        trackCount: tracks.length,
        tracks: tracks
    };
    const updatedHistory = [newEntry, ...history].slice(0, 10);
    setHistory(updatedHistory);
    localStorage.setItem('stm_history', JSON.stringify(updatedHistory));
  };

  const restoreFromHistory = (historyItem) => {
    setPlaylist(historyItem.tracks);
    setActiveView('home');
    setGenerationSource('history');
    toast.success('Playlist restaurada');
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('stm_history');
    toast('Historial eliminado');
  };

  // 4. EXPORTAR A SPOTIFY 
  const exportToSpotify = async () => {
    const tracksToExport = activeView === 'favorites' ? favorites : playlist;
    if (tracksToExport.length === 0) return;
    
    setIsSaving(true);
    try {
      const user = await getUserProfile(token);
      if (!user || !user.id) {
        toast.error('No se pudo identificar usuario');
        return;
      }
      
      const trackUris = tracksToExport.map(t => t.uri);
      const playlistName = activeView === 'favorites'
        ? `Mis Favoritos Taste Mixer ❤️`
        : `Mix Taste Mixer (${new Date().toLocaleDateString()})`;

      const result = await createPlaylist(user.id, playlistName.substring(0, 50), trackUris, token);
      
      if (result) toast.success('¡Guardada en Spotify!');
      else toast.error('Error al guardar');
    } catch (error) {
      console.error(error);
      toast.error('Error de conexión');
    } finally {
      setIsSaving(false);
    }
  };

  // Devuelve lo que la vista necesita
  return {
    token,
    playlist, setPlaylist,
    favorites, toggleFavorite, setFavorites,
    history, saveToHistory, restoreFromHistory, clearHistory,
    activeView, setActiveView,
    generationSource, setGenerationSource,
    isGenerating, setIsGenerating,
    isSaving,
    exportToSpotify
  };
}