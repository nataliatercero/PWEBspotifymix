'use client';

import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import TrackCard from '@/components/TrackCard';

export default function ResultsPanel({
    // Recibimos todo como "props"
    activeView, setActiveView,
    playlist, favorites, history,
    isGenerating, isSaving,
    onGenerate, onRegenerate, onAddMore, onDiscover, onExport,
    onRestoreHistory, onClearHistory,
    onDragEnd, onRemoveTrack, onToggleFavorite, onOpenModal,
    canGenerate
}) {

    // Calculamos qué mostrar
    let tracksToDisplay = [];
    if (activeView === 'favorites') tracksToDisplay = favorites;
    else if (activeView === 'home') tracksToDisplay = playlist;

    // VISTA DE HISTORIAL
    if (activeView === 'history') {
        return (
            <div className="bg-neutral-900 border border-blue-900/30 p-6 rounded-xl h-full flex flex-col max-h-[80vh]">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">📜 Historial <span className="text-sm font-normal text-gray-500">Recientes</span></h2>
                <div className="space-y-3 overflow-y-auto flex-1 pr-2">
                    {history.length === 0 ? <p className="text-gray-500 text-center py-10">Historial vacío.</p> : (
                        history.map((item) => (
                            <div key={item.id} onClick={() => onRestoreHistory(item)} className="bg-neutral-800 p-4 rounded-lg cursor-pointer hover:bg-neutral-700 flex justify-between group border border-transparent hover:border-blue-500/50 transition">
                                <div>
                                    <p className="font-bold text-sm text-white">{item.type}</p>
                                    <p className="text-xs text-gray-400">{item.date} • {item.trackCount} canciones</p>
                                </div>
                                <span className="text-blue-400 text-xs opacity-0 group-hover:opacity-100 transition">Restaurar</span>
                            </div>
                        ))
                    )}
                    {history.length > 0 && <button onClick={onClearHistory} className="text-red-500 text-xs mt-4 underline w-full hover:text-red-400">Borrar Historial</button>}
                </div>
            </div>
        );
    }

    // VISTA DE LISTA (Home y Favoritos)
    return (
        <div className={`p-6 rounded-xl border h-full flex flex-col max-h-[80vh] sticky top-8 transition-colors ${activeView === 'favorites' ? 'bg-neutral-900 border-red-900/30' : 'bg-neutral-900 border-neutral-800'}`}>
            
            <div className="mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    {activeView === 'home' ? '💿 Tu Mezcla' : '❤️ Favoritos'}
                    {tracksToDisplay.length > 0 && <span className="text-sm bg-neutral-700 px-2 py-1 rounded text-gray-300">{tracksToDisplay.length}</span>}
                </h2>
            </div>

            {/* BOTONES */}
            <div className="mb-6 space-y-3">
                {activeView === 'home' && (
                    <>
                        {playlist.length === 0 ? (
                            <button onClick={onGenerate} disabled={!canGenerate || isGenerating} className="w-full py-3 bg-green-600 text-black font-bold rounded-full hover:bg-green-500 disabled:opacity-50 shadow-lg shadow-green-900/20 transition transform hover:scale-[1.02]">
                                {isGenerating ? 'Mezclando...' : 'Generar Playlist'}
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button onClick={onRegenerate} disabled={isGenerating} className="flex-1 py-2 bg-neutral-700 text-white rounded hover:bg-neutral-600 transition">Regenerar</button>
                                <button onClick={onAddMore} disabled={isGenerating} className="flex-1 py-2 bg-neutral-600 text-white rounded hover:bg-neutral-500 transition">Añadir</button>
                            </div>
                        )}
                    </>
                )}

                {activeView === 'favorites' && favorites.length > 0 && (
                     <button onClick={onDiscover} disabled={isGenerating} className="w-full py-3 bg-linear-to-r from-purple-700 to-purple-500 text-white font-bold rounded-full hover:from-purple-600 hover:to-purple-400 shadow-lg shadow-purple-900/20 transition transform hover:scale-[1.02]">
                        {isGenerating ? 'Analizando...' : '🔮 Descubrir Similares'}
                     </button>
                )}

                {tracksToDisplay.length > 0 && (
                    <button onClick={onExport} disabled={isSaving} className="w-full py-2 border border-green-600 text-green-400 font-bold rounded-full hover:bg-green-900/20 transition flex justify-center items-center gap-2">
                        {isSaving ? 'Guardando...' : (
                            <><span>Guardar en Spotify</span></>
                        )}
                    </button>
                )}
            </div>

            {/* LISTA DE CANCIONES */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {tracksToDisplay.length === 0 ? (
                     <div className="text-center py-20 text-gray-600 flex flex-col items-center">
                        <p>{activeView === 'home' ? 'Configura los filtros y pulsa Generar' : 'No tienes favoritos aún'}</p>
                     </div>
                ) : (
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="tracks">
                            {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                                    {tracksToDisplay.map((track, index) => (
                                        <Draggable key={track.id} draggableId={track.id} index={index}>
                                            {(provided, snapshot) => (
                                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} 
                                                     style={{...provided.draggableProps.style, transform: snapshot.isDragging ? provided.draggableProps.style.transform : 'translate(0,0)'}}>
                                                    <TrackCard 
                                                        track={track} 
                                                        onRemove={onRemoveTrack}
                                                        isFavorite={favorites.some(f => f.id === track.id)}
                                                        onToggleFavorite={onToggleFavorite}
                                                        onOpenModal={onOpenModal}
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
        </div>
    );
}