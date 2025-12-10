'use client';

export default function TrackCard({ track, onRemove, isFavorite, onToggleFavorite }) {
  
  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className={`flex items-center justify-between p-3 rounded hover:bg-neutral-800 transition group ${isFavorite ? 'bg-neutral-800 border border-green-900' : 'bg-neutral-900'}`}>
      <div className="flex items-center gap-3 overflow-hidden">
        <img 
          src={track.album.images[2]?.url} 
          alt={track.name} 
          className="w-12 h-12 rounded object-cover"
        />
        
        <div className="flex flex-col truncate">
          <span className={`font-semibold truncate ${isFavorite ? 'text-green-400' : 'text-white'}`}>
            {track.name}
          </span>
          <span className="text-xs text-gray-400 truncate">
            {track.artists.map(a => a.name).join(', ')}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={() => onToggleFavorite(track)}
          className="text-xl hover:scale-110 transition"
          title={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>

        <span className="text-xs text-gray-500 font-mono hidden sm:block">
          {formatTime(track.duration_ms)}
        </span>
        
        <button 
          onClick={() => onRemove(track.id)}
          className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition px-2"
        >
          ✕
        </button>
      </div>
    </div>
  );
}