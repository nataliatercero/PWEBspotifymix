// URL base de la API (Proxy)
const API_URL = 'https://api.spotify.com/v1';

// Función genérica para peticiones a la API
async function fetchSpotify(endpoint, token, options = {}) {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      ...options,
    });

    if (res.status === 401) return null;
    if (!res.ok) {
        // Ignorar errores 404 específicos de recomendaciones
        if (res.status !== 404) console.error(`Error API (${endpoint}):`, res.status);
        return null;
    }
    return await res.json();
  } catch (error) {
    console.error("Error de red:", error);
    return null;
  }
}

// Buscar artistas por nombre
export async function searchArtists(query, token) {
  if (!query) return [];
  const data = await fetchSpotify(`/search?type=artist&q=${encodeURIComponent(query)}&limit=5`, token);
  return data?.artists?.items || [];
}

// Obtener canciones top de un artista
export async function getArtistTopTracks(artistId, token) {
  const data = await fetchSpotify(`/artists/${artistId}/top-tracks?market=ES`, token);
  return data?.tracks || [];
}

// Buscar canciones por género
export async function searchTracksByGenre(genre, token) {
  const offset = Math.floor(Math.random() * 20); 
  const data = await fetchSpotify(`/search?type=track&q=genre:${encodeURIComponent(genre)}&limit=10&offset=${offset}`, token);
  return data?.tracks?.items || [];
}

// Buscar canciones por rango de años
export async function searchTracksByYear(yearRange, token) {
  const offset = Math.floor(Math.random() * 20);
  const data = await fetchSpotify(`/search?type=track&q=year:${yearRange}&limit=10&offset=${offset}`, token);
  return data?.tracks?.items || [];
}

// Buscar canciones por nombre de artista
export async function searchTracksByArtist(artistName, token) {
  const offset = Math.floor(Math.random() * 20);
  const data = await fetchSpotify(`/search?type=track&q=artist:${encodeURIComponent(artistName)}&limit=10&offset=${offset}`, token);
  return data?.tracks?.items || [];
}

// Buscar canciones por estado de ánimo y energía
export async function searchTracksByMood(mood, energyLevel, token) {
  let queryTerm = mood || '';
  
  // Traducir energía a palabras clave
  if (energyLevel > 80) queryTerm += ' party dance high energy';
  else if (energyLevel > 60) queryTerm += ' upbeat';
  else if (energyLevel < 20) queryTerm += ' sleep acoustic calm';
  else if (energyLevel < 40) queryTerm += ' chill relaxed';

  const offset = Math.floor(Math.random() * 20);
  const data = await fetchSpotify(`/search?type=track&q=${encodeURIComponent(queryTerm.trim())}&limit=10&offset=${offset}`, token);
  return data?.tracks?.items || [];
}

// Obtener perfil del usuario
export async function getUserProfile(token) {
  return fetchSpotify('/me', token);
}

// Crear playlist y añadir canciones
export async function createPlaylist(userId, name, trackUris, token) {
  try {
    const playlist = await fetchSpotify(`/users/${userId}/playlists`, token, {
      method: 'POST',
      body: JSON.stringify({
        name: name,
        description: 'Creada con Spotify Taste Mixer',
        public: false
      })
    });
    if (!playlist || !playlist.id) return null;

    await fetchSpotify(`/playlists/${playlist.id}/tracks`, token, {
      method: 'POST',
      body: JSON.stringify({ uris: trackUris })
    });
    return playlist;
  } catch (error) {
    return null;
  }
}