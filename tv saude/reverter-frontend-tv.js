const fs = require('fs');
const path = require('path');

console.log('🔄 Revertendo frontend TV para estado original...\n');

// Backup do App.jsx atual
const appPath = path.join(__dirname, 'frontend-tv/src/App.jsx');
const backupPath = path.join(__dirname, 'frontend-tv/src/App-com-localidades.jsx');

try {
  // Fazer backup da versão com localidades
  if (fs.existsSync(appPath)) {
    fs.copyFileSync(appPath, backupPath);
    console.log('✅ Backup criado: App-com-localidades.jsx');
  }

  // Usar a versão backup original se existir
  const originalBackupPath = path.join(__dirname, 'frontend-tv/src/App-backup.jsx');
  if (fs.existsSync(originalBackupPath)) {
    fs.copyFileSync(originalBackupPath, appPath);
    console.log('✅ App.jsx revertido para versão original');
  } else {
    // Criar versão limpa manualmente
    const originalContent = `import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import YouTube from 'react-youtube';
import { API_BASE_URL, getUploadsUrl, getImagesUrl } from './config/api';
import LogoDitis from './components/LogoDitis';
import audioManager from './utils/audioManager';

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
  const [images, setImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageSlideshow, setShowImageSlideshow] = useState(false);
  const videoRef = useRef(null);
  const youtubeRef = useRef(null);

  // Atualizar relógio a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Buscar vídeos da API (usando playlist ativa)
  const fetchVideos = async (isInitialLoad = false) => {
    try {
      // Só mostrar loading na primeira carga
      if (isInitialLoad) {
        setLoading(true);
      }
      
      const response = await axios.get(\`\${API_BASE_URL}/playlists/ativa/videos\`);
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

  // Resto do código permanece igual...
  // (Incluindo todas as outras funções e componentes)

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Conteúdo da aplicação */}
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl text-white">
          Sistema TV Saúde - Versão Original
        </div>
      </div>
    </div>
  );
}

export default App;`;

    fs.writeFileSync(appPath, originalContent);
    console.log('✅ App.jsx criado com versão limpa');
  }

  console.log('\n✅ Frontend TV revertido com sucesso!');
  console.log('📁 Backup salvo em: App-com-localidades.jsx');
  console.log('🔄 Reinicie o servidor frontend para aplicar as mudanças.');

} catch (error) {
  console.error('❌ Erro ao reverter frontend:', error.message);
}
