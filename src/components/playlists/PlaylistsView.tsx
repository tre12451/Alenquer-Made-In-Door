import React, { useState } from 'react';
import {
  ListVideo,
  Plus,
  Play,
  ArrowUp,
  ArrowDown,
  Trash2,
  Copy,
  Clock,
  Volume2,
  VolumeX,
  Eye,
  Sliders,
  Sparkles,
  Tv,
  CheckCircle2,
  X,
  Layers,
} from 'lucide-react';
import { useSignage } from '../../context/SignageContext';
import { Playlist, PlaylistItem, MediaItem, TransitionType } from '../../types';

export const PlaylistsView: React.FC = () => {
  const {
    playlists,
    media,
    addPlaylist,
    updatePlaylist,
    duplicatePlaylist,
    deletePlaylist,
    openPlayer,
    previewPlaylist,
    setPreviewPlaylist,
    isCreatePlaylistOpen,
    setIsCreatePlaylistOpen,
  } = useSignage();

  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>(playlists[0]?.id || '');
  const [isAddMediaModalOpen, setIsAddMediaModalOpen] = useState(false);

  // New Playlist form state
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');

  const activePlaylist = playlists.find(p => p.id === selectedPlaylistId) || playlists[0];

  const handleCreatePlaylistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `pl-${Date.now()}`;
    addPlaylist({
      id: newId,
      name: newPlaylistName || 'Nova Playlist',
      description: newPlaylistDesc || 'Programação customizada',
      items: activePlaylist?.items?.slice(0, 3) || [],
      totalDurationSeconds: 30,
    });
    setSelectedPlaylistId(newId);
    setIsCreatePlaylistOpen(false);
    setNewPlaylistName('');
    setNewPlaylistDesc('');
  };

  // Reordering inside the active playlist
  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (!activePlaylist) return;
    const newItems = [...activePlaylist.items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    // reindex orders
    newItems.forEach((item, idx) => {
      item.order = idx + 1;
    });

    updatePlaylist(activePlaylist.id, { items: newItems });
  };

  const removeItem = (itemId: string) => {
    if (!activePlaylist) return;
    const newItems = activePlaylist.items.filter(i => i.id !== itemId);
    const totalDuration = newItems.reduce((acc, curr) => acc + (curr.customDurationSeconds || 10), 0);
    updatePlaylist(activePlaylist.id, { items: newItems, totalDurationSeconds: totalDuration });
  };

  const updateItemDuration = (itemId: string, duration: number) => {
    if (!activePlaylist) return;
    const newItems = activePlaylist.items.map(i =>
      i.id === itemId ? { ...i, customDurationSeconds: duration } : i
    );
    const totalDuration = newItems.reduce((acc, curr) => acc + (curr.customDurationSeconds || 10), 0);
    updatePlaylist(activePlaylist.id, { items: newItems, totalDurationSeconds: totalDuration });
  };

  const updateItemTransition = (itemId: string, transition: TransitionType) => {
    if (!activePlaylist) return;
    const newItems = activePlaylist.items.map(i =>
      i.id === itemId ? { ...i, transition } : i
    );
    updatePlaylist(activePlaylist.id, { items: newItems });
  };

  const toggleItemAudio = (itemId: string) => {
    if (!activePlaylist) return;
    const newItems = activePlaylist.items.map(i =>
      i.id === itemId ? { ...i, audioEnabled: !i.audioEnabled } : i
    );
    updatePlaylist(activePlaylist.id, { items: newItems });
  };

  const handleAddMediaToPlaylist = (mediaItem: MediaItem) => {
    if (!activePlaylist) return;
    const newItem: PlaylistItem = {
      id: `pli-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      mediaId: mediaItem.id,
      media: mediaItem,
      order: activePlaylist.items.length + 1,
      customDurationSeconds: mediaItem.durationSeconds || 10,
      audioEnabled: mediaItem.audioEnabled || false,
      transition: mediaItem.transition || 'fade',
    };
    const newItems = [...activePlaylist.items, newItem];
    const totalDuration = newItems.reduce((acc, curr) => acc + (curr.customDurationSeconds || 10), 0);
    updatePlaylist(activePlaylist.id, { items: newItems, totalDurationSeconds: totalDuration });
    setIsAddMediaModalOpen(false);
  };

  return (
    <div id="playlists-view-root" className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-slate-100 font-['Space_Grotesk']">
            Editor de Playlists & Programação
          </h2>
          <p className="text-xs lg:text-sm text-slate-400">
            Organize a sequência das mídias, defina durações, transições e publique instantaneamente
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-create-playlist-trigger"
            onClick={() => setIsCreatePlaylistOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-md shadow-lg shadow-emerald-900/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Criar Nova Playlist</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Playlists List on Left + Interactive Editor on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Playlists Selector */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Playlists Cadastradas ({playlists.length})
          </h3>

          <div className="space-y-2">
            {playlists.map(pl => {
              const isSelected = pl.id === selectedPlaylistId;
              return (
                <div
                  key={pl.id}
                  id={`playlist-tab-${pl.id}`}
                  onClick={() => setSelectedPlaylistId(pl.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-[#18181b] border-slate-600 shadow-md'
                      : 'bg-[#121214] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-100 line-clamp-1">{pl.name}</h4>
                    {pl.isDefault && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold shrink-0 border border-emerald-500/20">
                        PADRÃO
                      </span>
                    )}
                    {pl.isFallback && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 font-semibold shrink-0 border border-amber-500/20">
                        OFFLINE
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2">{pl.description}</p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800">
                    <span className="font-mono">{pl.items?.length || 0} mídias • {pl.totalDurationSeconds}s ciclo</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        id={`btn-duplicate-playlist-${pl.id}`}
                        onClick={e => {
                          e.stopPropagation();
                          duplicatePlaylist(pl.id);
                        }}
                        className="p-1 hover:text-slate-200 transition-colors"
                        title="Duplicar Playlist"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        id={`btn-preview-playlist-${pl.id}`}
                        onClick={e => {
                          e.stopPropagation();
                          setPreviewPlaylist(pl);
                        }}
                        className="p-1 hover:text-emerald-400 transition-colors"
                        title="Prévia Rápida"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Playlist Item Sequencer */}
        <div className="lg:col-span-8 space-y-4">
          {activePlaylist ? (
            <div className="p-6 rounded-xl bg-[#121214] border border-slate-800 space-y-5">
              {/* Top Banner of Selected Playlist */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-100 font-['Space_Grotesk']">
                      {activePlaylist.name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{activePlaylist.description}</p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    id="btn-preview-active-playlist"
                    onClick={() => setPreviewPlaylist(activePlaylist)}
                    className="px-3.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Visualizar</span>
                  </button>

                  <button
                    id="btn-play-active-playlist"
                    onClick={() => openPlayer(undefined, activePlaylist.id)}
                    className="px-4 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-900/20 transition-all cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Abrir no Player</span>
                  </button>
                </div>
              </div>

              {/* Items List Controls */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">
                  Sequência de Reprodução ({activePlaylist.items.length} itens)
                </span>
                <button
                  id="btn-add-media-to-playlist-trigger"
                  onClick={() => setIsAddMediaModalOpen(true)}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Mídia à Sequência</span>
                </button>
              </div>

              {/* Items Order List */}
              <div className="space-y-2.5">
                {activePlaylist.items.map((item, index) => (
                  <div
                    key={item.id}
                    id={`playlist-item-${item.id}`}
                    className="p-3.5 rounded-lg bg-[#0c0c0e] border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                  >
                    {/* Index & Thumbnail & Title */}
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 text-center font-mono font-bold text-xs text-slate-500">
                        {index + 1}
                      </span>
                      <img
                        src={item.media?.thumbnailUrl}
                        alt={item.media?.title}
                        className="w-14 h-10 rounded-md object-cover bg-slate-800 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-100 truncate">
                          {item.media?.title}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span className="uppercase">{item.media?.type}</span>
                          <span>•</span>
                          <span>{item.media?.category}</span>
                        </div>
                      </div>
                    </div>

                    {/* Inline Configs: Duration, Transition, Audio, Move Up/Down */}
                    <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                      {/* Duration Input */}
                      <div className="flex items-center gap-1 bg-[#18181b] px-2 py-1 rounded-md border border-slate-800 text-[11px]">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        <input
                          type="number"
                          min="3"
                          max="120"
                          value={item.customDurationSeconds || 10}
                          onChange={e => updateItemDuration(item.id, Number(e.target.value))}
                          className="w-8 bg-transparent text-slate-100 font-mono font-bold text-center focus:outline-none"
                        />
                        <span className="text-slate-500">s</span>
                      </div>

                      {/* Transition choice */}
                      <select
                        value={item.transition}
                        onChange={e => updateItemTransition(item.id, e.target.value as TransitionType)}
                        className="px-2 py-1 rounded-md bg-[#18181b] border border-slate-800 text-slate-200 text-[11px] focus:outline-none"
                      >
                        <option value="fade">Fade</option>
                        <option value="slide">Slide</option>
                        <option value="zoom">Zoom</option>
                        <option value="kenburns">Ken Burns</option>
                        <option value="dissolve">Dissolve</option>
                        <option value="cut">Corte</option>
                      </select>

                      {/* Audio toggle */}
                      <button
                        onClick={() => toggleItemAudio(item.id)}
                        className={`p-1.5 rounded-md border transition-colors ${
                          item.audioEnabled
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-[#18181b] border-slate-800 text-slate-500 hover:text-slate-300'
                        }`}
                        title={item.audioEnabled ? 'Áudio Ativado' : 'Sem Áudio'}
                      >
                        {item.audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                      </button>

                      {/* Order Up / Down */}
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => moveItem(index, 'up')}
                          disabled={index === 0}
                          className="p-1.5 rounded-md bg-[#18181b] hover:bg-slate-800 text-slate-400 disabled:opacity-30 cursor-pointer"
                          title="Mover para Cima"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveItem(index, 'down')}
                          disabled={index === activePlaylist.items.length - 1}
                          className="p-1.5 rounded-md bg-[#18181b] hover:bg-slate-800 text-slate-400 disabled:opacity-30 cursor-pointer"
                          title="Mover para Baixo"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 rounded-md hover:bg-slate-800 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Remover da Playlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500">Nenhuma playlist selecionada</div>
          )}
        </div>
      </div>

      {/* Add Media to Playlist Modal */}
      {isAddMediaModalOpen && (
        <div
          id="modal-add-media-to-pl-backdrop"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-[#121214] border border-slate-800 rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100">Escolha a mídia para adicionar</h3>
              <button
                onClick={() => setIsAddMediaModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-100 rounded-md hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-2 pr-1">
              {media.map(m => (
                <div
                  key={m.id}
                  onClick={() => handleAddMediaToPlaylist(m)}
                  className="p-2.5 rounded-lg bg-[#0c0c0e] hover:bg-slate-800/60 border border-slate-800 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={m.thumbnailUrl}
                      alt={m.title}
                      className="w-12 h-9 rounded-md object-cover bg-slate-800"
                    />
                    <div>
                      <p className="text-xs font-semibold text-slate-100">{m.title}</p>
                      <p className="text-[10px] text-slate-400">{m.category} • {m.durationSeconds}s</p>
                    </div>
                  </div>
                  <button className="px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs cursor-pointer">
                    Adicionar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Preview Playlist Simulation Modal */}
      {previewPlaylist && (
        <div
          id="modal-playlist-preview-backdrop"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="bg-[#121214] border border-slate-800 rounded-xl max-w-4xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase">Simulação do Player</span>
                <h3 className="text-base font-bold text-slate-100">{previewPlaylist.name}</h3>
              </div>
              <button
                onClick={() => setPreviewPlaylist(null)}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mini Player Stage */}
            <div className="aspect-video bg-black rounded-lg overflow-hidden relative border border-slate-800 flex items-center justify-center">
              {previewPlaylist.items[0]?.media?.type === 'video' ? (
                <video
                  src={previewPlaylist.items[0]?.media?.url}
                  autoPlay
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={previewPlaylist.items[0]?.media?.url}
                  alt="Prévia"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute top-3 right-3 px-2 py-1 rounded bg-black/70 text-[10px] text-white font-mono">
                Item 1 de {previewPlaylist.items.length}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-slate-400">
                <span>{previewPlaylist.items.length} conteúdos programados • Ciclo de {previewPlaylist.totalDurationSeconds}s</span>
              </div>
              <button
                onClick={() => {
                  const pl = previewPlaylist;
                  setPreviewPlaylist(null);
                  openPlayer(undefined, pl.id);
                }}
                className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-900/20"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Abrir em Tela Cheia (Player Real)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Playlist Modal */}
      {isCreatePlaylistOpen && (
        <div
          id="modal-create-playlist-backdrop"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-[#121214] border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100 font-['Space_Grotesk']">
                Nova Playlist de Mídia
              </h3>
              <button
                onClick={() => setIsCreatePlaylistOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-100 rounded-md hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlaylistSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome da Playlist
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Campanha Almoço Gourmet"
                  value={newPlaylistName}
                  onChange={e => setNewPlaylistName(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-[#18181b] border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Descrição
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Sequência de ofertas de carnes e pratos do dia..."
                  value={newPlaylistDesc}
                  onChange={e => setNewPlaylistDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-[#18181b] border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-slate-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatePlaylistOpen(false)}
                  className="px-4 py-2 rounded-md text-xs font-semibold text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md cursor-pointer"
                >
                  Criar Playlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
