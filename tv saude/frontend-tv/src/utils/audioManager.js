// Gerenciador de áudio para o sistema TV Saúde
class AudioManager {
  constructor() {
    this.backgroundAudio = null;
    this.videoAudio = null;
    this.audioContext = null;
    this.analyser = null;
    this.backgroundVolume = 0.3;
    this.videoVolume = 1.0;
    this.isMuted = false;
    this.isBackgroundMusicEnabled = true;
    this.currentBackgroundTrack = 'ambient-1';
    this.backgroundTracks = [
      {
        id: 'ambient-1',
        name: 'Ambiente Relaxante',
        url: '/audio/ambient-relaxing.mp3',
        description: 'Música ambiente suave para saúde'
      },
      {
        id: 'ambient-2',
        name: 'Natureza Calma',
        url: '/audio/nature-calm.mp3',
        description: 'Sons da natureza relaxantes'
      },
      {
        id: 'ambient-3',
        name: 'Meditação',
        url: '/audio/meditation.mp3',
        description: 'Música para meditação e bem-estar'
      }
    ];
  }

  // Inicializar o gerenciador de áudio
  async initialize() {
    try {
      // Criar contexto de áudio
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Criar analisador para visualização
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;
      
      console.log('🎵 AudioManager inicializado com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro ao inicializar AudioManager:', error);
      return false;
    }
  }

  // Configurar áudio de fundo
  setupBackgroundAudio(audioElement) {
    if (!audioElement) return;
    
    this.backgroundAudio = audioElement;
    this.backgroundAudio.loop = true;
    this.backgroundAudio.volume = this.backgroundVolume;
    
    // Conectar ao analisador se o contexto de áudio estiver disponível
    if (this.audioContext && this.analyser) {
      try {
        const source = this.audioContext.createMediaElementSource(this.backgroundAudio);
        source.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
      } catch (error) {
        console.warn('⚠️ Não foi possível conectar áudio de fundo ao analisador:', error);
      }
    }
    
    // Eventos do áudio de fundo
    this.backgroundAudio.addEventListener('loadstart', () => {
      console.log('🎵 Carregando áudio de fundo...');
    });
    
    this.backgroundAudio.addEventListener('canplay', () => {
      console.log('🎵 Áudio de fundo pronto para reprodução');
    });
    
    this.backgroundAudio.addEventListener('error', (e) => {
      console.error('❌ Erro no áudio de fundo:', e);
    });
  }

  // Configurar áudio do vídeo
  setupVideoAudio(videoElement) {
    if (!videoElement) return;
    
    this.videoAudio = videoElement;
    this.videoAudio.volume = this.videoVolume;
  }

  // Reproduzir áudio de fundo
  async playBackgroundMusic() {
    if (!this.backgroundAudio || !this.isBackgroundMusicEnabled) return;
    
    try {
      // Retomar contexto de áudio se necessário
      if (this.audioContext && this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      await this.backgroundAudio.play();
      console.log('🎵 Áudio de fundo iniciado');
    } catch (error) {
      console.error('❌ Erro ao reproduzir áudio de fundo:', error);
    }
  }

  // Pausar áudio de fundo
  pauseBackgroundMusic() {
    if (this.backgroundAudio) {
      this.backgroundAudio.pause();
      console.log('⏸️ Áudio de fundo pausado');
    }
  }

  // Alternar áudio de fundo
  toggleBackgroundMusic() {
    this.isBackgroundMusicEnabled = !this.isBackgroundMusicEnabled;
    
    if (this.isBackgroundMusicEnabled) {
      this.playBackgroundMusic();
    } else {
      this.pauseBackgroundMusic();
    }
    
    return this.isBackgroundMusicEnabled;
  }

  // Trocar faixa de fundo
  changeBackgroundTrack(trackId) {
    const track = this.backgroundTracks.find(t => t.id === trackId);
    if (!track || !this.backgroundAudio) return;
    
    const wasPlaying = !this.backgroundAudio.paused;
    this.currentBackgroundTrack = trackId;
    
    this.backgroundAudio.src = track.url;
    
    if (wasPlaying && this.isBackgroundMusicEnabled) {
      this.playBackgroundMusic();
    }
    
    console.log(`🎵 Faixa alterada para: ${track.name}`);
  }

  // Ajustar volume do áudio de fundo
  setBackgroundVolume(volume) {
    this.backgroundVolume = Math.max(0, Math.min(1, volume));
    if (this.backgroundAudio) {
      this.backgroundAudio.volume = this.backgroundVolume;
    }
  }

  // Ajustar volume do vídeo
  setVideoVolume(volume) {
    this.videoVolume = Math.max(0, Math.min(1, volume));
    if (this.videoAudio) {
      this.videoAudio.volume = this.videoVolume;
    }
  }

  // Silenciar/dessilenciar tudo
  toggleMute() {
    this.isMuted = !this.isMuted;
    
    if (this.backgroundAudio) {
      this.backgroundAudio.muted = this.isMuted;
    }
    
    if (this.videoAudio) {
      this.videoAudio.muted = this.isMuted;
    }
    
    return this.isMuted;
  }

  // Obter dados de frequência para visualização
  getFrequencyData() {
    if (!this.analyser) return null;
    
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);
    
    return dataArray;
  }

  // Obter nível de áudio médio
  getAudioLevel() {
    const frequencyData = this.getFrequencyData();
    if (!frequencyData) return 0;
    
    const average = frequencyData.reduce((a, b) => a + b) / frequencyData.length;
    return average / 255; // Normalizar para 0-1
  }

  // Balanceamento automático de áudio
  autoBalance() {
    if (!this.backgroundAudio || !this.videoAudio) return;
    
    // Quando há vídeo tocando, diminuir áudio de fundo
    if (!this.videoAudio.paused) {
      this.setBackgroundVolume(0.2);
    } else {
      this.setBackgroundVolume(0.4);
    }
  }

  // Obter informações do estado atual
  getState() {
    return {
      isBackgroundMusicEnabled: this.isBackgroundMusicEnabled,
      currentBackgroundTrack: this.currentBackgroundTrack,
      backgroundVolume: this.backgroundVolume,
      videoVolume: this.videoVolume,
      isMuted: this.isMuted,
      audioLevel: this.getAudioLevel(),
      availableTracks: this.backgroundTracks
    };
  }

  // Limpar recursos
  cleanup() {
    if (this.backgroundAudio) {
      this.backgroundAudio.pause();
      this.backgroundAudio = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    console.log('🧹 AudioManager limpo');
  }
}

// Instância singleton
const audioManager = new AudioManager();

export default audioManager;
