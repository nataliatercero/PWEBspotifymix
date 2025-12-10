'use client';
import { loginWithSpotify } from '@/lib/auth';

export default function Home() {
  return (
    <main className="p-10">
      <header className="mb-10">
        <h1 className="text-4xl font-bold mb-4">Spotify Taste Mixer</h1>
        <p className="text-lg text-gray-600">
          Mezcla tus gustos musicales de Spotify en listas de reproducción.
        </p>
      </header>

      <div className="border p-6 rounded-lg shadow-md bg-white text-black">
        <h2 className="text-2xl font-semibold mb-4">Bienvenido</h2>
        <p className="mb-6">
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
