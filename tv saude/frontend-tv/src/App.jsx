import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import YouTube from 'react-youtube';
import { API_BASE_URL, getUploadsUrl } from './config/api';

function App() {
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
  const videoRef = useRef(null);
  const youtubeRef = useRef(null);

  // Atualizar relógio a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Buscar vídeos da API (agora usando playlist ativa)
  const fetchVideos = async (isInitialLoad = false) => {
    try {
      // Só mostrar loading na primeira carga
      if (isInitialLoad) {
        setLoading(true);
      }
      
      const response = await axios.get(`${API_BASE_URL}/playlists/ativa/videos`);
      if (response.data && response.data.videos && response.data.videos.length > 0) {
        setVideos(response.data.videos);
        setPlaylist(response.data.playlist);
        setError(null);
      } else {
        // Só mostrar erro se não há vídeos carregados anteriormente
        if (videos.length === 0) {
          setError('Nenhum vídeo encontrado');
        }
      }
    } catch (err) {
      console.error('Erro ao buscar vídeos:', err);
      // Só mostrar erro se não há vídeos carregados anteriormente
      if (videos.length === 0) {
        setError('Erro ao conectar com o servidor');
      }
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      }
    }
  };

  // Verificar comandos do controle remoto
  const checkRemoteCommands = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/controle/ultimo`);
      const command = response.data;
      
      if (command && command.id !== lastCommandId) {
        setLastCommandId(command.id);
        executeCommand(command.comando, command.parametros);
      }
    } catch (err) {
      console.error('Erro ao verificar comandos:', err);
    }
  };

  // Obter vídeo atual
  const getCurrentVideo = () => {
    return videos[currentVideoIndex];
  };

  // Executar comando do controle remoto
  const executeCommand = (comando, parametros) => {
    console.log('Executando comando:', comando, parametros);
    
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
        nextVideo();
        break;
        
      case 'previous':
        previousVideo();
        break;
        
      case 'restart':
        if (getCurrentVideo()?.tipo === 'youtube' && youtubeRef.current) {
          youtubeRef.current.seekTo(0);
        } else if (videoRef.current) {
          videoRef.current.currentTime = 0;
        }
        break;
        
      case 'reload_playlist':
        fetchVideos(false);
        break;
        
      case 'refresh':
        window.location.reload();
        break;
        
      case 'emergency_stop':
        setIsPlaying(false);
        if (getCurrentVideo()?.tipo === 'youtube' && youtubeRef.current) {
          youtubeRef.current.pauseVideo();
        } else if (videoRef.current) {
          videoRef.current.pause();
        }
        break;
        
      case 'volume_up':
        if (videoRef.current) {
          videoRef.current.volume = Math.min(1, videoRef.current.volume + 0.1);
        }
        break;
        
      case 'volume_down':
        if (videoRef.current) {
          videoRef.current.volume = Math.max(0, videoRef.current.volume - 0.1);
        }
        break;
        
      case 'mute':
        if (videoRef.current) {
          videoRef.current.muted = !videoRef.current.muted;
        }
        break;
    }
  };

  // Buscar mensagens ativas
  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/mensagens`);
      setMessages(response.data || []);
    } catch (err) {
      console.error('Erro ao buscar mensagens:', err);
    }
  };

  // Carregar vídeos ao iniciar
  useEffect(() => {
    fetchVideos(true); // Primeira carga com loading
    fetchMessages();
    
    // Recarregar vídeos a cada 10 segundos para atualização mais rápida (sem loading)
    const videoInterval = setInterval(() => fetchVideos(false), 10 * 1000);
    
    // Verificar comandos a cada 2 segundos
    const commandInterval = setInterval(checkRemoteCommands, 2000);
    
    // Buscar mensagens a cada 10 segundos
    const messagesInterval = setInterval(fetchMessages, 10 * 1000);
    
    return () => {
      clearInterval(videoInterval);
      clearInterval(commandInterval);
      clearInterval(messagesInterval);
    };
  }, []);

  // Rotacionar mensagens a cada 5 segundos
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

  // Verificar comandos quando lastCommandId muda
  useEffect(() => {
    if (lastCommandId === null) {
      checkRemoteCommands();
    }
  }, [lastCommandId]);

  // Avançar para próximo vídeo
  const nextVideo = () => {
    if (videos.length > 0) {
      setCurrentVideoIndex((prevIndex) => 
        prevIndex === videos.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  // Voltar para vídeo anterior
  const previousVideo = () => {
    if (videos.length > 0) {
      setCurrentVideoIndex((prevIndex) => 
        prevIndex === 0 ? videos.length - 1 : prevIndex - 1
      );
    }
  };

  // Quando o vídeo terminar, avançar para o próximo
  const handleVideoEnd = () => {
    nextVideo();
  };

  // Quando o vídeo carregar, reproduzir automaticamente
  const handleVideoLoad = () => {
    if (isPlaying && videoRef.current) {
      videoRef.current.play().catch(console.error);
    }
  };

  // Configurações do YouTube Player
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

  // Eventos do YouTube Player
  const onYouTubeReady = (event) => {
    youtubeRef.current = event.target;
    if (isPlaying) {
      event.target.playVideo();
    }
  };

  const onYouTubeEnd = () => {
    nextVideo();
  };

  const onYouTubeError = (error) => {
    console.error('Erro no YouTube:', error);
    nextVideo();
  };

  // Extrair ID do YouTube da URL
  const extractYouTubeId = (url) => {
    if (!url) return null;
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

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

  // Função para obter ícone do tipo de mensagem
  const getMessageIcon = (tipo) => {
    switch (tipo) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'urgent': return '🚨';
      default: return 'ℹ️';
    }
  };

  // Função para obter cor do tipo de mensagem
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
          key={currentVideo.id}
          className="object-cover w-full h-full"
          autoPlay={isPlaying}
          muted
          onEnded={handleVideoEnd}
          onLoadedData={handleVideoLoad}
          onError={(e) => {
            console.error('Erro no vídeo:', e);
            nextVideo();
          }}
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

      {/* Letreiro de Mensagens - Ticker na parte inferior */}
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
                  {/* Repetir o conteúdo para efeito contínuo */}
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
      <style jsx>{`
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
      `}</style>

      {/* Indicadores de status */}
      <div className="absolute z-20 space-y-2 top-4 right-4">
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
    </div>
  );
}

export default App;
