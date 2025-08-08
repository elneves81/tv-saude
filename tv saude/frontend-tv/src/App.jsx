import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

function App() {
  const [videos, setVideos] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const videoRef = useRef(null);

  // Atualizar relógio a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Buscar vídeos da API
  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/videos`);
      if (response.data && response.data.length > 0) {
        setVideos(response.data);
        setError(null);
      } else {
        setError('Nenhum vídeo encontrado');
      }
    } catch (err) {
      console.error('Erro ao buscar vídeos:', err);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  // Carregar vídeos ao iniciar
  useEffect(() => {
    fetchVideos();
    
    // Recarregar vídeos a cada 5 minutos
    const interval = setInterval(fetchVideos, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Avançar para próximo vídeo
  const nextVideo = () => {
    if (videos.length > 0) {
      setCurrentVideoIndex((prevIndex) => 
        prevIndex === videos.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  // Quando o vídeo terminar, avançar para o próximo
  const handleVideoEnd = () => {
    nextVideo();
  };

  // Quando o vídeo carregar, reproduzir automaticamente
  const handleVideoLoad = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(console.error);
    }
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

  // Tela de loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-green-900">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">TV Saúde Guarapuava</h2>
          <p className="text-blue-200">Carregando conteúdo educativo...</p>
        </div>
      </div>
    );
  }

  // Tela de erro
  if (error || videos.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-900 to-orange-900">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">📺</div>
          <h2 className="text-3xl font-bold text-white mb-4">TV Saúde Guarapuava</h2>
          <p className="text-red-200 mb-6">
            {error || 'Nenhum vídeo disponível no momento'}
          </p>
          <div className="text-white">
            <div className="text-4xl font-bold">{time}</div>
            <div className="text-lg capitalize">{date}</div>
          </div>
          <p className="text-red-300 mt-4 text-sm">
            Verifique a conexão ou contate o administrador
          </p>
        </div>
      </div>
    );
  }

  const currentVideo = videos[currentVideoIndex];

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Header com logo e informações */}
      <div className="tv-header">
        <div className="flex justify-between items-center">
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
      <video
        ref={videoRef}
        key={currentVideo.id}
        className="w-full h-full object-cover"
        autoPlay
        muted
        onEnded={handleVideoEnd}
        onLoadedData={handleVideoLoad}
        onError={(e) => {
          console.error('Erro no vídeo:', e);
          nextVideo();
        }}
      >
        <source 
          src={`http://localhost:3001/uploads/${currentVideo.arquivo}`} 
          type="video/mp4" 
        />
        Seu navegador não suporta reprodução de vídeo.
      </video>

      {/* Overlay com informações do vídeo */}
      <div className="video-overlay">
        <div className="flex justify-between items-end">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">
              {currentVideo.titulo}
            </h2>
            {currentVideo.descricao && (
              <p className="text-blue-200 mb-2 max-w-2xl">
                {currentVideo.descricao}
              </p>
            )}
            {currentVideo.categoria && (
              <span className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                {currentVideo.categoria}
              </span>
            )}
          </div>
          
          <div className="text-right text-white">
            <div className="text-sm opacity-75">
              Vídeo {currentVideoIndex + 1} de {videos.length}
            </div>
            <div className="flex items-center space-x-2 mt-2">
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

      {/* Indicador de carregamento do próximo vídeo */}
      <div className="absolute top-4 right-4 z-20">
        <div className="bg-black/50 rounded-full p-2">
          <div className="text-white text-sm">
            🔄 Próximo em alguns segundos...
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
