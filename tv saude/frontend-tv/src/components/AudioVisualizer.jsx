import React, { useEffect, useRef, useState } from 'react';

const AudioVisualizer = ({ 
  audioRef, 
  isActive = true, 
  type = 'bars', 
  color = '#00ff88',
  size = 'medium',
  position = 'bottom-right'
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const [audioContext, setAudioContext] = useState(null);

  // Configurações baseadas no tamanho
  const sizeConfig = {
    small: { width: 120, height: 40, barWidth: 3, barGap: 1 },
    medium: { width: 200, height: 60, barWidth: 4, barGap: 2 },
    large: { width: 300, height: 80, barWidth: 5, barGap: 2 }
  };

  const config = sizeConfig[size] || sizeConfig.medium;

  // Configurações de posição
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'center': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
  };

  useEffect(() => {
    if (!audioRef?.current || !isActive) return;

    const setupAudioContext = async () => {
      try {
        // Criar contexto de áudio
        const context = new (window.AudioContext || window.webkitAudioContext)();
        
        // Criar analisador
        const analyser = context.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        
        // Conectar fonte de áudio
        const source = context.createMediaElementSource(audioRef.current);
        source.connect(analyser);
        analyser.connect(context.destination);
        
        // Configurar dados
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        setAudioContext(context);
        analyserRef.current = analyser;
        dataArrayRef.current = dataArray;
        
        // Iniciar animação
        animate();
        
      } catch (error) {
        console.warn('Erro ao configurar visualizador de áudio:', error);
      }
    };

    setupAudioContext();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [audioRef, isActive]);

  const animate = () => {
    if (!analyserRef.current || !dataArrayRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Obter dados de frequência
    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    
    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (type === 'bars') {
      drawBars(ctx, canvas);
    } else if (type === 'wave') {
      drawWave(ctx, canvas);
    } else if (type === 'circle') {
      drawCircle(ctx, canvas);
    }
    
    animationRef.current = requestAnimationFrame(animate);
  };

  const drawBars = (ctx, canvas) => {
    const barCount = Math.floor(canvas.width / (config.barWidth + config.barGap));
    const step = Math.floor(dataArrayRef.current.length / barCount);
    
    for (let i = 0; i < barCount; i++) {
      const barHeight = (dataArrayRef.current[i * step] / 255) * canvas.height;
      const x = i * (config.barWidth + config.barGap);
      const y = canvas.height - barHeight;
      
      // Gradiente de cor baseado na altura
      const gradient = ctx.createLinearGradient(0, y, 0, canvas.height);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, color + '40');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, config.barWidth, barHeight);
    }
  };

  const drawWave = (ctx, canvas) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const sliceWidth = canvas.width / dataArrayRef.current.length;
    let x = 0;
    
    for (let i = 0; i < dataArrayRef.current.length; i++) {
      const v = dataArrayRef.current[i] / 128.0;
      const y = (v * canvas.height) / 2;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      
      x += sliceWidth;
    }
    
    ctx.stroke();
  };

  const drawCircle = (ctx, canvas) => {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    
    // Calcular média dos dados de frequência
    const average = dataArrayRef.current.reduce((a, b) => a + b) / dataArrayRef.current.length;
    const normalizedAverage = average / 255;
    
    // Círculo externo (base)
    ctx.strokeStyle = color + '40';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Círculo interno (reativo)
    const reactiveRadius = radius * (0.3 + normalizedAverage * 0.7);
    ctx.fillStyle = color + '80';
    ctx.beginPath();
    ctx.arc(centerX, centerY, reactiveRadius, 0, 2 * Math.PI);
    ctx.fill();
    
    // Barras radiais
    const barCount = 32;
    for (let i = 0; i < barCount; i++) {
      const angle = (i / barCount) * 2 * Math.PI;
      const dataIndex = Math.floor((i / barCount) * dataArrayRef.current.length);
      const barLength = (dataArrayRef.current[dataIndex] / 255) * (radius * 0.3);
      
      const startX = centerX + Math.cos(angle) * (radius - barLength);
      const startY = centerY + Math.sin(angle) * (radius - barLength);
      const endX = centerX + Math.cos(angle) * radius;
      const endY = centerY + Math.sin(angle) * radius;
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }
  };

  if (!isActive) return null;

  return (
    <div className={`absolute z-20 ${positionClasses[position]} pointer-events-none`}>
      <div className="p-2 rounded-lg bg-black/30 backdrop-blur-sm">
        <canvas
          ref={canvasRef}
          width={config.width}
          height={config.height}
          className="rounded"
          style={{ 
            filter: 'drop-shadow(0 0 10px rgba(0, 255, 136, 0.3))',
            background: 'rgba(0, 0, 0, 0.2)'
          }}
        />
        <div className="mt-1 text-xs text-center text-white/70">
          🎵 Audio
        </div>
      </div>
    </div>
  );
};

export default AudioVisualizer;
