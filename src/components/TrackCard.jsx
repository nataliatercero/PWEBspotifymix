'use client';

export default function TrackCard({ track, onRemove, isFavorite, onToggleFavorite }) {
  
  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className={`flex items-center justify-between p-3 rounded hover:bg-neutral-800 transition group ${isFavorite ? 'bg-neutral-800 border border-green-900/30' : 'bg-neutral-900'}`}>
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

      <div className="flex items-center gap-4">
        <button 
          onClick={() => onToggleFavorite(track)}
          className="transition hover:scale-110 focus:outline-none"
          title={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
        >
          {isFavorite ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-green-500">
              <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400 hover:text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
          )}
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