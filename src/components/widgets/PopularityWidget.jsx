'use client';

import { useState } from 'react';

export default function PopularityWidget({ onSelectionChange }) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [value, setValue] = useState(50);

  // Alternar estado activo del filtro
  const handleToggle = (e) => {
    const checked = e.target.checked;
    setIsEnabled(checked);
    onSelectionChange(checked ? value : null);
  };

  // Actualizar valor del slider
  const handleChange = (e) => {
    const val = parseInt(e.target.value);
    setValue(val);
    if (isEnabled) {
      onSelectionChange(val);
    }
  };

  return (
    <div className={`p-6 rounded-xl border transition ${isEnabled ? 'bg-neutral-800 border-neutral-700' : 'bg-neutral-900 border-neutral-800 opacity-75'}`}>
      
      {/* Cabecera con checkbox */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <input 
            type="checkbox" 
            checked={isEnabled} 
            onChange={handleToggle}
            className="w-5 h-5 accent-green-500 rounded cursor-pointer"
          />
          <h3 className="text-xl font-bold text-white">4. Popularidad 🌟</h3>
        </div>
        {isEnabled && <span className="text-green-400 font-mono text-xl">{value}%</span>}
      </div>
      
      <p className="text-xs text-gray-400 mb-6">
        {isEnabled ? '0 = Underground / 100 = Super Hits' : 'Filtro desactivado (Todas las canciones)'}
      </p>
      
      {/* Slider de rango */}
      <input 
        type="range" 
        min="0" 
        max="100" 
        value={value} 
        onChange={handleChange}
        disabled={!isEnabled}
        className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${isEnabled ? 'bg-neutral-600 accent-green-500 hover:accent-green-400' : 'bg-neutral-800'}`}
      />
      
      {isEnabled && (
        <div className="flex justify-between text-xs text-gray-500 mt-2 font-bold">
          <span>Underground</span>
          <span>Mainstream</span>
        </div>
      )}
    </div>
  );
}