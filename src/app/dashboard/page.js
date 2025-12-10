'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ArtistWidget from '@/components/widgets/ArtistWidget'; 

export default function Dashboard() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  
  // Estado para guardar lo que elija el usuario
  const [misArtistas, setMisArtistas] = useState([]);

  useEffect(() => {
    const t = localStorage.getItem('spotify_token');
    if (!t) router.push('/');
    else setToken(t);
  }, [router]);

  if (!token) return null;

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8">
      <header className="mb-10 flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-green-500">Spotify Taste Mixer</h1>
            <p className="text-gray-400">Configura tus preferencias</p>
        </div>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        
        <div className="space-y-6">
          <ArtistWidget 
            token={token} 
            onSelectionChange={(artistas) => setMisArtistas(artistas)} 
          />
          
        </div>

        <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 h-fit sticky top-8">
          <h2 className="text-2xl font-bold mb-4">Tu Mezcla 💿</h2>
          <div className="text-gray-400 text-sm mb-4">
            <p>Artistas seleccionados: {misArtistas.length}</p>
            <pre className="mt-2 text-xs bg-black p-2 rounded">
              {JSON.stringify(misArtistas.map(a => a.name), null, 2)}
            </pre>
          </div>
          
          <button className="w-full py-4 bg-green-600 text-black font-bold rounded-full hover:bg-green-500 transition disabled:opacity-50 disabled:cursor-not-allowed">
            Generar Playlist
          </button>
        </div>

      </main>
    </div>
  );
}