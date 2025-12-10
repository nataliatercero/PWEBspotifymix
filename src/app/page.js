'use client';

import { loginWithSpotify } from '@/lib/auth';

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-black text-white p-6 overflow-hidden">
      
      <div className="absolute top-[-20%] left-0 w-full h-[800px] bg-green-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-0 w-full h-[600px] bg-green-900/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="z-10 w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-700">
        
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-neutral-900 rounded-full border border-neutral-800 shadow-2xl mb-4">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-green-500">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
          </div>
          
          <h1 className="text-5xl font-black tracking-tight">
            Taste <span className="text-green-500">Mixer</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Crea la playlist perfecta combinando épocas, estilos y tu estado de ánimo.
          </p>
        </div>

        <div className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 p-8 rounded-3xl shadow-2xl">
          <ul className="space-y-4 mb-8 text-gray-300">
            <li className="flex items-center gap-3">
              <span className="bg-green-500/10 text-green-500 p-1 rounded-md">🎵</span>
              <span>Mezcla tus <strong>artistas y géneros</strong> favoritos</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="bg-purple-500/10 text-purple-400 p-1 rounded-md">⏳</span>
              <span>Viaja en el tiempo filtrando por <strong>décadas</strong></span>
            </li>
            <li className="flex items-center gap-3">
              <span className="bg-orange-500/10 text-orange-400 p-1 rounded-md">⚡</span>
              <span>Ajusta la <strong>energía y el mood</strong></span>
            </li>
            <li className="flex items-center gap-3">
              <span className="bg-blue-500/10 text-blue-400 p-1 rounded-md">💾</span>
              <span>Guarda el resultado en tu <strong>Spotify</strong></span>
            </li>
          </ul>

          <button
            onClick={loginWithSpotify}
            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-lg font-bold rounded-full text-black bg-[#1DB954] hover:bg-[#1ed760] transition-all hover:scale-105 shadow-[0_0_20px_rgba(29,185,84,0.3)]"
          >
            Conectar con Spotify
            <span className="absolute right-6 opacity-0 group-hover:opacity-100 transition-opacity"></span>
          </button>
          
          <p className="text-center text-xs text-neutral-500 mt-4">
            Uso seguro mediante autenticación oficial de Spotify.
          </p>
        </div>

      </div>
    </main>
  );
}