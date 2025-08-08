import React, { useState, useEffect } from 'react';

const Header = ({ onMenuClick }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date) => {
    return {
      time: date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
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

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side - Menu button and title */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Dashboard Administrativo
            </h1>
            <p className="text-sm text-gray-500">
              Sistema de Gerenciamento TV Saúde
            </p>
          </div>
        </div>

        {/* Right side - Date/Time and status */}
        <div className="flex items-center space-x-6">
          {/* Status indicator */}
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Sistema Online</span>
          </div>

          {/* Date and time */}
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-900">{time}</div>
            <div className="text-sm text-gray-500 capitalize">{date}</div>
          </div>

          {/* User menu */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">A</span>
            </div>
            <div className="hidden md:block">
              <div className="text-sm font-medium text-gray-900">Administrador</div>
              <div className="text-xs text-gray-500">TV Saúde Guarapuava</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
