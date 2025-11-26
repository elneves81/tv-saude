import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import YouTube from 'react-youtube';
import { API_BASE_URL, getUploadsUrl, getImagesUrl } from './config/api';
import LogoDitis from './components/LogoDitis';
import audioManager from './utils/audioManager';

function App() {
  // Estados principais
  const [videos, setVideos] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [playlist, setPlaylist] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [lastCommandId, setLastCommandId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [images, setImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageSlideshow, setShowImageSlideshow] = useState(false);
  
  // Estados para controle de transição melhorado
  const [videoErrorCount, setVideoErrorCount] = useState(0);
  const [transitionTimer, setTransitionTimer] = useState(null);
  const [videoStartTime, setVideoStartTime] = useState(null);
  const [forceTransition, setForceTransition] = useState(0);
  
  const videoRef = useRef(null);
  const youtubeRef = useRef(null);
  const maxVideoErrors = 3;
  const MAX_VIDEO_DURATION = 300000; // 5 minutos máximo por vídeo

  // Atualizar relógio a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Buscar vídeos da API com lógica melhorada
  const fetchVideos = useCallback(async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      }
      
      console.log('🔄 Buscando vídeos...');
      
      // Tentar buscar conteúdo por localidade primeiro
      let response;
      try {
        response = await axios.get(`${API_BASE_URL}/localidades/conteudo`);
        console.log('📍 Resposta da API de localidades:', response.data);
      } catch (localidadeError) {
        console.log('⚠️ Erro na API de localidades, tentando fallback...');
        response = await axios.get(`${API_BASE_URL}/playlists/ativa/videos`);
        console.log('📋 Resposta da API de playlist ativa:', response.data);
      }
      
      if (response.data && response.data.videos && response.data.videos.length > 0) {
        const newVideos = response.data.videos;
        console.log(`✅ ${newVideos.length} vídeos encontrados:`, newVideos.map(v => v.titulo));
        
        setVideos(newVideos);
        setPlaylist(response.data.playlist);
        setError(null);
        
        // Se é a primeira carga e há vídeos, iniciar do primeiro
        if (isInitialLoad && newVideos.length > 0) {
          setCurrentVideoIndex(0);
          console.log('🎬 Iniciando com o primeiro vídeo:', newVideos[0].titulo);
        }
        
      } else {
        console.log('⚠️ Nenhum vídeo encontrado na resposta');
        if (videos.length === 0) {
          setError('Nenhum vídeo encontrado');
        }
      }
    } catch (err) {
      console.error('❌ Erro ao buscar vídeos:', err);
      if (videos.length === 0) {
        setError('Erro ao conectar com o servidor');
      }
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      }
    }
  }, [videos.length]);

  // Buscar imagens
  const fetchImages = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/imagens`);
      if (response.data && response.data.length > 0) {
        setImages(response.data);
        setShowImageSlideshow(true);
      } else {
        setImages([]);
        setShowImageSlideshow(false);
      }
    } catch (err) {
      console.error('Erro ao buscar imagens:', err);
      setImages([]);
    }
  }, []);

  // Buscar mensagens
  const fetchMessages = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/mensagens`);
      setMessages(response.data || []);
    } catch (err) {
      console.error('Erro ao buscar mensagens:', err);
    }
  }, []);

  // Verificar comandos do controle remoto
  const checkRemoteCommands = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/controle/ultimo`);
      const command = response.data;
      
      if (command && command.id !== lastCommandId && command.comando) {
        setLastCommandId(command.id);
        executeCommand(command.comando, command.parametros);
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error('Erro ao verificar comandos:', err);
      }
    }
  }, [lastCommandId]);

  // Executar comando do controle remoto
  const executeCommand = useCallback((comando, parametros) => {
    console.log('🎮 Executando comando:', comando, parametros);
    
    switch (comando) {
      case 'play':
        setIsPlaying(true);
        if (getCurrentVideo()?.tipo === 'youtube' && youtubeRef.current) {
          youtubeRef.current.playVideo();
        } else if (videoRef.current) {
          videoRef.current.play();
        }
        break;
        
      case 'pause':
        setIsPlaying(false);
        if (getCurrentVideo()?.tipo === 'youtube' && youtubeRef.current) {
          youtubeRef.current.pauseVideo();
        } else if (videoRef.current) {
          videoRef.current.pause();
        }
        break;
        
      case 'next':
        forceNextVideo();
        break;
        
      case 'previous':
        forcePreviousVideo();
        break;
        
      case 'reload_playlist':
        fetchVideos(false);
        break;
        
      default:
        console.warn('⚠️ Comando desconhecido:', comando);
        break;
    }
  }, []);

  // Obter vídeo atual
  const getCurrentVideo = useCallback(() => {
    return videos[currentVideoIndex];
  }, [videos, currentVideoIndex]);

  // Avançar para próximo vídeo (forçado)
  const forceNextVideo = useCallback(() => {
    if (videos.length === 0) return;
    
    console.log(`➡️ FORÇANDO próximo vídeo (atual: ${currentVideoIndex}/${videos.length})`);
    
    // Limpar timer de transição anterior
    if (transitionTimer) {
      clearTimeout(transitionTimer);
      setTransitionTimer(null);
    }
    
    // Calcular próximo índice
    const nextIndex = currentVideoIndex >= videos.length - 1 ? 0 : currentVideoIndex + 1;
    
    console.log(`🎬 Mudando de vídeo ${currentVideoIndex} para ${nextIndex}`);
    console.log(`📺 Próximo vídeo: ${videos[nextIndex]?.titulo}`);
    
    setCurrentVideoIndex(nextIndex);
    setVideoErrorCount(0);
    setVideoStartTime(Date.now());
    setForceTransition(prev => prev + 1);
  }, [videos, currentVideoIndex, transitionTimer]);

  // Voltar para vídeo anterior (forçado)
  const forcePreviousVideo = useCallback(() => {
    if (videos.length === 0) return;
    
    console.log(`⬅️ FORÇANDO vídeo anterior (atual: ${currentVideoIndex}/${videos.length})`);
    
    // Limpar timer de transição anterior
    if (transitionTimer) {
      clearTimeout(transitionTimer);
      setTransitionTimer(null);
    }
    
    // Calcular índice anterior
    const prevIndex = currentVideoIndex <= 0 ? videos.length - 1 : currentVideoIndex - 1;
    
    console.log(`🎬 Mudando de vídeo ${currentVideoIndex} para ${prevIndex}`);
    console.log(`📺 Vídeo anterior: ${videos[prevIndex]?.titulo}`);
    
    setCurrentVideoIndex(prevIndex);
    setVideoErrorCount(0);
    setVideoStartTime(Date.now());
    setForceTransition(prev => prev + 1);
  }, [videos, currentVideoIndex, transitionTimer]);

  // Timer de segurança para transição automática
  const setupTransitionTimer = useCallback(() => {
    // Limpar timer anterior
    if (transitionTimer) {
      clearTimeout(transitionTimer);
    }
    
    // Configurar novo timer apenas se há múltiplos vídeos
    if (videos.length > 1) {
      const timer = setTimeout(() => {
        console.log('⏰ TIMEOUT: Forçando transição após tempo limite');
        forceNextVideo();
      }, MAX_VIDEO_DURATION);
      
      setTransitionTimer(timer);
      console.log(`⏱️ Timer de segurança configurado para ${MAX_VIDEO_DURATION/1000}s`);
    }
  }, [videos.length, transitionTimer, forceNextVideo]);

  // Quando o vídeo terminar
  const handleVideoEnd = useCallback(() => {
    const currentVideo = getCurrentVideo();
    console.log(`🏁 Vídeo terminou: ${currentVideo?.titulo}`);
    console.log(`📊 Total de vídeos: ${videos.length}, Índice atual: ${currentVideoIndex}`);
    
    // Limpar timer de transição
    if (transitionTimer) {
      clearTimeout(transitionTimer);
      setTransitionTimer(null);
    }
    
    if (videos.length <= 1) {
      // Se há apenas 1 vídeo ou menos, reiniciar o mesmo
      console.log('🔄 Apenas 1 vídeo - reiniciando...');
      setTimeout(() => {
        if (currentVideo?.tipo === 'youtube' && youtubeRef.current) {
          youtubeRef.current.seekTo(0);
          youtubeRef.current.playVideo();
        } else if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play();
        }
      }, 1000);
    } else {
      // Múltiplos vídeos - avançar para próximo
      console.log('➡️ Múltiplos vídeos - avançando para próximo');
      setTimeout(() => {
        forceNextVideo();
      }, 500);
    }
  }, [videos, currentVideoIndex, getCurrentVideo, transitionTimer, forceNextVideo]);

  // Quando o vídeo carregar
  const handleVideoLoad = useCallback(() => {
    const currentVideo = getCurrentVideo();
    console.log(`✅ Vídeo carregado: ${currentVideo?.titulo}`);
    
    setVideoErrorCount(0);
    setVideoStartTime(Date.now());
    
    // Configurar timer de segurança
    setupTransitionTimer();
    
    if (isPlaying && videoRef.current) {
      videoRef.current.play().catch(err => {
        console.error('❌ Erro ao reproduzir após carregamento:', err);
        handleVideoError(err);
      });
    }
  }, [getCurrentVideo, isPlaying, setupTransitionTimer]);

  // Tratar erros de vídeo
  const handleVideoError = useCallback((error) => {
    const currentVideo = getCurrentVideo();
    console.error(`❌ Erro no vídeo: ${currentVideo?.titulo}`, error);
    
    setVideoErrorCount(prev => {
      const newCount = prev + 1;
      console.log(`📊 Contador de erros: ${newCount}/${maxVideoErrors}`);
      
      if (newCount >= maxVideoErrors) {
        console.log('⚠️ Máximo de erros atingido - recarregando lista de vídeos');
        fetchVideos(false);
        return 0;
      }
      
      // Se há múltiplos vídeos, tentar próximo
      if (videos.length > 1) {
        console.log('➡️ Erro no vídeo - tentando próximo');
        setTimeout(() => {
          forceNextVideo();
        }, 2000);
      } else {
        // Vídeo único - tentar recarregar
        console.log('🔄 Erro em vídeo único - tentando recarregar');
        setTimeout(() => {
          setForceTransition(prev => prev + 1);
        }, 3000);
      }
      
      return newCount;
    });
  }, [getCurrentVideo, videos.length, forceNextVideo, fetchVideos]);

  // Eventos do YouTube
  const onYouTubeReady = useCallback((event) => {
    youtubeRef.current = event.target;
    console.log('✅ YouTube player pronto');
    
    setVideoStartTime(Date.now());
    setupTransitionTimer();
    
    if (isPlaying) {
      event.target.playVideo();
    }
  }, [isPlaying, setupTransitionTimer]);

  const onYouTubeEnd = useCallback(() => {
    console.log('🏁 Vídeo YouTube terminou');
    handleVideoEnd();
  }, [handleVideoEnd]);

  const onYouTubeError = useCallback((error) => {
    console.error('❌ Erro no YouTube:', error);
    handleVideoError(error);
  }, [handleVideoError]);

  // Configurações do YouTube
  const youtubeOpts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      controls: 0,
      disablekb: 1,
      fs: 0,
      iv_load_policy: 3,
      modestbranding: 1,
      rel: 0,
      showinfo: 0,
    },
  };

  // Extrair ID do YouTube
  const extractYouTubeId = useCallback((url) => {
    if (!url) return null;
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }, []);

  // Effect para mudança de vídeo
  useEffect(() => {
    if (videos.length > 0 && getCurrentVideo()) {
      const currentVideo = getCurrentVideo();
      console.log(`🎬 MUDANÇA DE VÍDEO: ${currentVideoIndex + 1}/${videos.length} - ${currentVideo.titulo}`);
      
      // Limpar timer anterior
      if (transitionTimer) {
        clearTimeout(transitionTimer);
        setTransitionTimer(null);
      }
      
      // Resetar estados
      setVideoErrorCount(0);
      setVideoStartTime(Date.now());
      
      // Para vídeos locais, configurar timer de segurança
      if (currentVideo.tipo !== 'youtube') {
        setupTransitionTimer();
      }
    }
  }, [currentVideoIndex, videos, forceTransition]);

  // Inicialização
  useEffect(() => {
    console.log('🚀 Inicializando aplicação TV Saúde');
    
    fetchVideos(true);
    fetchMessages();
    fetchImages();
    
    // Inicializar áudio
    audioManager.initialize().then(() => {
      console.log('🎵 AudioManager inicializado');
    }).catch(err => {
      console.error('❌ Erro ao inicializar AudioManager:', err);
    });
    
    // Intervalos
    const videoInterval = setInterval(() => fetchVideos(false), 10000);
    const commandInterval = setInterval(checkRemoteCommands, 2000);
    const messagesInterval = setInterval(fetchMessages, 10000);
    const imagesInterval = setInterval(fetchImages, 30000);
    
    return () => {
      clearInterval(videoInterval);
      clearInterval(commandInterval);
      clearInterval(messagesInterval);
      clearInterval(imagesInterval);
      if (transitionTimer) {
        clearTimeout(transitionTimer);
      }
    };
  }, []);

  // Rotação de mensagens
  useEffect(() => {
    if (messages.length > 1) {
      const messageRotation = setInterval(() => {
        setCurrentMessageIndex((prevIndex) => 
          prevIndex === messages.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000);
      
      return () => clearInterval(messageRotation);
    }
  }, [messages.length]);

  // Rotação de imagens
  useEffect(() => {
    if (images.length > 1 && showImageSlideshow) {
      const currentImage = images[currentImageIndex];
      const duration = currentImage?.duracao || 5000;
      
      const imageRotation = setInterval(() => {
        setCurrentImageIndex((prevIndex) => 
          prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
      }, duration);
      
      return () => clearInterval(imageRotation);
    }
  }, [images.length, currentImageIndex, showImageSlideshow]);

  // Formatação de data e hora
  const formatDateTime = (date) => {
    return {
      time: date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      date: date.toLocaleDateString('pt-BR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    };
  };

  const { time, date } = formatDateTime(currentTime);

  // Funções para mensagens
  const getMessageIcon = (tipo) => {
    switch (tipo) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'urgent': return '🚨';
      default: return 'ℹ️';
    }
  };

  const getMessageColor = (tipo) => {
    switch (tipo) {
      case 'success': return 'bg-green-600/90';
      case 'warning': return 'bg-yellow-600/90';
      case 'error': return 'bg-red-600/90';
      case 'urgent': return 'bg-red-700/90';
      default: return 'bg-blue-600/90';
    }
  };

  // Tela de loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-green-900">
        <div className="text-center">
          <div className="mx-auto mb-4 spinner"></div>
          <h2 className="mb-2 text-2xl font-bold text-white">TV Saúde Guarapuava</h2>
          <p className="text-blue-200">Carregando conteúdo educativo...</p>
        </div>
      </div>
    );
  }

  // Tela de erro
  if (error || videos.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-900 to-orange-900">
        <div className="max-w-md p-8 mx-auto text-center">
          <div className="mb-4 text-6xl">📺</div>
          <h2 className="mb-4 text-3xl font-bold text-white">TV Saúde Guarapuava</h2>
          <p className="mb-6 text-red-200">
            {error || 'Nenhum vídeo disponível no momento'}
          </p>
          <div className="text-white">
            <div className="text-4xl font-bold">{time}</div>
            <div className="text-lg capitalize">{date}</div>
          </div>
          <p className="mt-4 text-sm text-red-300">
            Verifique a conexão ou contate o administrador
          </p>
        </div>
      </div>
    );
  }

  const currentVideo = getCurrentVideo();

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Header com logo e informações */}
      <div className="tv-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-2xl">🏥</div>
            <div>
              <h1 className="text-xl font-bold text-white">TV Saúde Guarapuava</h1>
              <p className="text-sm text-blue-200">Educação em Saúde</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{time}</div>
            <div className="text-sm text-blue-200 capitalize">{date}</div>
          </div>
        </div>
      </div>

      {/* Vídeo principal */}
      {currentVideo.tipo === 'youtube' ? (
        <div className="w-full h-full">
          <YouTube
            key={`youtube-${currentVideo.id}-${forceTransition}`}
            videoId={extractYouTubeId(currentVideo.url_youtube)}
            opts={youtubeOpts}
            onReady={onYouTubeReady}
            onEnd={onYouTubeEnd}
            onError={onYouTubeError}
            className="w-full h-full"
            iframeClassName="w-full h-full"
          />
        </div>
      ) : (
        <video
          ref={videoRef}
          key={`video-${currentVideo.id}-${forceTransition}`}
          className="object-cover w-full h-full"
          autoPlay={isPlaying}
          muted
          playsInline
          onEnded={handleVideoEnd}
          onLoadedData={handleVideoLoad}
          onError={handleVideoError}
        >
          <source 
            src={getUploadsUrl(currentVideo.arquivo)} 
            type="video/mp4" 
          />
          Seu navegador não suporta reprodução de vídeo.
        </video>
      )}

      {/* Overlay com informações do vídeo */}
      <div className="video-overlay">
        <div className="flex items-end justify-between">
          <div className="flex-1">
            <h2 className="mb-2 text-2xl font-bold text-white">
              {currentVideo.titulo}
            </h2>
            {currentVideo.descricao && (
              <p className="max-w-2xl mb-2 text-blue-200">
                {currentVideo.descricao}
              </p>
            )}
            <div className="flex items-center space-x-3">
              {currentVideo.categoria && (
                <span className="inline-block px-3 py-1 text-sm text-white bg-blue-600 rounded-full">
                  {currentVideo.categoria}
                </span>
              )}
              <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                currentVideo.tipo === 'youtube' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-green-600 text-white'
              }`}>
                {currentVideo.tipo === 'youtube' ? '📺 YouTube' : '💾 Local'}
              </span>
            </div>
          </div>
          
          <div className="text-right text-white">
            {playlist && (
              <div className="mb-1 text-sm opacity-75">
                📋 {playlist.nome}
              </div>
            )}
            <div className="text-sm opacity-75">
              Vídeo {currentVideoIndex + 1} de {videos.length}
            </div>
            <div className="flex items-center mt-2 space-x-2">
              {videos.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentVideoIndex ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Indicadores de status */}
      <div className="absolute z-20 space-y-2 top-4 right-4">
        <div className="px-3 py-1 rounded-full bg-green-600/80">
          <div className="text-sm text-white">
            ✅ Transição Corrigida
          </div>
        </div>
        
        {!isPlaying && (
          <div className="px-3 py-1 rounded-full bg-yellow-500/80">
            <div className="text-sm font-medium text-white">
              ⏸️ Pausado
            </div>
          </div>
        )}
        
        <div className="px-3 py-1 rounded-full bg-black/50">
          <div className="text-sm text-white">
            🔄 Controle Remoto Ativo
          </div>
        </div>

        {messages.length > 0 && (
          <div className="px-3 py-1 rounded-full bg-purple-600/80">
            <div className="text-sm text-white">
              📢 {messages.length} Mensagem{messages.length > 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>

      {/* Letreiro de Mensagens */}
      {messages.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 z-30">
          <div className={`
            ${getMessageColor(messages[currentMessageIndex]?.tipo)}
            backdrop-blur-sm border-t-2 border-white/20 overflow-hidden
          `}>
            <div className="flex items-center py-2">
              <div className="flex items-center flex-shrink-0 px-4 space-x-2">
                <div className="text-lg">
                  {getMessageIcon(messages[currentMessageIndex]?.tipo)}
                </div>
                <span className="text-xs font-semibold tracking-wide uppercase text-white/80">
                  {messages[currentMessageIndex]?.tipo}
                </span>
              </div>
              
              <div className="flex-1 overflow-hidden">
                <div 
                  className="whitespace-nowrap animate-marquee"
                  style={{
                    animation: 'marquee 20s linear infinite'
                  }}
                >
                  <span className="mr-8 text-sm font-bold text-white">
                    {messages[currentMessageIndex]?.titulo}
                  </span>
                  <span className="mr-8 text-sm text-white/90">
                    {messages[currentMessageIndex]?.conteudo}
                  </span>
                  <span className="mr-8 text-sm font-bold text-white">
                    {messages[currentMessageIndex]?.titulo}
                  </span>
                  <span className="mr-8 text-sm text-white/90">
                    {messages[currentMessageIndex]?.conteudo}
                  </span>
                </div>
              </div>
              
              {messages.length > 1 && (
                <div className="flex items-center flex-shrink-0 px-4 space-x-2">
                  <div className="flex space-x-1">
                    {messages.map((_, index) => (
                      <div
                        key={index}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                          index === currentMessageIndex ? 'bg-white' : 'bg-white/40'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-white/70">
                    {currentMessageIndex + 1}/{messages.length}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CSS para animação de marquee */}
      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        .tv-header {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 10;
          background: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent);
          padding: 1rem;
        }
        .video-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 10;
          background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
          padding: 2rem;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Slideshow de Imagens */}
      {showImageSlideshow && images.length > 0 && (
        <div className="fixed overflow-hidden border rounded-lg shadow-2xl bottom-4 right-4 w-80 h-60 bg-black/90 border-white/20">
          <div className="relative w-full h-full">
            {/* Imagem Atual */}
            <div className="w-full h-full">
              <img
                src={getImagesUrl(images[currentImageIndex]?.arquivo)}
                alt={images[currentImageIndex]?.titulo}
                className="object-cover w-full h-full transition-opacity duration-1000"
                onError={(e) => {
                  console.error('Erro ao carregar imagem:', e.target.src);
                  e.target.style.display = 'none';
                }}
              />
            </div>

            {/* Overlay com informações */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
              <div className="text-white">
                <div className="mb-1 text-sm font-semibold truncate">
                  {images[currentImageIndex]?.titulo}
                </div>
                {images[currentImageIndex]?.descricao && (
                  <div className="text-xs text-white/80 line-clamp-2">
                    {images[currentImageIndex]?.descricao}
                  </div>
                )}
              </div>
              
              {/* Indicadores de progresso */}
              {images.length > 1 && (
                <div className="flex items-center justify-between mt-2">
                  <div className="flex space-x-1">
                    {images.map((_, index) => (
                      <div
                        key={index}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/40'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-white/70">
                    {currentImageIndex + 1}/{images.length}
                  </span>
                </div>
              )}
            </div>

            {/* Ícone de galeria */}
            <div className="absolute p-1 rounded-full top-2 right-2 bg-black/50">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
