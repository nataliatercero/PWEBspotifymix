'use client';

import { useState } from 'react';
import { searchArtists } from '@/lib/spotify';

export default function ArtistWidget({ token, onSelectionChange }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]);

  // Función para buscar cuando le das al botón
  const handleSearch = async () => {
    if (!query) return;
    const artists = await searchArtists(query, token);
    setResults(artists);
  };

  // Función para seleccionar un artista
  const toggleArtist = (artist) => {
    // Evitamos duplicados
    if (selected.find(a => a.id === artist.id)) return;
    
    // Añadimos y avisamos al padre (Dashboard)
    const newSelection = [...selected, artist];
    setSelected(newSelection);
    onSelectionChange(newSelection); 
  };

  // Función para borrar
  const removeArtist = (artistId) => {
    const newSelection = selected.filter(a => a.id !== artistId);
    setSelected(newSelection);
    onSelectionChange(newSelection);
  };

  return (
    <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700">
      <h3 className="text-xl font-bold text-white mb-4">1. Elige tus Artistas 🎤</h3>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Ej: Bad Bunny, Queen..."
          className="flex-1 bg-neutral-900 text-white p-2 rounded border border-neutral-600 focus:border-green-500 outline-none"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button 
          onClick={handleSearch}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-bold"
        >
          Buscar
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {selected.map(artist => (
          <span key={artist.id} className="bg-green-900 text-green-100 px-3 py-1 rounded-full text-sm flex items-center gap-2">
            {artist.name}
            <button onClick={() => removeArtist(artist.id)} className="hover:text-white">×</button>
          </span>
        ))}
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {results.map(artist => (
          <div 
            key={artist.id} 
            onClick={() => toggleArtist(artist)}
            className="flex items-center gap-3 p-2 hover:bg-neutral-700 rounded cursor-pointer transition"
          >
            {artist.images[2] && (
              <img src={artist.images[2].url} alt={artist.name} className="w-10 h-10 rounded-full object-cover" />
            )}
            <p className="text-sm text-gray-200">{artist.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}