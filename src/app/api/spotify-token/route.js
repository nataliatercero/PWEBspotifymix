import { NextResponse } from 'next/server';

export async function POST(request) {
  const { code } = await request.json();
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI;

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
        console.error("Error Spotify:", data);
        return NextResponse.json({ error: data.error_description }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error servidor:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}