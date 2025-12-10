'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ArtistWidget from '@/components/widgets/ArtistWidget';
import GenreWidget from '@/components/widgets/GenreWidget';
import DecadeWidget from '@/components/widgets/DecadeWidget';
import PopularityWidget from '@/components/widgets/PopularityWidget'; 
import TrackCard from '@/components/TrackCard';
import { getArtistTopTracks, searchTracksByGenre, searchTracksByYear, getUserProfile, createPlaylist } from '@/lib/spotify'; 

export default function Dashboard() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  
  const [misArtistas, setMisArtistas] = useState([]);
  const [misGeneros, setMisGeneros] = useState([]);
  const [misDecadas, setMisDecadas] = useState([]);
  const [minPopularity, setMinPopularity] = useState(50); // Por defecto, 50%
  
  const [playlist, setPlaylist] = useState([]);
  const [favorites, setFavorites] = useState([]);
  
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

  const handleGeneratePlaylist = async () => {
    if (misArtistas.length === 0 && misGeneros.length === 0 && misDecadas.length === 0) return;
    setIsGenerating(true);
    setPlaylist([]);
    try {
      const artistPromises = misArtistas.map(artist => getArtistTopTracks(artist.id, token));
      const genrePromises = misGeneros.map(genre => searchTracksByGenre(genre, token));
      const decadePromises = misDecadas.map(yearRange => searchTracksByYear(yearRange, token));
      const results = await Promise.all([...artistPromises, ...genrePromises, ...decadePromises]);

      let allTracks = results.flat();

      const threshold = minPopularity; 
      allTracks = allTracks.filter(track => {
         if (threshold > 70) return track.popularity >= 50;
         if (threshold < 30) return track.popularity <= 60;
         return true;
      });

      // Si el filtro es muy estricto y nos quedamos sin canciones, devolver todas 
      if (allTracks.length < 5) allTracks = results.flat();

      const uniqueTracks = Array.from(new Map(allTracks.map(t => [t.id, t])).values());
      const shuffled = uniqueTracks.sort(() => Math.random() - 0.5);
      setPlaylist(shuffled);
    } catch (error) {
      console.error("Error generando playlist:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportToSpotify = async () => {
    if (playlist.length === 0) return;
    setIsSaving(true);
    try {
      // 1. Obtener ID del usuario
      const user = await getUserProfile(token);
      if (!user || !user.id) {
        alert('Error: No se pudo identificar al usuario');
        return;
      }

      // 2. Preparar las URIs (identificadores de canciones para Spotify)
      const trackUris = playlist.map(t => t.uri);
      const playlistName = `Mix: ${misArtistas.map(a => a.name).join(', ')} y más`;

      // 3. Crear la playlist
      const result = await createPlaylist(user.id, playlistName.substring(0, 50), trackUris, token);

      if (result) {
        alert('¡Playlist guardada en tu Spotify con éxito');
      } else {
        alert('Hubo un error al guardar la playlist.');
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión');
    } finally {
      setIsSaving(false);
    }
  };

  const removeTrack = (trackId) => {
    setPlaylist(playlist.filter(t => t.id !== trackId));
  };

  if (!token) return null;

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8">
      <header className="mb-10 max-w-6xl mx-auto flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-green-500">Spotify Taste Mixer</h1>
          <p className="text-gray-400">Configura tus preferencias</p>
        </div>
        <div className="text-right">
           <span className="text-2xl">❤️ {favorites.length}</span>
           <p className="text-xs text-gray-500">Favoritos</p>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <div className="space-y-6">
          <ArtistWidget token={token} onSelectionChange={setMisArtistas} />
          <GenreWidget onSelectionChange={setMisGeneros} />
          <DecadeWidget onSelectionChange={setMisDecadas} />
          <PopularityWidget onSelectionChange={setMinPopularity} />
        </div>

        <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 h-fit sticky top-8 flex flex-col max-h-[80vh]">
          <div className="mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              Tu Mezcla 💿
              {playlist.length > 0 && <span className="text-sm bg-neutral-700 px-2 py-1 rounded text-gray-300">{playlist.length} canciones</span>}
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {playlist.length === 0 ? 'Genera una lista para empezar' : `Filtro de popularidad: ${minPopularity}%`}
            </p>
          </div>
          
          <div className="flex gap-2 mb-6">
            <button 
              onClick={handleGeneratePlaylist}
              disabled={misArtistas.length === 0 && misGeneros.length === 0 && misDecadas.length === 0 || isGenerating}
              className="flex-1 py-3 bg-neutral-700 text-white font-bold rounded-full hover:bg-neutral-600 transition disabled:opacity-50"
            >
              {isGenerating ? 'Mezclando...' : 'Generar nueva Playlist'}
            </button>
            
            <button 
              onClick={handleExportToSpotify}
              disabled={playlist.length === 0 || isSaving}
              className="flex-1 py-3 bg-green-600 text-black font-bold rounded-full hover:bg-green-500 transition disabled:opacity-50 shadow-lg shadow-green-900/20"
            >
              {isSaving ? 'Guardando...' : 'Guardar en Spotify'}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {playlist.length === 0 && !isGenerating ? (
              <div className="text-center text-gray-600 py-10">
                <p>Tu playlist aparecerá aquí</p>
              </div>
            ) : (
              playlist.map(track => (
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