'use client';

import { useState } from 'react';

// Configuración de los estados de ánimo disponibles
const MOODS = [
  { id: 'happy', label: 'Happy', color: 'bg-yellow-600' },
  { id: 'sad', label: 'Sad', color: 'bg-blue-800' },
  { id: 'energetic', label: 'Energetic', color: 'bg-orange-600' },
  { id: 'calm', label: 'Calm', color: 'bg-teal-700' },
];

export default function MoodWidget({ onMoodChange, onEnergyChange }) {
  const [selectedMood, setSelectedMood] = useState(null);
  const [energy, setEnergy] = useState(50);

  // Manejador para alternar la selección del mood
  const handleMoodClick = (moodId) => {
    const newValue = selectedMood === moodId ? null : moodId;
    setSelectedMood(newValue);
    onMoodChange(newValue);
  };

  // Manejador del slider de energía
  const handleEnergyChange = (e) => {
    const val = parseInt(e.target.value);
    setEnergy(val);
    onEnergyChange(val);
  };

  return (
    <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700">
      <h3 className="text-xl font-bold text-white mb-4">5. Mood & Energía 🔋</h3>
      <p className="text-xs text-gray-400 mb-2">¿Cómo te sientes?</p>
      
      {/* Botones de selección de mood */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        {MOODS.map(mood => (
          <button
            key={mood.id}
            onClick={() => handleMoodClick(mood.id)}
            className={`p-2 rounded-lg text-sm font-bold transition ${
              selectedMood === mood.id 
                ? `${mood.color} text-white scale-105 shadow-lg` 
                : 'bg-neutral-700 text-gray-300 hover:bg-neutral-600'
            }`}
          >
            {mood.label}
          </button>
        ))}
      </div>

      {/* Control deslizante de energía */}
      <div className="flex justify-between items-center mb-2">
        <p className="text-xs text-gray-400">Nivel de Energía</p>
        <span className="text-green-400 font-mono text-sm">{energy}%</span>
      </div>
      
      <input 
        type="range" 
        min="0" 
        max="100" 
        value={energy} 
        onChange={handleEnergyChange}
        className="w-full h-2 bg-neutral-600 rounded-lg appearance-none cursor-pointer accent-green-500 hover:accent-green-400"
      />
      <div className="flex justify-between text-[10px] text-gray-500 mt-1 font-bold uppercase">
        <span>Chill / Acoustic</span>
        <span>Fiesta / Gym</span>
      </div>
    </div>
  );
}