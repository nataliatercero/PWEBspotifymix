'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ArtistWidget from '@/components/widgets/ArtistWidget';
import GenreWidget from '@/components/widgets/GenreWidget';
import DecadeWidget from '@/components/widgets/DecadeWidget';
import PopularityWidget from '@/components/widgets/PopularityWidget';
import TrackCard from '@/components/TrackCard';
import { getArtistTopTracks, searchTracksByGenre, searchTracksByYear, searchTracksByArtist, getUserProfile, createPlaylist } from '@/lib/spotify'; 

export default function Dashboard() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  
  const [misArtistas, setMisArtistas] = useState([]);
  const [misGeneros, setMisGeneros] = useState([]);
  const [misDecadas, setMisDecadas] = useState([]);
  const [minPopularity, setMinPopularity] = useState(null);
  
  const [resetKey, setResetKey] = useState(0);

  const [playlist, setPlaylist] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [generationSource, setGenerationSource] = useState('filters'); 
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false); 

  useEffect(() => {
    const t = localStorage.getItem('spotify_token');
    if (!t) router.push('/');
    else setToken(t);

    const savedFavs = localStorage.getItem('my_favorites');
    if (savedFavs) setFavorites(JSON.parse(savedFavs));
  }, [router]);

  const toggleFavorite = (track) => {
    const isAlreadyFav = favorites.some(f => f.id === track.id);
    let newFavs;
    if (isAlreadyFav) newFavs = favorites.filter(f => f.id !== track.id);
    else newFavs = [...favorites, track];
    setFavorites(newFavs);
    localStorage.setItem('my_favorites', JSON.stringify(newFavs));
  };

  const handleClearFilters = () => {
    setMisArtistas([]);
    setMisGeneros([]);
    setMisDecadas([]);
    setMinPopularity(null);
    setResetKey(prev => prev + 1); 
    setPlaylist([]); 
    setShowFavorites(false);
    setGenerationSource('filters');
  };

  const fetchTracksFromFilters = async () => {
    let promises = [];

    if (misArtistas.length > 0) promises.push(...misArtistas.map(a => getArtistTopTracks(a.id, token)));
    if (misGeneros.length > 0) promises.push(...misGeneros.map(g => searchTracksByGenre(g, token)));
    if (misDecadas.length > 0) promises.push(...misDecadas.map(d => searchTracksByYear(d, token)));

    if (promises.length === 0 && minPopularity !== null) {
        promises.push(searchTracksByYear('2023-2024', token));
    }

    // Filtramos resultados nulos por si alguna petición falló
    const results = await Promise.all(promises);
    let allTracks = results.filter(r => r !== null).flat();

    if (minPopularity !== null) {
        const threshold = minPopularity; 
        allTracks = allTracks.filter(track => {
            if (threshold > 70) return track.popularity >= 50;
            if (threshold < 30) return track.popularity <= 60;
            return true;
        });
        if (allTracks.length < 1) allTracks = results.flat();
    }
    return allTracks;
  };

  const fetchTracksFromFavorites = async () => {
    if (favorites.length === 0) return [];
    
    // 1. Obtenemos nombres de artistas de los favoritos
    const artistNames = favorites.map(t => t.artists[0].name);
    const uniqueNames = [...new Set(artistNames)];
    
    // 2. Elegimos 5 al azar
    const shuffledNames = uniqueNames.sort(() => 0.5 - Math.random()).slice(0, 5);
    
    // 3. Usamos la búsqueda por nombre (permite offset aleatorio para dar variedad)
    const promises = shuffledNames.map(name => searchTracksByArtist(name, token));
    
    const results = await Promise.all(promises);
    return results.filter(r => r !== null).flat();
  };

  const fetchTracksBasedOnMode = async () => {
    if (generationSource === 'favorites') {
        return await fetchTracksFromFavorites();
    } else {
        return await fetchTracksFromFilters();
    }
  };

  const handleGenerateFromFilters = async () => {
    setGenerationSource('filters');
    setShowFavorites(false);
    setIsGenerating(true);
    setPlaylist([]); 

    try {
      const tracks = await fetchTracksFromFilters();
      const uniqueTracks = Array.from(new Map(tracks.map(t => [t.id, t])).values());
      const shuffled = uniqueTracks.sort(() => Math.random() - 0.5);
      setPlaylist(shuffled);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDiscoverFromFavorites = async () => {
    if (favorites.length === 0) return;
    
    setGenerationSource('favorites');
    setIsGenerating(true);
    // No borramos playlist inmediatamente
    
    try {
      const tracks = await fetchTracksFromFavorites();
      const uniqueTracks = Array.from(new Map(tracks.map(t => [t.id, t])).values());
      const shuffled = uniqueTracks.sort(() => Math.random() - 0.5);
      
      if (shuffled.length > 0) {
          setPlaylist(shuffled);
          setShowFavorites(false);
      } else {
          alert("No pudimos encontrar canciones similares. Intenta añadir más favoritos variados.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    setIsGenerating(true);
    setPlaylist([]);
    try {
      const tracks = await fetchTracksBasedOnMode();
      const uniqueTracks = Array.from(new Map(tracks.map(t => [t.id, t])).values());
      const shuffled = uniqueTracks.sort(() => Math.random() - 0.5);
      setPlaylist(shuffled);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddMore = async () => {
    setIsGenerating(true);
    try {
      const newTracks = await fetchTracksBasedOnMode();
      
      const combined = [...playlist, ...newTracks];
      const uniqueTracks = Array.from(new Map(combined.map(t => [t.id, t])).values());
      
      setPlaylist(uniqueTracks);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const currentTracks = showFavorites ? favorites : playlist;

  const handleExportToSpotify = async () => {
    if (currentTracks.length === 0) return;
    setIsSaving(true);
    try {
      const user = await getUserProfile(token);
      if (!user || !user.id) {
        alert('Error: No se pudo identificar al usuario');
        return;
      }
      
      const trackUris = currentTracks.map(t => t.uri);
      
      const playlistName = showFavorites 
        ? `Mis Favoritos Taste Mixer ❤️`
        : (generationSource === 'favorites' ? `Mix: Basado en mis Favoritos` : `Mix: ${misArtistas.map(a => a.name).join(', ')} y más`);

      const result = await createPlaylist(user.id, playlistName.substring(0, 50), trackUris, token);
      
      if (result) alert('¡Playlist guardada en tu Spotify con éxito');
      else alert('Hubo un error al guardar la playlist.');
    } catch (error) {
      console.error(error);
      alert('Error de conexión');
    } finally {
      setIsSaving(false);
    }
  };

  const removeTrack = (trackId) => {
    if (showFavorites) {
        const trackToRemove = favorites.find(t => t.id === trackId);
        if (trackToRemove) toggleFavorite(trackToRemove);
    } else {
        setPlaylist(playlist.filter(t => t.id !== trackId));
    }
  };

  if (!token) return null;

  const canGenerateFilters = misArtistas.length > 0 || misGeneros.length > 0 || misDecadas.length > 0 || minPopularity !== null;

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8">
      <header className="mb-10 max-w-6xl mx-auto flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-green-500">Spotify Taste Mixer</h1>
          <p className="text-gray-400">Configura tus preferencias</p>
        </div>
        
        <div 
            onClick={() => setShowFavorites(!showFavorites)}
            className={`text-right cursor-pointer p-2 rounded transition ${showFavorites ? 'bg-green-900/30 ring-1 ring-green-500' : 'hover:bg-neutral-800'}`}
        >
           <span className="text-2xl">❤️ {favorites.length}</span>
           <p className="text-xs text-gray-500">{showFavorites ? 'Ocultar Favoritos' : 'Ver Favoritos'}</p>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        
        <div className="space-y-6">
          <div className="flex justify-between items-center">
             <h2 className="text-gray-300 font-bold">Tus Filtros</h2>
             <button 
               onClick={handleClearFilters}
               className="text-xs text-red-400 hover:text-red-300 bg-red-900/20 px-3 py-1 rounded transition"
             >
               Borrar filtros
             </button>
          </div>

          <div key={resetKey} className="space-y-6">
            <ArtistWidget token={token} onSelectionChange={setMisArtistas} />
            <GenreWidget onSelectionChange={setMisGeneros} />
            <DecadeWidget onSelectionChange={setMisDecadas} />
            <PopularityWidget onSelectionChange={setMinPopularity} />
          </div>
        </div>

        <div className={`p-6 rounded-xl border h-fit sticky top-8 flex flex-col max-h-[80vh] transition-colors ${showFavorites ? 'bg-neutral-900 border-green-900/50' : 'bg-neutral-900 border-neutral-800'}`}>
          <div className="mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {showFavorites ? 'Tus Favoritos ❤️' : (generationSource === 'favorites' ? 'Mix de Favoritos 💎' : 'Tu Mezcla 💿')}
              {currentTracks.length > 0 && <span className="text-sm bg-neutral-700 px-2 py-1 rounded text-gray-300">{currentTracks.length} canciones</span>}
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {showFavorites 
                ? 'Genera recomendaciones basadas en los artistas de tus favoritos' 
                : (generationSource === 'favorites' ? 'Canciones inspiradas en tus favoritos' : (playlist.length === 0 ? 'Genera una lista para empezar' : 'Exporta el resultado a tu app de Spotify'))}
            </p>
          </div>
          
          {!showFavorites && (
            <div className="flex gap-2 mb-6">
                {playlist.length === 0 ? (
                <button 
                    onClick={handleGenerateFromFilters}
                    disabled={!canGenerateFilters || isGenerating}
                    className="w-full py-3 bg-green-600 text-black font-bold rounded-full hover:bg-green-500 transition disabled:opacity-50 shadow-lg shadow-green-900/20"
                >
                    {isGenerating ? 'Creando...' : 'Generar Playlist'}
                </button>
                ) : (
                <>
                    <button 
                    onClick={handleRegenerate}
                    disabled={isGenerating}
                    className="flex-1 py-3 bg-neutral-700 text-white font-bold rounded-lg hover:bg-neutral-600 transition disabled:opacity-50 text-sm"
                    >
                    Regenerar
                    </button>
                    <button 
                    onClick={handleAddMore}
                    disabled={isGenerating}
                    className="flex-1 py-3 bg-neutral-600 text-white font-bold rounded-lg hover:bg-neutral-500 transition disabled:opacity-50 text-sm"
                    >
                    Añadir más
                    </button>
                </>
                )}
            </div>
          )}

          {showFavorites && favorites.length > 0 && (
            <button 
                onClick={handleDiscoverFromFavorites}
                disabled={isGenerating}
                className="w-full mb-6 py-3 bg-purple-600 text-white font-bold rounded-full hover:bg-purple-500 transition disabled:opacity-50 shadow-lg shadow-purple-900/20"
            >
                {isGenerating ? 'Analizando gustos...' : '🔮 Descubrir similares'}
            </button>
          )}

          {currentTracks.length > 0 && (
            <button 
              onClick={handleExportToSpotify}
              disabled={isSaving}
              className={`w-full mb-6 py-3 font-bold rounded-full transition disabled:opacity-50 border ${showFavorites ? 'bg-green-900 text-green-100 border-green-600 hover:bg-green-800' : 'bg-green-800 text-green-100 border-green-700 hover:bg-green-700'}`}
            >
              {isSaving ? 'Guardando...' : (showFavorites ? 'Guardar Favoritos en Spotify' : 'Guardar en Spotify')}
            </button>
          )}

          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {currentTracks.length === 0 && !isGenerating ? (
              <div className="text-center text-gray-600 py-10">
                <p>{showFavorites ? 'Aún no tienes favoritos' : 'Configura tus filtros y dale a Generar'}</p>
              </div>
            ) : (
              currentTracks.map(track => (
                <TrackCard 
                  key={track.id} 
                  track={track} 
                  onRemove={removeTrack}
                  isFavorite={favorites.some(f => f.id === track.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}