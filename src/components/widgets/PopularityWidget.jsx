'use client';

import { useState } from 'react';

export default function PopularityWidget({ onSelectionChange }) {
  const [value, setValue] = useState(50); // Para empezar en medio
  const handleChange = (e) => {
    const val = parseInt(e.target.value);
    setValue(val);
    onSelectionChange(val);
  };

  return (
    <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white">4. Popularidad 🌟</h3>
        <span className="text-green-400 font-mono text-xl">{value}%</span>
      </div>
      
      <p className="text-xs text-gray-400 mb-6">
        0 = Underground / 100 = Super Hits
      </p>
      
      <input 
        type="range" 
        min="0" 
        max="100" 
        value={value} 
        onChange={handleChange}
        className="w-full h-2 bg-neutral-600 rounded-lg appearance-none cursor-pointer accent-green-500 hover:accent-green-400"
      />
      
      <div className="flex justify-between text-xs text-gray-500 mt-2 font-bold">
        <span>Underground</span>
        <span>Mainstream</span>
      </div>
    </div>
  );
}