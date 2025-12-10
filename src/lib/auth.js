export const loginWithSpotify = () => {
    const scopes = [
        'user-read-private',
        'user-top-read',
        'playlist-modify-public',
        'playlist-modify-private',
    ].join(' ');
     
    const state = Math.random().toString(36).substring(7);
    if (typeof window !== 'undefined') {
        sessionStorage.setItem('spotify_auth_state', state);
    }

    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI;
    const url = `https://accounts.spotify.com/authorize?client_id=${encodeURIComponent(clientId)}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=${encodeURIComponent(state)}`;

    window.location.href = url;
};