'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

import ArtistWidget from '@/components/widgets/ArtistWidget';
import GenreWidget from '@/components/widgets/GenreWidget';
import DecadeWidget from '@/components/widgets/DecadeWidget';
import PopularityWidget from '@/components/widgets/PopularityWidget';
import MoodWidget from '@/components/widgets/MoodWidget';
import TrackCard from '@/components/TrackCard';
import { getArtistTopTracks, searchTracksByGenre, searchTracksByYear, searchTracksByArtist, searchTracksByMood, getUserProfile, createPlaylist } from '@/lib/spotify'; 

export default function Dashboard() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  
  // Filtros
  const [misArtistas, setMisArtistas] = useState([]);
  const [misGeneros, setMisGeneros] = useState([]);
  const [misDecadas, setMisDecadas] = useState([]);
  const [minPopularity, setMinPopularity] = useState(null);
  const [miMood, setMiMood] = useState(null);
  const [miEnergia, setMiEnergia] = useState(50);
  
  const [resetKey, setResetKey] = useState(0);

  // Datos
  const [playlist, setPlaylist] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]); 
  
  // Vista actual
  const [activeView, setActiveView] = useState('home'); 
  const [generationSource, setGenerationSource] = useState('filters'); 
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false); 

  useEffect(() => {
    const t = localStorage.getItem('spotify_token');
    if (!t) router.push('/');
    else setToken(t);

    const savedFavs = localStorage.getItem('my_favorites');
    if (savedFavs) setFavorites(JSON.parse(savedFavs));

    // Cargar Historial
    const savedHistory = localStorage.getItem('stm_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, [router]);

  // Gestión historial
  const saveToHistory = (tracks, type) => {
    if (tracks.length === 0) return;
    
    const newEntry = {
        id: Date.now(),
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: type === 'favorites' ? 'Basado en Favoritos' : 'Mix de Filtros',
        trackCount: tracks.length,
        tracks: tracks
    };

    // Guardar y listar las últimas 10 listas
    const updatedHistory = [newEntry, ...history].slice(0, 10);
    setHistory(updatedHistory);
    localStorage.setItem('stm_history', JSON.stringify(updatedHistory));
  };

  const restoreFromHistory = (historyItem) => {
    setPlaylist(historyItem.tracks);
    setActiveView('home'); // Volver a la vista principal
    setGenerationSource('history'); // Marcar que viene del historial
  };

  const clearHistory = () => {
    if(!confirm("¿Borrar todo el historial?")) return;
    setHistory([]);
    localStorage.removeItem('stm_history');
  };

  // Favoritos
  const toggleFavorite = (track) => {
    const isAlreadyFav = favorites.some(f => f.id === track.id);
    let newFavs;
    if (isAlreadyFav) newFavs = favorites.filter(f => f.id !== track.id);
    else newFavs = [...favorites, track];
    setFavorites(newFavs);
    localStorage.setItem('my_favorites', JSON.stringify(newFavs));
  };

  const handleClearFilters = () => {
    setMisArtistas([]);
    setMisGeneros([]);
    setMisDecadas([]);
    setMinPopularity(null);
    setMiMood(null);
    setMiEnergia(50);
    setResetKey(prev => prev + 1); 
    setPlaylist([]); 
    setActiveView('home');
    setGenerationSource('filters');
  };

  // Lógica de búsqueda
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
    else return await fetchTracksFromFilters(); // Por defecto, si es history o filters, usa filters para regenerar
  };

  // Botones
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
      saveToHistory(shuffled, 'filters'); // Guardar en historial
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDiscoverFromFavorites = async () => {
    if (favorites.length === 0) return;
    setGenerationSource('favorites');
    setIsGenerating(true);
    
    try {
      const tracks = await fetchTracksFromFavorites();
      const uniqueTracks = Array.from(new Map(tracks.map(t => [t.id, t])).values());
      const shuffled = uniqueTracks.sort(() => Math.random() - 0.5);
      
      if (shuffled.length > 0) {
          setPlaylist(shuffled);
          setActiveView('home'); // Ir a home para ver el resultado
          saveToHistory(shuffled, 'favorites'); // Guardar en historial
      } else {
          alert("No pudimos encontrar canciones similares.");
      }
    } catch (error) {
      console.error(error);
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
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddMore = async () => {
    setIsGenerating(true);
    try {
      const newTracks = await fetchTracksBasedOnMode();
      const combined = [...playlist, ...newTracks];
      const uniqueTracks = Array.from(new Map(combined.map(t => [t.id, t])).values());
      
      setPlaylist(uniqueTracks);
      // No guardamos en historial al añadir más para no saturar, solo al generar/regenerar
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;
    
    if (activeView === 'history') return;

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

  const handleExportToSpotify = async () => {
    const tracksToExport = activeView === 'favorites' ? favorites : playlist;
    if (tracksToExport.length === 0) return;
    
    setIsSaving(true);
    try {
      const user = await getUserProfile(token);
      if (!user || !user.id) {
        alert('Error: No se pudo identificar al usuario');
        return;
      }
      
      const trackUris = tracksToExport.map(t => t.uri);
      const playlistName = activeView === 'favorites'
        ? `Mis Favoritos Taste Mixer ❤️`
        : `Mix Taste Mixer (${new Date().toLocaleDateString()})`;

      const result = await createPlaylist(user.id, playlistName.substring(0, 50), trackUris, token);
      
      if (result) alert('¡Playlist guardada en tu Spotify con éxito');
      else alert('Hubo un error al guardar la playlist.');
    } catch (error) {
      console.error(error);
      alert('Error de conexión');
    } finally {
      setIsSaving(false);
    }
  };

  const removeTrack = (trackId) => {
    if (activeView === 'favorites') {
        const trackToRemove = favorites.find(t => t.id === trackId);
        if (trackToRemove) toggleFavorite(trackToRemove);
    } else if (activeView === 'home') {
        setPlaylist(playlist.filter(t => t.id !== trackId));
    }
  };

  if (!token) return null;

  const canGenerateFilters = 
    misArtistas.length > 0 || misGeneros.length > 0 || misDecadas.length > 0 || 
    minPopularity !== null || miMood !== null || (miEnergia < 30 || miEnergia > 70);

  // Determinar qué lista mostrar
  let tracksToDisplay = [];
  if (activeView === 'favorites') tracksToDisplay = favorites;
  else if (activeView === 'home') tracksToDisplay = playlist;
  
  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8">
      <header className="mb-10 max-w-6xl mx-auto flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-green-500">Spotify Taste Mixer</h1>
          <p className="text-gray-400">Configura tus preferencias</p>
        </div>
        
        <div className="flex gap-4">
            <button 
                onClick={() => setActiveView('home')}
                className={`text-sm font-bold px-3 py-2 rounded transition ${activeView === 'home' ? 'text-green-400 bg-green-900/20' : 'text-gray-400 hover:text-white'}`}
            >
                💿 Tu Mezcla
            </button>
            <button 
                onClick={() => setActiveView('favorites')}
                className={`text-sm font-bold px-3 py-2 rounded transition ${activeView === 'favorites' ? 'text-red-400 bg-red-900/20' : 'text-gray-400 hover:text-white'}`}
            >
                ❤️ Favoritos ({favorites.length})
            </button>
            <button 
                onClick={() => setActiveView('history')}
                className={`text-sm font-bold px-3 py-2 rounded transition ${activeView === 'history' ? 'text-blue-400 bg-blue-900/20' : 'text-gray-400 hover:text-white'}`}
            >
                📜 Historial
            </button>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        
        <div className="space-y-6">
          <div className="flex justify-between items-center">
             <h2 className="text-gray-300 font-bold">Tus Filtros</h2>
             <button 
               onClick={handleClearFilters}
               className="text-xs text-red-400 hover:text-red-300 bg-red-900/20 px-3 py-1 rounded transition"
             >
               Borrar filtros
             </button>
          </div>

          <div key={resetKey} className="space-y-6">
            <ArtistWidget token={token} onSelectionChange={setMisArtistas} />
            <GenreWidget onSelectionChange={setMisGeneros} />
            <DecadeWidget onSelectionChange={setMisDecadas} />
            <PopularityWidget onSelectionChange={setMinPopularity} />
            <MoodWidget onMoodChange={setMiMood} onEnergyChange={setMiEnergia} />
          </div>
        </div>

        <div className={`p-6 rounded-xl border h-fit sticky top-8 flex flex-col max-h-[80vh] transition-colors 
            ${activeView === 'home' ? 'bg-neutral-900 border-neutral-800' : ''}
            ${activeView === 'favorites' ? 'bg-neutral-900 border-red-900/30' : ''}
            ${activeView === 'history' ? 'bg-neutral-900 border-blue-900/30' : ''}
        `}>
          
          <div className="mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {activeView === 'home' && 'Tu Mezcla 💿'}
              {activeView === 'favorites' && 'Tus Favoritos ❤️'}
              {activeView === 'history' && 'Historial de Mezclas 📜'}
              
              {activeView !== 'history' && tracksToDisplay.length > 0 && 
                <span className="text-sm bg-neutral-700 px-2 py-1 rounded text-gray-300">{tracksToDisplay.length} canciones</span>
              }
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {activeView === 'home' && (playlist.length === 0 ? 'Genera una lista para empezar' : 'Aquí tienes tu mezcla personalizada')}
              {activeView === 'favorites' && 'Tus canciones guardadas para siempre'}
              {activeView === 'history' && 'Recupera tus mezclas anteriores'}
            </p>
          </div>
          
          {activeView === 'home' && (
            <>
                <div className="flex gap-2 mb-6">
                    {playlist.length === 0 ? (
                        <button 
                            onClick={handleGenerateFromFilters}
                            disabled={!canGenerateFilters || isGenerating}
                            className="w-full py-3 bg-green-600 text-black font-bold rounded-full hover:bg-green-500 transition disabled:opacity-50 shadow-lg shadow-green-900/20"
                        >
                            {isGenerating ? 'Creando...' : 'Generar Playlist'}
                        </button>
                    ) : (
                        <>
                            <button onClick={handleRegenerate} disabled={isGenerating} className="flex-1 py-3 bg-neutral-700 text-white font-bold rounded-lg hover:bg-neutral-600 text-sm">
                                🔄 Regenerar
                            </button>
                            <button onClick={handleAddMore} disabled={isGenerating} className="flex-1 py-3 bg-neutral-600 text-white font-bold rounded-lg hover:bg-neutral-500 text-sm">
                                ➕ Añadir más
                            </button>
                        </>
                    )}
                </div>
                {playlist.length > 0 && (
                    <button onClick={handleExportToSpotify} disabled={isSaving} className="w-full mb-6 py-3 bg-green-800 text-green-100 font-bold rounded-full hover:bg-green-700 border border-green-700 transition">
                        {isSaving ? 'Guardando...' : '💾 Guardar en Spotify'}
                    </button>
                )}
            </>
          )}

          {activeView === 'favorites' && (
            <>
                {favorites.length > 0 ? (
                    <>
                        <button onClick={handleDiscoverFromFavorites} disabled={isGenerating} className="w-full mb-4 py-3 bg-purple-600 text-white font-bold rounded-full hover:bg-purple-500 shadow-lg shadow-purple-900/20">
                            {isGenerating ? 'Analizando...' : 'Descubrir similares'}
                        </button>
                        <button onClick={handleExportToSpotify} disabled={isSaving} className="w-full mb-6 py-3 bg-green-800 text-green-100 font-bold rounded-full hover:bg-green-700 border border-green-700 transition">
                            {isSaving ? 'Guardando...' : 'Guardar Favoritos'}
                        </button>
                    </>
                ) : (
                    <div className="text-center py-10 text-gray-500">No tienes favoritos aún. Dale al ❤️ en las canciones.</div>
                )}
            </>
          )}

          {activeView === 'history' && (
            <div className="space-y-3 overflow-y-auto flex-1 pr-2">
                {history.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">No hay historial reciente.</div>
                ) : (
                    <>
                        {history.map((item) => (
                            <div key={item.id} onClick={() => restoreFromHistory(item)} className="bg-neutral-800 p-4 rounded-lg flex justify-between items-center cursor-pointer hover:bg-neutral-700 border border-neutral-700 hover:border-blue-500 transition group">
                                <div>
                                    <p className="font-bold text-white text-sm">{item.type}</p>
                                    <p className="text-xs text-gray-400">{item.date} • {item.trackCount} canciones</p>
                                </div>
                                <span className="text-blue-400 text-xs opacity-0 group-hover:opacity-100 transition">Recuperar ↩</span>
                            </div>
                        ))}
                        <button onClick={clearHistory} className="w-full text-xs text-red-500 hover:text-red-400 mt-4 underline">Limpiar historial</button>
                    </>
                )}
            </div>
          )}

          {activeView !== 'history' && (
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {tracksToDisplay.length === 0 && activeView === 'home' && !isGenerating ? (
                    <div className="text-center text-gray-600 py-10"><p>Configura tus filtros y dale a Generar</p></div>
                ) : (
                    <DragDropContext onDragEnd={handleOnDragEnd}>
                        <Droppable droppableId="tracks">
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                            {tracksToDisplay.map((track, index) => (
                                <Draggable key={track.id} draggableId={track.id} index={index}>
                                {(provided) => (
                                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                    <TrackCard 
                                        track={track} 
                                        onRemove={removeTrack}
                                        isFavorite={favorites.some(f => f.id === track.id)}
                                        onToggleFavorite={toggleFavorite}
                                    />
                                    </div>
                                )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                            </div>
                        )}
                        </Droppable>
                    </DragDropContext>
                )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}