import React, { useState, useRef } from 'react';
import { UploadCloud, Video, Trash2, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { User, MediaItem } from '../types';
import { uploadFileToMinIO } from '../minioService';

interface DepartmentDashboardProps {
  currentUser: User;
  mediaItems: MediaItem[];
  onUploadMedia: (media: Omit<MediaItem, 'id' | 'uploadedBy' | 'uploadedAt'>) => void;
  onDeleteMedia: (id: string) => void;
}

export const DepartmentDashboard: React.FC<DepartmentDashboardProps> = ({
  currentUser,
  mediaItems,
  onUploadMedia,
  onDeleteMedia
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New configuration states for uploading media
  const [customDuration, setCustomDuration] = useState<string>('');
  const [enableSchedule, setEnableSchedule] = useState<boolean>(false);
  const [scheduleStart, setScheduleStart] = useState<string>('');
  const [scheduleEnd, setScheduleEnd] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Filter media items for this user's department
  const deptMediaItems = mediaItems.filter(item => item.department === currentUser.department);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const [isUploading, setIsUploading] = useState<boolean>(false);

  const processFile = async (file: File) => {
    if (isUploading) return;
    setUploadStatus(null);
    setUploadProgress(0);

    // Validate type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      setUploadStatus({
        type: 'error',
        message: 'Apenas arquivos de imagem (.png, .jpg, .jpeg, .gif) ou vídeo (.mp4, .webm) são aceitos.'
      });
      return;
    }

    // Validate size (3 GB limit = 3 * 1024 * 1024 * 1024 bytes)
    const maxSizeBytes = 3 * 1024 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setUploadStatus({
        type: 'error',
        message: 'O arquivo excede o limite máximo permitido de 3 GB.'
      });
      return;
    }

    // Format title from filename
    let cleanTitle = file.name
      .substring(0, file.name.lastIndexOf('.'))
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());

    setIsUploading(true);
    setUploadStatus({
      type: 'success',
      message: 'Enviando arquivo para o MinIO...'
    });

    try {
      // Upload directly to MinIO, updating progress state
      const minioUrl = await uploadFileToMinIO(file, (percent) => {
        setUploadProgress(percent);
        setUploadStatus({
          type: 'success',
          message: `Enviando arquivo para o MinIO... (${percent}%)`
        });
      });

      onUploadMedia({
        title: cleanTitle,
        type: isVideo ? 'video' : 'image',
        url: minioUrl,
        size: formatFileSize(file.size),
        department: currentUser.department || 'Geral',
        duration: (!isVideo && customDuration) ? Number(customDuration) : undefined,
        scheduleStart: enableSchedule && scheduleStart ? scheduleStart : undefined,
        scheduleEnd: enableSchedule && scheduleEnd ? scheduleEnd : undefined
      });

      setUploadStatus({
        type: 'success',
        message: `"${file.name}" enviado com sucesso para o MinIO!`
      });
    } catch (err: any) {
      console.error(err);
      setUploadStatus({
        type: 'error',
        message: `Erro ao enviar para o MinIO: ${err.message || err}. Verifique as configurações no arquivo .env e se o CORS está ativo.`
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset inputs
      setCustomDuration('');
      setEnableSchedule(false);
      setScheduleStart('');
      setScheduleEnd('');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-8">
      {/* Informações da Área */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">
            Painel do Departamento
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Espaço reservado para envio e gestão de mídias do setor: <strong className="text-[#002c5f] font-bold">{currentUser.department}</strong>
          </p>
        </div>
        <div className="flex items-center gap-2.5 bg-blue-50 border border-blue-200 px-4 py-2 rounded-xl text-xs text-[#002c5f] w-fit font-medium">
          <Info size={16} className="shrink-0" />
          <span>Mídias enviadas aqui aparecem em tempo real na playlist geral.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Dropzone de Upload */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass border border-slate-800/80 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-200">
              Enviar Novas Mídias
            </h3>

            {/* Configurações da Mídia */}
            <div className="space-y-3 p-3.5 rounded-xl bg-slate-950/40 border border-slate-850/80 text-xs">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                Configurações da Próxima Mídia
              </span>
              
              {/* Duração Customizada */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-300 block font-medium">Duração de Imagem (segundos, opcional):</label>
                <input
                  type="number"
                  min="1"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(e.target.value)}
                  placeholder="Ex: 10 (Padrão: global)"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-200 focus:outline-none focus:border-[#002c5f] transition-all text-xs"
                />
              </div>

              {/* Habilitar Agendamento */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="enableSchedule"
                  checked={enableSchedule}
                  onChange={(e) => setEnableSchedule(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-950/60 text-[#002c5f] focus:ring-[#002c5f]/20"
                />
                <label htmlFor="enableSchedule" className="text-[11px] text-slate-300 cursor-pointer select-none">
                  Agendar período de exibição
                </label>
              </div>

              {/* Datas de Agendamento */}
              {enableSchedule && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 block font-medium">Início:</label>
                    <input
                      type="datetime-local"
                      value={scheduleStart}
                      onChange={(e) => setScheduleStart(e.target.value)}
                      className="w-full px-2 py-1 rounded bg-slate-950/60 border border-slate-800 text-slate-300 focus:outline-none text-[11px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 block font-medium">Término:</label>
                    <input
                      type="datetime-local"
                      value={scheduleEnd}
                      onChange={(e) => setScheduleEnd(e.target.value)}
                      className="w-full px-2 py-1 rounded bg-slate-950/60 border border-slate-800 text-slate-300 focus:outline-none text-[11px]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Drag & Drop Area */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all duration-200 ${
                isUploading 
                  ? 'border-[#002c5f]/30 bg-[#002c5f]/5 cursor-wait opacity-60' 
                  : isDragActive
                  ? 'border-[#002c5f] bg-[#002c5f]/5 cursor-pointer'
                  : 'border-slate-800 bg-slate-950/40 hover:bg-slate-950/80 hover:border-slate-700 cursor-pointer'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
              />
              {isUploading ? (
                <div className="w-full px-4 py-2 flex flex-col items-center">
                  <div className="w-10 h-10 border-4 border-[#002c5f] border-t-transparent rounded-full animate-spin mb-4"></div>
                  <span className="text-sm font-mono font-bold text-[#002c5f] mb-2">{uploadProgress}%</span>
                  <div className="w-full bg-slate-900 border border-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-[#002c5f] h-full rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <>
                  <UploadCloud size={40} className={`mb-3 ${isDragActive ? 'text-[#002c5f]' : 'text-slate-500'}`} />
                  <span className="text-xs font-semibold text-slate-300 block mb-1">
                    Arraste e solte o arquivo aqui
                  </span>
                  <span className="text-[10px] text-slate-500 block mb-3">
                    ou clique para selecionar do computador
                  </span>
                </>
              )}

              <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700">
                  IMAGENS: PNG, JPG, GIF
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700">
                  VÍDEOS: MP4, WEBM
                </span>
              </div>
            </div>

            {/* Status Feedback */}
            {uploadStatus && (
              <div className={`p-3 rounded-lg text-xs flex gap-2 border ${
                uploadStatus.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}>
                {uploadStatus.type === 'success' ? (
                  <CheckCircle2 size={15} className="shrink-0" />
                ) : (
                  <AlertTriangle size={15} className="shrink-0" />
                )}
                <span>{uploadStatus.message}</span>
              </div>
            )}

          </div>
        </div>

        {/* Listagem de Mídias do Departamento */}
        <div className="lg:col-span-2">
          <div className="glass border border-slate-800/80 rounded-2xl p-6 space-y-5">
            <h3 className="text-sm font-bold text-slate-200">
              Minhas Mídias Cadastradas
            </h3>

            {deptMediaItems.length === 0 ? (
              <div className="py-16 text-center text-slate-500 text-xs border border-dashed border-slate-850 rounded-xl">
                Nenhum arquivo enviado para o setor "{currentUser.department}" ainda.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {deptMediaItems.map((media) => (
                  <div 
                    key={media.id} 
                    className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl flex items-start justify-between gap-3 group hover:border-slate-750 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      {/* Mini Preview Box */}
                      <div className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shrink-0 flex items-center justify-center relative">
                        {media.type === 'video' ? (
                          <>
                            <video src={media.url} className="w-full h-full object-cover opacity-60" />
                            <Video size={16} className="absolute text-slate-300" />
                          </>
                        ) : (
                          <img src={media.url} alt={media.title} className="w-full h-full object-cover" />
                        )}
                      </div>

                      <div className="overflow-hidden">
                        <h4 className="text-xs font-semibold text-slate-200 truncate pr-2" title={media.title}>
                          {media.title}
                        </h4>
                        <span className="text-[9px] text-slate-500 block mt-0.5">
                          Tamanho: <strong className="text-slate-400 font-mono">{media.size}</strong>
                        </span>
                        <span className="text-[9px] text-slate-500 block">
                          Enviado por: {media.uploadedBy}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onDeleteMedia(media.id);
                        if (media.url.startsWith('blob:')) {
                          URL.revokeObjectURL(media.url); // Release resources
                        }
                      }}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-lg transition-all"
                      title="Excluir Mídia"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
