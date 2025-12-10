'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ArtistWidget from '@/components/widgets/ArtistWidget';
import GenreWidget from '@/components/widgets/GenreWidget'; 
import TrackCard from '@/components/TrackCard';
import { getArtistTopTracks, searchTracksByGenre } from '@/lib/spotify'; 

export default function Dashboard() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  
  const [misArtistas, setMisArtistas] = useState([]);
  const [misGeneros, setMisGeneros] = useState([]); 
  const [playlist, setPlaylist] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem('spotify_token');
    if (!t) router.push('/');
    else setToken(t);
  }, [router]);

  const handleGeneratePlaylist = async () => {
    // Validamos que haya al menos algo seleccionado
    if (misArtistas.length === 0 && misGeneros.length === 0) return;
    
    setIsGenerating(true);
    setPlaylist([]);

    try {
      // Peticiones de Artistas
      const artistPromises = misArtistas.map(artist => getArtistTopTracks(artist.id, token));
      
      // Peticiones de Géneros 
      const genrePromises = misGeneros.map(genre => searchTracksByGenre(genre, token));

      // Ejecutamos todo a la vez
      const results = await Promise.all([...artistPromises, ...genrePromises]);

      // Aplanamos y mezclamos
      let allTracks = results.flat();
      
      // Eliminamos duplicados por ID (importante al mezclar fuentes)
      const uniqueTracks = Array.from(new Map(allTracks.map(t => [t.id, t])).values());
      
      // Shuffle
      const shuffled = uniqueTracks.sort(() => Math.random() - 0.5);

      setPlaylist(shuffled);
    } catch (error) {
      console.error("Error generando playlist:", error);
    } finally {
      setIsGenerating(false);
    }
  };

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
          
          <GenreWidget 
            onSelectionChange={setMisGeneros}
          />
        </div>

        <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 h-fit sticky top-8 flex flex-col max-h-[80vh]">
          <div className="mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              Tu Mezcla 💿
              {playlist.length > 0 && <span className="text-sm bg-neutral-700 px-2 py-1 rounded text-gray-300">{playlist.length} canciones</span>}
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {misArtistas.length + misGeneros.length === 0 
                ? 'Selecciona artistas o géneros para empezar' 
                : `Mezclando ${misArtistas.length} artistas y ${misGeneros.length} géneros`}
            </p>
          </div>
          
          <button 
            onClick={handleGeneratePlaylist}
            disabled={misArtistas.length === 0 && misGeneros.length === 0 || isGenerating}
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