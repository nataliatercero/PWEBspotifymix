'use client';

import { useState } from 'react';

const GENRES = [
  'pop', 'rock', 'hip-hop', 'indie', 'alternative', 'dance', 
  'electronic', 'latin', 'reggaeton', 'k-pop', 'metal', 
  'r-n-b', 'jazz', 'classical', 'country', 'punk', 'soul'
];

export default function GenreWidget({ onSelectionChange }) {
  const [selected, setSelected] = useState([]);

  const toggleGenre = (genre) => {
    let newSelection;
    if (selected.includes(genre)) {
      newSelection = selected.filter(g => g !== genre);
    } else {
      if (selected.length >= 5) return; // Límite de 5 géneros
      newSelection = [...selected, genre];
    }
    setSelected(newSelection);
    onSelectionChange(newSelection);
  };

  return (
    <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700">
      <h3 className="text-xl font-bold text-white mb-4">2. Elige Géneros 🎸</h3>
      <p className="text-xs text-gray-400 mb-4">Selecciona hasta 5 estilos</p>
      
      <div className="flex flex-wrap gap-2">
        {GENRES.map(genre => (
          <button
            key={genre}
            onClick={() => toggleGenre(genre)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition capitalize ${
              selected.includes(genre)
                ? 'bg-green-600 text-white'
                : 'bg-neutral-700 text-gray-300 hover:bg-neutral-600'
            }`}
          >
            {genre}
          </button>
        ))}
      </div>
    </div>
  );
}