'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [token, setToken] = useState(null);

  useEffect(() => {
    const t = localStorage.getItem('spotify_token');
    if (!t) router.push('/');
    else setToken(t);
  }, [router]);

  if (!token) return null;

  return (
    <div className="p-10 text-white bg-black min-h-screen">
      <h1 className="text-3xl text-green-500 font-bold">¡Dashboard Funciona!</h1>
      <p>Token guardado correctamente.</p>
    </div>
  );
}