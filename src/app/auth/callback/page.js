'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function CallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get('code');

  useEffect(() => {
    if (!code) {
      router.push('/');
    }
  }, [code, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-900 text-white">
      <h2 className="text-2xl font-bold mb-6">Conectando con Spotify...</h2>
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      <p className="mt-6 text-gray-400 text-sm">Validando credenciales</p>
    </div>
  );
}