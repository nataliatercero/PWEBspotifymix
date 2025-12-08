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
        <a
          href="/auth/login"
          className="inline-block bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition"
        >
          Conectar con Spotify
        </a>
      </div>
    </main>
  );
}
