import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, SkipForward, SkipBack, ExternalLink, Repeat, Clock, Search, ArrowUp, ArrowDown, Film, Image as ImageIcon,
  CloudSun, Maximize2, Minimize2, Sun, Cloud, CloudRain, Wind, Droplets
} from 'lucide-react';
import { MediaItem, User } from '../types';

interface VisualizerPageProps {
  currentUser: User;
  mediaItems: MediaItem[];
  onReorderMedia: (currentIndex: number, direction: 'up' | 'down') => void;
}

export const VisualizerPage: React.FC<VisualizerPageProps> = ({
  currentUser,
  mediaItems,
  onReorderMedia
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [imageDuration, setImageDuration] = useState<number>(30); // Default: 30 seconds
  const [playlistLoop, setPlaylistLoop] = useState<boolean>(true); // Default: Playlist loops
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('Todos');

  // Interactive modes
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [fadeState, setFadeState] = useState<boolean>(true); // For slide transitions

  // Geração dinâmica da previsão de 7 dias para Campinas
  const getWeeklyForecast = () => {
    const weekdays = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const weatherTypes = [
      { cond: "Sol com Nuvens", temp: "23°C / 14°C", icon: "cloud-sun" },
      { cond: "Ensolarado", temp: "25°C / 13°C", icon: "sun" },
      { cond: "Ensolarado", temp: "26°C / 14°C", icon: "sun" },
      { cond: "Parcialmente Nublado", temp: "24°C / 15°C", icon: "cloud" },
      { cond: "Chuva Rápida", temp: "21°C / 13°C", icon: "cloud-rain" },
      { cond: "Sol com Nuvens", temp: "22°C / 12°C", icon: "cloud-sun" },
      { cond: "Limpo e Estável", temp: "24°C / 13°C", icon: "sun" },
    ];

    const todayIndex = new Date().getDay();
    const forecast = [];

    for (let i = 0; i < 7; i++) {
      const currentDayIndex = (todayIndex + i) % 7;
      const dayName = i === 0 ? "Hoje" : i === 1 ? "Amanhã" : weekdays[currentDayIndex];
      const weather = weatherTypes[i % weatherTypes.length];
      forecast.push({
        day: dayName,
        ...weather
      });
    }
    return forecast;
  };

  const weeklyForecast = getWeeklyForecast();

  // Video element and image timer refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerWrapperRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<any | null>(null);
  const [progressKey, setProgressKey] = useState<number>(0); // Triggers re-running the CSS progress animation

  // List of departments for filtering
  const departments = ['Todos', ...Array.from(new Set(mediaItems.map(m => m.department)))];

  // Filtered list of media incorporating scheduling validation
  const filteredMedia = mediaItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'Todos' || item.department === selectedDept;
    
    // Check Scheduling
    let matchesSchedule = true;
    const now = new Date();
    if (item.scheduleStart) {
      matchesSchedule = matchesSchedule && (new Date(item.scheduleStart) <= now);
    }
    if (item.scheduleEnd) {
      matchesSchedule = matchesSchedule && (new Date(item.scheduleEnd) >= now);
    }

    return matchesSearch && matchesDept && matchesSchedule;
  });

  // Slide virtual do Clima injetado no final da playlist
  const weatherSlide: MediaItem = {
    id: 'virtual-weather',
    title: 'Painel Clima - Campinas',
    type: 'image',
    url: '#weather-forecast',
    size: '0 B',
    department: 'Geral',
    uploadedBy: 'Sistema',
    uploadedAt: new Date().toISOString(),
    duration: 15 // Tempo de exibição de 15 segundos
  };

  const playlistWithWeather = filteredMedia.length > 0 ? [...filteredMedia, weatherSlide] : [weatherSlide];

  const activeMedia = playlistWithWeather[currentIndex] || null;



  // Transition Effect on Index Change
  useEffect(() => {
    setFadeState(false);
    const t = setTimeout(() => {
      setFadeState(true);
    }, 150);
    return () => clearTimeout(t);
  }, [currentIndex]);

  // Fullscreen listeners
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Show / Hide Controls in Fullscreen on mouse move
  useEffect(() => {
    if (!isFullscreen) {
      setShowControls(true);
      return;
    }

    let hideTimeout: any;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(hideTimeout);
      hideTimeout = setTimeout(() => {
        setShowControls(false);
      }, 3500);
    };

    window.addEventListener('mousemove', handleMouseMove);
    handleMouseMove(); // Initial trigger

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(hideTimeout);
    };
  }, [isFullscreen]);

  // Handle media switching
  const playMediaIndex = (index: number) => {
    if (index >= 0 && index < playlistWithWeather.length) {
      setCurrentIndex(index);
      setIsPlaying(true);
      setProgressKey(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (playlistWithWeather.length === 0) return;
    if (currentIndex < playlistWithWeather.length - 1) {
      playMediaIndex(currentIndex + 1);
    } else if (playlistLoop) {
      playMediaIndex(0);
    } else {
      setIsPlaying(false);
    }
  };

  const handlePrev = () => {
    if (playlistWithWeather.length === 0) return;
    if (currentIndex > 0) {
      playMediaIndex(currentIndex - 1);
    } else if (playlistLoop) {
      playMediaIndex(playlistWithWeather.length - 1);
    }
  };

  // Load video when media changes
  useEffect(() => {
    if (activeMedia && activeMedia.type === 'video') {
      const videoEl = videoRef.current;
      if (videoEl) {
        videoEl.load();
        if (isPlaying && videoEl.paused) {
          videoEl.play().catch(err => console.warn("Play block:", err));
        }
      }
    }
  }, [activeMedia]);

  // Sync play/pause state for videos and handle image slideshow timers
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!activeMedia) return;

    if (activeMedia.type === 'video') {
      const videoEl = videoRef.current;
      if (videoEl) {
        if (isPlaying) {
          if (videoEl.paused) {
            videoEl.play().catch(err => console.warn("Play block:", err));
          }
        } else {
          if (!videoEl.paused) {
            videoEl.pause();
          }
        }
      }
    } else if (activeMedia.type === 'image') {
      if (!isPlaying) return;
      const duration = activeMedia.duration || imageDuration;
      timerRef.current = setTimeout(() => {
        handleNext();
      }, duration * 1000);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex, isPlaying, imageDuration, activeMedia]);

  // Video finished playing
  const handleVideoEnded = () => {
    handleNext();
  };

  // Toggle Fullscreen API
  const handleToggleFullscreen = () => {
    if (!playerWrapperRef.current) return;
    if (!document.fullscreenElement) {
      playerWrapperRef.current.requestFullscreen().catch(err => {
        console.error("Erro ao entrar em tela cheia:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // If filtered media items are reordered, we need to make sure the active media index remains consistent
  const handleSidebarReorder = (idx: number, direction: 'up' | 'down') => {
    // 1. Identify the active media item ID before reordering
    const currentActiveId = activeMedia?.id;

    // 2. Map indices back to the global mediaItems list
    const filteredItem = filteredMedia[idx];
    const globalIdx = mediaItems.findIndex(m => m.id === filteredItem.id);

    if (globalIdx !== -1) {
      // Trigger the reorder
      if (direction === 'up' && idx > 0) {
        onReorderMedia(globalIdx, 'up'); // Since both exist, reorder globally
      } else if (direction === 'down' && idx < filteredMedia.length - 1) {
        onReorderMedia(globalIdx, 'down');
      }
    }

    // 3. Sincronizar o índice atual pós-reordenação
    setTimeout(() => {
      if (currentActiveId) {
        const newIdx = filteredMedia.findIndex(m => m.id === currentActiveId);
        if (newIdx !== -1) {
          setCurrentIndex(newIdx);
        }
      }
    }, 50);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Search & Filter Header */}
      <div className="glass border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-600 uppercase shrink-0">Filtrar Playlist:</span>
          <div className="flex gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none w-full">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => {
                  setSelectedDept(dept);
                  setCurrentIndex(0);
                }}
                className={`text-[10px] font-semibold px-3 py-1.5 rounded-lg border transition-all shrink-0 ${
                  selectedDept === dept
                    ? 'bg-[#002c5f] text-white border-[#002c5f] shadow-md shadow-[#002c5f]/10'
                    : 'bg-white border-slate-200 text-slate-650 hover:text-[#002c5f] hover:bg-blue-50/50 hover:border-blue-200'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full md:w-64">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search size={14} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentIndex(0);
            }}
            placeholder="Buscar mídia..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#002c5f] focus:ring-1 focus:ring-[#002c5f]/20 text-xs transition-all shadow-sm"
          />
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
          display: inline-block;
          padding-left: 20px;
        }
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-shrink {
          animation: shrink linear forwards;
        }
        :fullscreen {
          background-color: #000000 !important;
        }
      `}</style>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PLAYER PRINCIPAL */}
        <div className="lg:col-span-2 space-y-4">
          <div 
            ref={playerWrapperRef}
            className={`glass border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col aspect-video bg-black relative group ${
              isFullscreen ? 'w-screen h-screen max-w-none max-h-none rounded-none border-none' : ''
            }`}
          >


            {/* Visualizer Screens with Transition opacity */}
            {activeMedia ? (
              <div className={`flex-1 w-full h-full flex items-center justify-center relative bg-slate-950/20 transition-opacity duration-300 ${
                fadeState ? 'opacity-100' : 'opacity-0'
              }`}>
                {activeMedia.id === 'virtual-weather' ? (
                  <div className="w-full h-full flex flex-col justify-between p-6 md:p-8 bg-white text-left select-none relative overflow-hidden">
                    {/* Background glow effects */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-[#002c5f]/5 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

                    {/* Top Header */}
                    <div className="flex justify-between items-center border-b border-slate-100 pb-4 z-10">
                      <div>
                        <span className="text-[9px] font-bold text-[#002c5f] uppercase tracking-widest block mb-0.5">Painel Climático Informativo</span>
                        <h2 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
                          Campinas, SP <span className="text-xs font-normal text-slate-400">• CTDI Brasil</span>
                        </h2>
                      </div>
                      
                      <div className="flex gap-3 text-[10px] text-slate-500">
                        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl shadow-sm">
                          <Wind size={12} className="text-[#002c5f]" />
                          <span>Vento: 12 km/h</span>
                        </div>
                        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl shadow-sm">
                          <Droplets size={12} className="text-blue-500" />
                          <span>Umidade: 65%</span>
                        </div>
                      </div>
                    </div>

                    {/* Middle grid */}
                    <div className="grid grid-cols-3 gap-5 items-center my-auto z-10">
                      {/* Left: Big Today Temp */}
                      <div className="col-span-1 bg-gradient-to-br from-blue-50 to-[#002c5f]/5 border border-blue-150 rounded-2xl p-5 flex flex-col items-center text-center space-y-3 shadow-sm">
                        <CloudSun size={56} className="text-amber-500 drop-shadow-sm animate-pulse" />
                        <div className="space-y-0.5">
                          <h3 className="text-4xl font-black text-slate-800 leading-none">23°C</h3>
                          <p className="text-[11px] font-semibold text-slate-600">Sol com Algumas Nuvens</p>
                        </div>
                        <div className="text-[9px] font-bold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm">
                          Máx: 25°C • Mín: 14°C
                        </div>
                      </div>

                      {/* Right: Weekly forecast grid (Next 6 days) */}
                      <div className="col-span-2 grid grid-cols-6 gap-2">
                        {weeklyForecast.slice(1, 7).map((day, idx) => {
                          const getIcon = (type: string) => {
                            switch (type) {
                              case 'sun': return <Sun size={20} className="text-amber-500" />;
                              case 'cloud-rain': return <CloudRain size={20} className="text-blue-500" />;
                              case 'cloud': return <Cloud size={20} className="text-slate-400" />;
                              default: return <CloudSun size={20} className="text-amber-400" />;
                            }
                          };

                          return (
                            <div 
                              key={idx}
                              className="bg-slate-50/80 border border-slate-200 p-2.5 rounded-xl flex flex-col items-center text-center space-y-2 transition-all duration-200 shadow-sm"
                            >
                              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide truncate w-full block">
                                {day.day}
                              </span>
                              <div className="p-1.5 rounded-lg bg-white border border-slate-150 shadow-sm">
                                {getIcon(day.icon)}
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-[10px] font-bold text-slate-700 block leading-none">{day.temp.split(" / ")[0]}</span>
                                <span className="text-[8px] text-slate-405 text-slate-400 block leading-none">{day.temp.split(" / ")[1]}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bottom Disclaimer */}
                    <div className="text-[8px] text-slate-500 border-t border-slate-100 pt-2 text-center w-full z-10 select-none">
                      Estação meteorológica local CTDI Brasil • Campinas, SP
                    </div>
                  </div>
                ) : activeMedia.type === 'video' ? (
                  <video
                    ref={videoRef}
                    src={activeMedia.url}
                    controls={!isFullscreen || showControls}
                    autoPlay={isPlaying}
                    muted
                    playsInline
                    onEnded={handleVideoEnded}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-2">
                    <img
                      src={activeMedia.url}
                      alt={activeMedia.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}



                {/* Info Overlay at the bottom (hidden in fullscreen if controls are hidden) */}


                {/* Progress Bar (Only for images) */}
                {activeMedia.type === 'image' && isPlaying && (
                  <div className="absolute top-0 inset-x-0 h-1 bg-slate-950/40 z-50">
                    <div
                      key={`${progressKey}-${activeMedia.id}`}
                      className="h-full bg-gradient-to-r from-blue-500 to-[#002c5f] animate-shrink"
                      style={{ animationDuration: `${activeMedia.duration || imageDuration}s` }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
                <Film size={48} className="mb-3 text-slate-700 animate-pulse" />
                <span className="text-xs">Nenhuma mídia encontrada com os filtros selecionados ou no período agendado.</span>
              </div>
            )}
          </div>

          {/* CONTROLES DE REPRODUÇÃO */}
          {(!isFullscreen || showControls) && (
            <div className={`glass border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 transition-all duration-300 ${
              isFullscreen ? 'absolute bottom-4 inset-x-4 z-50 bg-white/95 border-slate-200' : ''
            }`}>
              {/* Play/Pause & Navigation */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  disabled={filteredMedia.length === 0}
                  className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  title="Mídia Anterior"
                >
                  <SkipBack size={16} />
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  disabled={filteredMedia.length === 0}
                  className="p-3 rounded-xl bg-[#002c5f] hover:bg-[#162758] text-white font-semibold shadow-lg shadow-[#002c5f]/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title={isPlaying ? 'Pausar Transmissão' : 'Iniciar Transmissão'}
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                </button>

                <button
                  onClick={handleNext}
                  disabled={filteredMedia.length === 0}
                  className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  title="Próxima Mídia"
                >
                  <SkipForward size={16} />
                </button>
              </div>

              {/* Loop & Duration & Fullscreen Controls */}
              <div className="flex items-center flex-wrap gap-3">
                {/* Loop da Playlist */}
                <button
                  onClick={() => setPlaylistLoop(!playlistLoop)}
                  className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition-all ${
                    playlistLoop
                      ? 'bg-blue-50 border-blue-200 text-[#002c5f] shadow-sm'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-800 shadow-sm'
                  }`}
                  title="Repetição Contínua da Playlist"
                >
                  <Repeat size={14} />
                  <span>Loop</span>
                </button>

                {/* Seletor de tempo global para fotos */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 uppercase">
                    <Clock size={12} />
                    <span>Tempo Geral:</span>
                  </div>
                  <select
                    value={imageDuration}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setImageDuration(val);
                      setProgressKey(prev => prev + 1);
                    }}
                    className="bg-white border border-slate-200 text-slate-700 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#002c5f] shadow-sm"
                  >
                    <option value={3}>3s</option>
                    <option value={5}>5s</option>
                    <option value={10}>10s</option>
                    <option value={15}>15s</option>
                    <option value={30}>30s</option>
                  </select>
                </div>



                {/* Fullscreen Button */}
                <button
                  onClick={handleToggleFullscreen}
                  className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-800 transition-all flex items-center gap-1.5 text-xs font-semibold shadow-sm"
                  title={isFullscreen ? "Sair da Tela Cheia" : "Modo TV / Tela Cheia"}
                >
                  {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                  <span>{isFullscreen ? "Sair TV" : "Modo TV"}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* INTERACTIVE PLAYLIST SIDEBAR */}
        <div className="lg:col-span-1">
          <div className="glass border border-slate-200 rounded-2xl p-5 flex flex-col h-[580px] space-y-4 shadow-sm">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800">
                Lista de Transmissão
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Exibindo {playlistWithWeather.length} arquivo(s) na fila
              </p>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {playlistWithWeather.map((media, idx) => {
                const isActive = activeMedia?.id === media.id;
                const isVirtual = media.id === 'virtual-weather';
                return (
                  <div
                    key={media.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 group/item transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-50 border-blue-200 text-[#002c5f] shadow-sm'
                        : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <div 
                      onClick={() => playMediaIndex(idx)}
                      className="flex items-center gap-2.5 overflow-hidden flex-1 cursor-pointer"
                    >
                      {/* Equalizer or number badge */}
                      <div className="w-6 h-6 shrink-0 flex items-center justify-center rounded-lg text-[10px] font-mono font-bold bg-slate-50 border border-slate-200 text-slate-500">
                        {isActive && isPlaying ? (
                          <div className="flex items-end gap-0.5 h-2.5 w-2.5">
                            <span className="w-0.5 bg-[#002c5f] rounded-sm animate-pulse h-full"></span>
                            <span className="w-0.5 bg-[#002c5f] rounded-sm animate-pulse h-1/2" style={{ animationDelay: '0.15s' }}></span>
                            <span className="w-0.5 bg-[#002c5f] rounded-sm animate-pulse h-3/4" style={{ animationDelay: '0.3s' }}></span>
                          </div>
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </div>

                      {/* Small Type Icon */}
                      <span className="shrink-0 text-slate-400 font-medium">
                        {isVirtual ? <CloudSun size={12} className="text-[#002c5f]" /> : media.type === 'video' ? <Film size={12} /> : <ImageIcon size={12} />}
                      </span>

                      {/* Name / Info */}
                      <div className="overflow-hidden">
                        <span className={`text-xs font-semibold block truncate leading-tight ${isActive ? 'text-slate-800 font-bold' : 'text-slate-700'}`}>
                          {media.title}
                        </span>
                        <span className="text-[8px] text-slate-400 block">
                          Setor: {media.department}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {/* UP/DOWN buttons for Master Admin only */}
                      {currentUser.role === 'admin' && !isVirtual && (
                        <div className="flex items-center scale-90">
                          <button
                            disabled={idx === 0}
                            onClick={() => handleSidebarReorder(idx, 'up')}
                            className={`p-1 rounded transition-colors ${
                              idx === 0 
                                ? 'text-slate-350 cursor-not-allowed' 
                                : 'text-slate-500 hover:text-[#002c5f] hover:bg-blue-50/50'
                            }`}
                            title="Mover para Cima"
                          >
                            <ArrowUp size={11} />
                          </button>
                          <button
                            disabled={idx === playlistWithWeather.length - 2} // -2 because last item is weatherSlide
                            onClick={() => handleSidebarReorder(idx, 'down')}
                            className={`p-1 rounded transition-colors ${
                              idx === playlistWithWeather.length - 2 
                                ? 'text-slate-350 cursor-not-allowed' 
                                : 'text-slate-500 hover:text-[#002c5f] hover:bg-blue-50/50'
                            }`}
                            title="Mover para Baixo"
                          >
                            <ArrowDown size={11} />
                          </button>
                        </div>
                      )}

                      {/* Open Tab Button */}
                      {!isVirtual ? (
                        <a
                          href={media.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-900 transition-all shrink-0"
                          title="Nova aba"
                        >
                          <ExternalLink size={11} />
                        </a>
                      ) : (
                        <span className="p-1.5 text-slate-800 cursor-not-allowed">
                          <ExternalLink size={11} />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
