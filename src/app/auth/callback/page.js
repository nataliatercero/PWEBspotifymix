'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function CallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get('code');
  
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!code) {
        router.push('/');
        return;
    }

    if (hasFetched.current) return;
    hasFetched.current = true;

    async function getToken() {
        try {
            const response = await fetch('/api/spotify-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('spotify_token', data.access_token);
                localStorage.setItem('spotify_refresh_token', data.refresh_token);
                
                router.push('/dashboard');
            } else {
                console.error('Error al obtener el token');
                router.push('/');
            }
          } catch (error) {
                console.error('Error de red:', error);
                router.push('/');
            }
    }

    getToken();
  }, [code, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-900 text-white">
      <h2 className="text-2xl font-bold mb-6">Conectando con Spotify...</h2>
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
    </div>
  );
}