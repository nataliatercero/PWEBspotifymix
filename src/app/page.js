'use client';

import { loginWithSpotify } from '@/lib/auth';

export default function Home() {
  return (
    <main className="p-10 flex min-h-screen flex-col items-center justify-center bg-neutral-900 text-white">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-4 text-green-500">Spotify Taste Mixer</h1>
        <p className="text-lg text-gray-300">
          Mezcla tus gustos musicales de Spotify en listas de reproducción.
        </p>
      </header>

      <div className="border p-8 rounded-lg shadow-md bg-white text-black max-w-md w-full">
        <h2 className="text-2xl font-semibold mb-4">Bienvenido</h2>
        <p className="mb-6 text-gray-700">
          Conecta tu cuenta de Spotify para comenzar a mezclar tus gustos
          musicales y descubrir nuevas canciones.
        </p>
        
        <button
          onClick={loginWithSpotify}
          className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded hover:bg-green-700 transition"
        >
          Conectar con Spotify
        </button>
      </div>
    </main>
  );
}