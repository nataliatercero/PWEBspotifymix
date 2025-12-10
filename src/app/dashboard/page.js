'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ArtistWidget from '@/components/widgets/ArtistWidget';
import TrackCard from '@/components/TrackCard';
import { getArtistTopTracks } from '@/lib/spotify'; 

export default function Dashboard() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  
  // Estado de la aplicación
  const [misArtistas, setMisArtistas] = useState([]);
  const [playlist, setPlaylist] = useState([]); // Aquí se guardan las canciones generadas
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem('spotify_token');
    if (!t) router.push('/');
    else setToken(t);
  }, [router]);

  const handleGeneratePlaylist = async () => {
    if (misArtistas.length === 0) return;
    setIsGenerating(true);
    setPlaylist([]); // Limpiar la lista anterior

    try {
      // Pedimos las Top Tracks de CADA artista seleccionado
      const promises = misArtistas.map(artist => getArtistTopTracks(artist.id, token));
      const results = await Promise.all(promises);

      // Juntamos todos los resultados en una sola lista (flat)
      let allTracks = results.flat();

      // Mezclamos aleatoriamente para que no salgan por orden de artista
      allTracks = allTracks.sort(() => Math.random() - 0.5);

      // Guardamos en el estado
      setPlaylist(allTracks);
    } catch (error) {
      console.error("Error generando playlist:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Función para borrar una canción individual
  const removeTrack = (trackId) => {
    setPlaylist(playlist.filter(t => t.id !== trackId));
  };

  if (!token) return null;

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8">
      <header className="mb-10 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-green-500">Spotify Taste Mixer</h1>
        <p className="text-gray-400">Configura tus preferencias</p>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        
        <div className="space-y-6">
          <ArtistWidget 
            token={token} 
            onSelectionChange={setMisArtistas} 
          />
        </div>

        <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 h-fit sticky top-8 flex flex-col max-h-[80vh]">
          <div className="mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              Tu Mezcla 💿
              {playlist.length > 0 && <span className="text-sm bg-neutral-700 px-2 py-1 rounded text-gray-300">{playlist.length} canciones</span>}
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {misArtistas.length === 0 ? 'Selecciona artistas para empezar' : `Basado en ${misArtistas.length} artistas seleccionados`}
            </p>
          </div>
          
          <button 
            onClick={handleGeneratePlaylist}
            disabled={misArtistas.length === 0 || isGenerating}
            className="w-full py-3 bg-green-600 text-black font-bold rounded-full hover:bg-green-500 transition disabled:opacity-50 disabled:cursor-not-allowed mb-6 shadow-lg shadow-green-900/20"
          >
            {isGenerating ? 'Mezclando...' : 'Generar Playlist'}
          </button>

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
                />
              ))
            )}
          </div>
        </div>

      </main>
    </div>
  );
}