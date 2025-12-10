const API_URL = 'https://api.spotify.com/v1';

// Función genérica para hacer peticiones (actualizada para post)
async function fetchSpotify(endpoint, token, options = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    ...options, // Aquí permite pasar method: 'POST' y body
  });

  if (res.status === 401) return null;

  if (!res.ok) {
      console.error(`Error en fetch a ${endpoint}:`, res.status);
      return null;
  }
  
  return res.json();
}

// 1. Buscar Artistas
export async function searchArtists(query, token) {
  if (!query) return [];
  const data = await fetchSpotify(`/search?type=artist&q=${encodeURIComponent(query)}&limit=5`, token);
  return data?.artists?.items || [];
}

// 2. Obtener Top Tracks de un artista
export async function getArtistTopTracks(artistId, token) {
  const data = await fetchSpotify(`/artists/${artistId}/top-tracks?market=ES`, token);
  return data?.tracks || [];
}

// 3. Buscar tracks por género
export async function searchTracksByGenre(genre, token) {
  // 10 resultados aleatorios
  const offset = Math.floor(Math.random() * 20); 
  const data = await fetchSpotify(`/search?type=track&q=genre:${encodeURIComponent(genre)}&limit=10&offset=${offset}`, token);
  return data?.tracks?.items || [];
}

// 4. Buscar tracks por rango de años
export async function searchTracksByYear(yearRange, token) {
  const offset = Math.floor(Math.random() * 20);
  const data = await fetchSpotify(`/search?type=track&q=year:${yearRange}&limit=10&offset=${offset}`, token);
  return data?.tracks?.items || [];
}

// Obtener perfil del usuario (para saber su ID)
export async function getUserProfile(token) {
  return fetchSpotify('/me', token);
}

// Crear una playlist y añadir canciones
export async function createPlaylist(userId, name, trackUris, token) {
  try {
    // Crear la playlist vacía
    const playlist = await fetchSpotify(`/users/${userId}/playlists`, token, {
      method: 'POST',
      body: JSON.stringify({
        name: name,
        description: 'Creada con Spotify Taste Mixer',
        public: false // Se creará privada por defecto
      })
    });

    if (!playlist || !playlist.id) return null;

    // Añadir las canciones
    await fetchSpotify(`/playlists/${playlist.id}/tracks`, token, {
      method: 'POST',
      body: JSON.stringify({
        uris: trackUris
      })
    });

    return playlist; // Devolver la playlist creada
  } catch (error) {
    console.error("Error creando playlist:", error);
    return null;
  }
}