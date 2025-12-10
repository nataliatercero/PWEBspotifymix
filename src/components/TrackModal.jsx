'use client';

export default function TrackModal({ track, onClose }) {
  if (!track) return null;

  // Calculamos datos
  const year = track.album.release_date.split('-')[0]; // Sacamos solo el año
  const minutes = Math.floor(track.duration_ms / 60000);
  const seconds = ((track.duration_ms % 60000) / 1000).toFixed(0);
  const duration = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" 
      onClick={onClose} // Cierra si clicas fuera
    >
      <div 
        className="bg-neutral-900 border border-neutral-700 p-6 rounded-2xl max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in duration-200" 
        onClick={e => e.stopPropagation()} // Evita cerrar si clicas dentro
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
        >
          ✕
        </button>
        
        <img 
          src={track.album.images[0]?.url} 
          alt={track.name} 
          className="w-64 h-64 mx-auto rounded-lg shadow-lg mb-6 object-cover" 
        />
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-1 leading-tight">{track.name}</h2>
          <p className="text-green-400 font-medium text-lg">
            {track.artists.map(a => a.name).join(', ')}
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
          <div className="bg-neutral-800 p-3 rounded-lg border border-neutral-700">
            <span className="block text-xs text-gray-500 uppercase font-bold mb-1">Álbum</span>
            <span className="font-semibold truncate block" title={track.album.name}>{track.album.name}</span>
          </div>
          
          <div className="bg-neutral-800 p-3 rounded-lg border border-neutral-700">
            <span className="block text-xs text-gray-500 uppercase font-bold mb-1">Año</span>
            <span className="font-semibold">{year}</span>
          </div>
          
          <div className="bg-neutral-800 p-3 rounded-lg border border-neutral-700">
            <span className="block text-xs text-gray-500 uppercase font-bold mb-1">Duración</span>
            <span className="font-semibold">{duration} min</span>
          </div>
          
          <div className="bg-neutral-800 p-3 rounded-lg border border-neutral-700">
            <span className="block text-xs text-gray-500 uppercase font-bold mb-1">Popularidad</span>
            <div className="w-full bg-neutral-900 h-2 rounded-full mt-1 overflow-hidden">
              <div 
                className="bg-green-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${track.popularity}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}