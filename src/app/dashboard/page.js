'use client';

import { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';

import { useSpotifyMixer } from '@/hooks/useSpotifyMixer';
import ResultsPanel from '@/components/ResultsPanel';

import ArtistWidget from '@/components/widgets/ArtistWidget';
import GenreWidget from '@/components/widgets/GenreWidget';
import DecadeWidget from '@/components/widgets/DecadeWidget';
import PopularityWidget from '@/components/widgets/PopularityWidget';
import MoodWidget from '@/components/widgets/MoodWidget';
import TrackModal from '@/components/TrackModal';

import { getArtistTopTracks, searchTracksByGenre, searchTracksByYear, searchTracksByArtist, searchTracksByMood } from '@/lib/spotify'; 

export default function Dashboard() {
  const { 
    token, playlist, setPlaylist, favorites, setFavorites, toggleFavorite,
    history, saveToHistory, restoreFromHistory, clearHistory,
    activeView, setActiveView, generationSource, setGenerationSource,
    isGenerating, setIsGenerating, isSaving, exportToSpotify 
  } = useSpotifyMixer();

  const [misArtistas, setMisArtistas] = useState([]);
  const [misGeneros, setMisGeneros] = useState([]);
  const [misDecadas, setMisDecadas] = useState([]);
  const [minPopularity, setMinPopularity] = useState(null);
  const [miMood, setMiMood] = useState(null);
  const [miEnergia, setMiEnergia] = useState(50);
  const [resetKey, setResetKey] = useState(0);
  const [selectedTrack, setSelectedTrack] = useState(null);

  // LÓGICA DE BÚSQUEDA 
  const fetchTracksFromFilters = async () => {
    let promises = [];
    if (misArtistas.length > 0) promises.push(...misArtistas.map(a => getArtistTopTracks(a.id, token)));
    if (misGeneros.length > 0) promises.push(...misGeneros.map(g => searchTracksByGenre(g, token)));
    if (misDecadas.length > 0) promises.push(...misDecadas.map(d => searchTracksByYear(d, token)));

    const energyIsRelevant = miEnergia < 30 || miEnergia > 70;
    if (miMood || energyIsRelevant) {
        promises.push(searchTracksByMood(miMood, miEnergia, token));
    }
    if (promises.length === 0 && minPopularity !== null) {
        promises.push(searchTracksByYear('2023-2024', token));
    }

    const results = await Promise.all(promises);
    let allTracks = results.filter(r => r !== null).flat();

    // Filtro manual de popularidad
    if (minPopularity !== null) {
        const threshold = minPopularity; 
        allTracks = allTracks.filter(track => {
            if (threshold > 70) return track.popularity >= 50;
            if (threshold < 30) return track.popularity <= 60;
            return true;
        });
        if (allTracks.length < 1) allTracks = results.flat();
    }
    return allTracks;
  };

  const fetchTracksFromFavorites = async () => {
    if (favorites.length === 0) return [];
    const artistNames = favorites.map(t => t.artists[0].name);
    const uniqueNames = [...new Set(artistNames)];
    const shuffledNames = uniqueNames.sort(() => 0.5 - Math.random()).slice(0, 5);
    const promises = shuffledNames.map(name => searchTracksByArtist(name, token));
    const results = await Promise.all(promises);
    return results.filter(r => r !== null).flat();
  };

  const fetchTracksBasedOnMode = async () => {
    if (generationSource === 'favorites') return await fetchTracksFromFavorites();
    else return await fetchTracksFromFilters();
  };

  // CONTROLADORES 
  const handleGenerateFromFilters = async () => {
    setGenerationSource('filters');
    setActiveView('home');
    setIsGenerating(true);
    setPlaylist([]); 
    try {
      const tracks = await fetchTracksFromFilters();
      const uniqueTracks = Array.from(new Map(tracks.map(t => [t.id, t])).values());
      const shuffled = uniqueTracks.sort(() => Math.random() - 0.5);
      
      setPlaylist(shuffled);
      saveToHistory(shuffled, 'filters');
      toast.success('¡Mezcla lista!');
    } catch (error) {
      console.error(error);
      toast.error('Error generando');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDiscover = async () => {
    if (favorites.length === 0) return;
    setGenerationSource('favorites');
    setIsGenerating(true);
    try {
      const tracks = await fetchTracksFromFavorites();
      const uniqueTracks = Array.from(new Map(tracks.map(t => [t.id, t])).values());
      const shuffled = uniqueTracks.sort(() => Math.random() - 0.5);
      
      if (shuffled.length > 0) {
          setPlaylist(shuffled);
          setActiveView('home'); 
          saveToHistory(shuffled, 'favorites');
          toast.success('Descubrimientos listos');
      } else {
          toast.error("No se encontraron similares");
      }
    } catch (error) {
        toast.error('Error buscando');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    setIsGenerating(true);
    setPlaylist([]);
    try {
      const tracks = await fetchTracksBasedOnMode();
      const uniqueTracks = Array.from(new Map(tracks.map(t => [t.id, t])).values());
      const shuffled = uniqueTracks.sort(() => Math.random() - 0.5);
      setPlaylist(shuffled);
      saveToHistory(shuffled, generationSource);
      toast.success('Regenerado');
    } catch (error) { toast.error('Error al regenerar'); } 
    finally { setIsGenerating(false); }
  };

  const handleAddMore = async () => {
    setIsGenerating(true);
    try {
      const newTracks = await fetchTracksBasedOnMode();
      const combined = [...playlist, ...newTracks];
      const uniqueTracks = Array.from(new Map(combined.map(t => [t.id, t])).values());
      setPlaylist(uniqueTracks);
      toast.success('Añadido al final');
    } catch (error) { toast.error('Error al añadir'); } 
    finally { setIsGenerating(false); }
  };

  const handleClearFilters = () => {
    setMisArtistas([]); setMisGeneros([]); setMisDecadas([]);
    setMinPopularity(null); setMiMood(null); setMiEnergia(50);
    setResetKey(prev => prev + 1); 
    setPlaylist([]); setActiveView('home'); setGenerationSource('filters');
    toast('Todo limpio');
  };

  // Drag and Drop
  const handleOnDragEnd = (result) => {
    if (!result.destination || activeView === 'history') return;

    const items = Array.from(activeView === 'favorites' ? favorites : playlist);
    
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    if (activeView === 'favorites') {
        setFavorites(items);
        localStorage.setItem('my_favorites', JSON.stringify(items));
    } else {
        setPlaylist(items);
    }
  };

  // Validación visual
  const canGenerate = misArtistas.length > 0 || misGeneros.length > 0 || misDecadas.length > 0 || minPopularity !== null || miMood !== null;

  if (!token) return null;

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8">
      <Toaster position="bottom-center" toastOptions={{ style: { background: '#333', color: '#fff' }}}/>
      <TrackModal track={selectedTrack} onClose={() => setSelectedTrack(null)} />

      {/* HEADER */}
      <header className="mb-10 max-w-7xl mx-auto flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-green-400 to-blue-500">Spotify Taste Mixer</h1>
          <p className="text-gray-400 mt-1">Tu laboratorio musical personal</p>
        </div>
        <div className="bg-neutral-900 p-1 rounded-lg flex gap-1">
            {['home', 'favorites', 'history'].map(view => (
                <button 
                    key={view}
                    onClick={() => setActiveView(view)} 
                    className={`px-4 py-2 rounded-md font-bold text-sm transition capitalize ${activeView === view ? 'bg-neutral-700 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    {view === 'home' ? 'Mezcla' : view === 'favorites' ? 'Favoritos' : 'Historial'}
                </button>
            ))}
        </div>
      </header>

      {/* LAYOUT PRINCIPAL */}
      <main className="grid grid-cols-1 xl:grid-cols-12 gap-8 max-w-7xl mx-auto">
        
        {/* COLUMNA IZQUIERDA (WIDGETS) */}
        <div className="xl:col-span-4 space-y-6">
          <div className="flex justify-between items-end border-b border-neutral-800 pb-2">
             <h2 className="text-gray-300 font-bold uppercase text-xs tracking-wider">Panel de Control</h2>
             <button onClick={handleClearFilters} className="text-xs text-red-400 hover:text-red-300 transition">Resetear</button>
          </div>

          <div key={resetKey} className="space-y-4 animate-in slide-in-from-left duration-500">
            <ArtistWidget token={token} onSelectionChange={setMisArtistas} />
            
            {/* Ahora cada uno ocupa su propia fila y se verán grandes y claros */}
            <GenreWidget onSelectionChange={setMisGeneros} />
            <DecadeWidget onSelectionChange={setMisDecadas} />

            <PopularityWidget onSelectionChange={setMinPopularity} />
            <MoodWidget onMoodChange={setMiMood} onEnergyChange={setMiEnergia} />
        </div>
        </div>

        {/* COLUMNA DERECHA (PANEL DE RESULTADOS) */}
        <div className="xl:col-span-8 animate-in slide-in-from-right duration-500">
            <ResultsPanel 
                // Estados
                activeView={activeView} setActiveView={setActiveView}
                playlist={playlist} favorites={favorites} history={history}
                isGenerating={isGenerating} isSaving={isSaving}
                canGenerate={canGenerate}
                
                // Acciones
                onGenerate={handleGenerateFromFilters}
                onRegenerate={handleRegenerate}
                onAddMore={handleAddMore}
                onDiscover={handleDiscover}
                onExport={exportToSpotify}
                onRestoreHistory={restoreFromHistory}
                onClearHistory={clearHistory}
                
                // Interacciones lista
                onDragEnd={handleOnDragEnd} 
                onRemoveTrack={(id) => {
                    if (activeView === 'home') setPlaylist(playlist.filter(t => t.id !== id));
                    else toggleFavorite({id}); 
                }}
                onToggleFavorite={toggleFavorite}
                onOpenModal={setSelectedTrack}
            />
        </div>
      </main>
    </div>
  );
}