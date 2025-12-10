const API_URL = 'https://api.spotify.com/v1';

// Función genérica para hacer peticiones
async function fetchSpotify(endpoint, token) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    // Si el token caduca, aquí se manejará el error
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