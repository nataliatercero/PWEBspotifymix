'use client';

import { useState } from 'react';

// Configuración estática de décadas
const DECADES = [
  { id: '1960-1969', label: '60s' },
  { id: '1970-1979', label: '70s' },
  { id: '1980-1989', label: '80s' },
  { id: '1990-1999', label: '90s' },
  { id: '2000-2009', label: '2000s' },
  { id: '2010-2019', label: '2010s' },
  { id: '2020-2024', label: '2020s' },
];

export default function DecadeWidget({ onSelectionChange }) {
  const [selected, setSelected] = useState([]);

  // Lógica de selección múltiple
  const toggleDecade = (range) => {
    let newSelection;
    if (selected.includes(range)) {
      newSelection = selected.filter(d => d !== range);
    } else {
      newSelection = [...selected, range];
    }
    setSelected(newSelection);
    onSelectionChange(newSelection);
  };

  return (
    <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700">
      <h3 className="text-xl font-bold text-white mb-4">3. Viaje en el tiempo ⏳</h3>
      
      {/* Renderizado de la cuadrícula */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {DECADES.map(decade => (
          <button
            key={decade.id}
            onClick={() => toggleDecade(decade.id)}
            className={`p-3 rounded-lg text-sm font-bold transition border ${
              selected.includes(decade.id)
                ? 'bg-green-600 border-green-500 text-white'
                : 'bg-neutral-900 border-neutral-700 text-gray-400 hover:border-gray-500'
            }`}
          >
            {decade.label}
          </button>
        ))}
      </div>
    </div>
  );
}