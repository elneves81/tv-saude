import React from 'react';

const LogoDitis = ({ size = 'medium', className = '' }) => {
  const sizes = {
    small: { width: 120, height: 40, fontSize: 16 },
    medium: { width: 200, height: 60, fontSize: 24 },
    large: { width: 300, height: 90, fontSize: 36 }
  };

  const currentSize = sizes[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Cruz médica com linha de dados */}
      <div className="relative" style={{ width: currentSize.height, height: currentSize.height }}>
        <svg 
          width={currentSize.height} 
          height={currentSize.height} 
          viewBox="0 0 60 60" 
          className="drop-shadow-sm"
        >
          {/* Definições de gradientes */}
          <defs>
            <linearGradient id="crossGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7dd3c0" />
              <stop offset="100%" stopColor="#5fb3a3" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4a90e2" />
              <stop offset="50%" stopColor="#357abd" />
              <stop offset="100%" stopColor="#2c5aa0" />
            </linearGradient>
          </defs>
          
          {/* Cruz médica */}
          <g>
            {/* Braço horizontal */}
            <rect x="10" y="22" width="40" height="16" rx="3" fill="url(#crossGradient)" />
            {/* Braço vertical */}
            <rect x="22" y="10" width="16" height="40" rx="3" fill="url(#crossGradient)" />
          </g>
          
          {/* Linha de dados médicos */}
          <g stroke="url(#lineGradient)" strokeWidth="2" fill="none" strokeLinecap="round">
            <path d="M 15 30 Q 25 25 35 30 T 45 30" />
            <circle cx="15" cy="30" r="2" fill="#4a90e2" />
            <circle cx="35" cy="30" r="2" fill="#357abd" />
            <circle cx="45" cy="30" r="2" fill="#2c5aa0" />
          </g>
        </svg>
      </div>
      
      {/* Texto DITIS */}
      <div className="flex flex-col">
        <div 
          className="font-bold text-slate-700"
          style={{ fontSize: currentSize.fontSize }}
        >
          DITIS
        </div>
        {size !== 'small' && (
          <div 
            className="leading-tight text-slate-600"
            style={{ fontSize: currentSize.fontSize * 0.35 }}
          >
            DEPARTAMENTO DE<br />
            INFORMAÇÃO, TECNOLOGIA E<br />
            INOVAÇÃO EM SAÚDE
          </div>
        )}
      </div>
    </div>
  );
};

export default LogoDitis;
