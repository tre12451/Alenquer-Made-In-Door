import React, { useState } from 'react';
import {
  Film,
  Image as ImageIcon,
  UploadCloud,
  Plus,
  Search,
  Filter,
  Trash2,
  Eye,
  Clock,
  HardDriveDownload,
  Volume2,
  VolumeX,
  Sparkles,
  Link2,
  CheckCircle2,
  X,
  Play,
} from 'lucide-react';
import { useSignage } from '../../context/SignageContext';
import { MediaItem, MediaType, TransitionType } from '../../types';

export const MediaLibraryView: React.FC = () => {
  const { media, addMedia, deleteMedia, isUploadMediaOpen, setIsUploadMediaOpen } = useSignage();

  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);

  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadType, setUploadType] = useState<MediaType>('image');
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadCategory, setUploadCategory] = useState<MediaItem['category']>('Promoção');
  const [uploadDuration, setUploadDuration] = useState(10);
  const [uploadAudio, setUploadAudio] = useState(false);
  const [uploadTransition, setUploadTransition] = useState<TransitionType>('fade');

  // Filtered media list
  const filteredMedia = media.filter(item => {
    if (selectedType !== 'all' && item.type !== selectedType) return false;
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fallbackImage =
      uploadType === 'video'
        ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
        : 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=80';

    addMedia({
      title: uploadTitle || 'Mídia Enviada',
      type: uploadType,
      url: uploadUrl.trim() || fallbackImage,
      thumbnailUrl: uploadType === 'video' ? 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&q=80' : (uploadUrl.trim() || fallbackImage),
      durationSeconds: Number(uploadDuration),
      category: uploadCategory,
      audioEnabled: uploadAudio,
      transition: uploadTransition,
      tags: [uploadCategory, 'Nova Mídia'],
      fileSizeBytes: uploadType === 'video' ? 14500000 : 2200000,
    });

    setIsUploadMediaOpen(false);
    setUploadTitle('');
    setUploadUrl('');
  };

  return (
    <div id="media-library-root" className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-slate-100 font-['Space_Grotesk']">
            Biblioteca de Mídias & Conteúdo
          </h2>
          <p className="text-xs lg:text-sm text-slate-400">
            Gerencie banners, vídeos em 4K, páginas web, feeds RSS e widgets interativos
          </p>
        </div>

        <button
          id="btn-upload-media-trigger"
          onClick={() => setIsUploadMediaOpen(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-md shadow-lg shadow-emerald-900/20 flex items-center gap-2 transition-all cursor-pointer"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Enviar Nova Mídia / URL</span>
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="p-3.5 rounded-xl bg-[#121214] border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'Todas as Mídias' },
            { id: 'image', label: 'Imagens' },
            { id: 'video', label: 'Vídeos' },
            { id: 'rss', label: 'Notícias RSS' },
            { id: 'widget', label: 'Widgets' },
          ].map(type => (
            <button
              key={type.id}
              id={`filter-media-type-${type.id}`}
              onClick={() => setSelectedType(type.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                selectedType === type.id
                  ? 'bg-slate-800 text-slate-100'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            id="select-media-category"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded-md bg-[#18181b] border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-slate-600"
          >
            <option value="all">Todas as Categorias</option>
            <option value="Promoção">Promoção</option>
            <option value="Institucional">Institucional</option>
            <option value="Notícias">Notícias</option>
            <option value="Esportes">Esportes</option>
            <option value="Clima">Clima</option>
            <option value="Entretenimento">Entretenimento</option>
            <option value="Saúde">Saúde</option>
          </select>

          <input
            id="input-search-media"
            type="text"
            placeholder="Buscar mídia..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 rounded-md bg-[#18181b] border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-slate-600 w-full sm:w-48 placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filteredMedia.map(item => (
          <div
            key={item.id}
            id={`media-card-${item.id}`}
            className="rounded-xl bg-[#121214] border border-slate-800 overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between group shadow-sm"
          >
            {/* Thumbnail Box */}
            <div className="relative h-44 bg-slate-950 overflow-hidden">
              <img
                src={item.thumbnailUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Badges */}
              <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-slate-200 font-semibold text-[10px] uppercase">
                  {item.type}
                </span>
                <span className="px-2 py-0.5 rounded bg-[#0c0c0e]/90 border border-slate-700/60 text-slate-300 font-medium text-[10px]">
                  {item.category}
                </span>
              </div>

              {/* Duration & Audio Badge */}
              <div className="absolute bottom-2.5 right-2.5 z-10 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-slate-200 font-mono text-[10px] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  {item.durationSeconds}s
                </span>
                {item.audioEnabled && (
                  <span className="p-1 rounded bg-black/80 text-emerald-400">
                    <Volume2 className="w-3 h-3" />
                  </span>
                )}
              </div>

              {/* Hover Quick Preview Button */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  id={`btn-preview-media-${item.id}`}
                  onClick={() => setPreviewItem(item)}
                  className="px-3 py-1.5 rounded-md bg-slate-100 hover:bg-white text-slate-900 font-semibold text-xs flex items-center gap-1.5 shadow-lg cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Visualizar</span>
                </button>
              </div>
            </div>

            {/* Details */}
            <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-semibold text-slate-100 line-clamp-2 leading-snug">
                  {item.title}
                </h4>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {item.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                <span>{(item.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB</span>
                <span className="capitalize">Transição: {item.transition}</span>
              </div>
            </div>

            {/* Footer Action */}
            <div className="p-2.5 bg-[#0c0c0e] border-t border-slate-800 flex items-center justify-between">
              <button
                id={`btn-open-preview-${item.id}`}
                onClick={() => setPreviewItem(item)}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
              >
                Prévia
              </button>
              <button
                id={`btn-delete-media-${item.id}`}
                onClick={() => {
                  if (confirm(`Remover "${item.title}" da biblioteca?`)) {
                    deleteMedia(item.id);
                  }
                }}
                className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                title="Excluir Mídia"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Media Modal */}
      {isUploadMediaOpen && (
        <div
          id="modal-upload-media-backdrop"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-[#121214] border border-slate-800 rounded-xl max-w-xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-100 font-['Space_Grotesk']">
                  Upload & Cadastro de Conteúdo
                </h3>
                <p className="text-xs text-slate-400">
                  Adicione imagens, vídeos em alta resolução ou links externos dinâmicos
                </p>
              </div>
              <button
                id="btn-close-upload-media"
                onClick={() => setIsUploadMediaOpen(false)}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* Drag and Drop Zone */}
              <div className="p-6 border-2 border-dashed border-slate-800 rounded-xl text-center space-y-2 bg-[#0c0c0e] hover:border-slate-600 transition-colors cursor-pointer">
                <UploadCloud className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-200">
                  Arraste e solte arquivos aqui, ou clique para selecionar
                </p>
                <p className="text-[11px] text-slate-500">
                  Suporta MP4, WebM, PNG, JPG, WEBP, GIF (Até 500 MB)
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Título / Nome da Mídia
                </label>
                <input
                  id="input-upload-title"
                  type="text"
                  required
                  placeholder="Ex: Campanha Especial Dia dos Pais"
                  value={uploadTitle}
                  onChange={e => setUploadTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-[#18181b] border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-slate-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tipo de Mídia
                  </label>
                  <select
                    id="select-upload-type"
                    value={uploadType}
                    onChange={e => setUploadType(e.target.value as MediaType)}
                    className="w-full px-3 py-2 rounded-md bg-[#18181b] border border-slate-800 text-slate-100 text-xs"
                  >
                    <option value="image">Imagem Estática (JPG/PNG)</option>
                    <option value="video">Vídeo (MP4/WebM)</option>
                    <option value="rss">Feed de Notícias (RSS)</option>
                    <option value="widget">Widget / Conteúdo Dinâmico</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Categoria
                  </label>
                  <select
                    id="select-upload-category"
                    value={uploadCategory}
                    onChange={e => setUploadCategory(e.target.value as MediaItem['category'])}
                    className="w-full px-3 py-2 rounded-md bg-[#18181b] border border-slate-800 text-slate-100 text-xs"
                  >
                    <option value="Promoção">Promoção</option>
                    <option value="Institucional">Institucional</option>
                    <option value="Notícias">Notícias</option>
                    <option value="Esportes">Esportes</option>
                    <option value="Clima">Clima</option>
                    <option value="Entretenimento">Entretenimento</option>
                    <option value="Saúde">Saúde</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Duração Padrão (segundos)
                  </label>
                  <input
                    id="input-upload-duration"
                    type="number"
                    min="3"
                    max="300"
                    value={uploadDuration}
                    onChange={e => setUploadDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-md bg-[#18181b] border border-slate-800 text-slate-100 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Transição de Entrada
                  </label>
                  <select
                    id="select-upload-transition"
                    value={uploadTransition}
                    onChange={e => setUploadTransition(e.target.value as TransitionType)}
                    className="w-full px-3 py-2 rounded-md bg-[#18181b] border border-slate-800 text-slate-100 text-xs"
                  >
                    <option value="fade">Fade (Suave)</option>
                    <option value="slide">Slide Lateral</option>
                    <option value="zoom">Zoom In</option>
                    <option value="kenburns">Ken Burns (Pan lento)</option>
                    <option value="dissolve">Dissolve</option>
                    <option value="cut">Corte Direto</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="checkbox-upload-audio"
                  checked={uploadAudio}
                  onChange={e => setUploadAudio(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-emerald-500"
                />
                <label htmlFor="checkbox-upload-audio" className="text-xs text-slate-300 cursor-pointer">
                  Reproduzir com áudio ativo no player
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  id="btn-cancel-upload-media"
                  onClick={() => setIsUploadMediaOpen(false)}
                  className="px-4 py-2 rounded-md text-xs font-semibold text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  id="btn-submit-upload-media"
                  className="px-5 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md cursor-pointer"
                >
                  Salvar e Enviar para Cache
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <div
          id="modal-media-preview-backdrop"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="bg-[#121214] border border-slate-800 rounded-xl max-w-3xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100">{previewItem.title}</h3>
              <button
                id="btn-close-media-preview"
                onClick={() => setPreviewItem(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video bg-black rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
              {previewItem.type === 'video' ? (
                <video
                  src={previewItem.url}
                  autoPlay
                  controls
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={previewItem.url}
                  alt={previewItem.title}
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
              <span>Duração: {previewItem.durationSeconds} segundos</span>
              <span>Categoria: {previewItem.category}</span>
              <span>Transição: {previewItem.transition}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
