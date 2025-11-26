import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LogoDitis from './LogoDitis';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();

  const menuItems = [
    {
      path: '/',
      name: 'Dashboard',
      icon: '📊'
    },
    {
      path: '/videos',
      name: 'Gerenciar Vídeos',
      icon: '🎥'
    },
    {
      path: '/upload',
      name: 'Enviar Vídeo',
      icon: '📤'
    },
    {
      path: '/playlists',
      name: 'Playlists',
      icon: '📋'
    },
    {
      path: '/controle',
      name: 'Controle Remoto',
      icon: '📱'
    },
    {
      path: '/messages',
      name: 'Mensagens',
      icon: '📢'
    },
    {
      path: '/images',
      name: 'Imagens',
      icon: '📸'
    },
    {
      path: '/localidades',
      name: 'Localidades',
      icon: '🌍'
    },
    {
      path: '/avisos',
      name: 'Avisos Interativos',
      icon: '🎯'
    },
    {
      path: '/status',
      name: 'Status IP',
      icon: '🔍'
    },
    ...(isAdmin() ? [{
      path: '/users',
      name: 'Usuários',
      icon: '👥'
    }] : []),
    {
      path: '/settings',
      name: 'Configurações',
      icon: '⚙️'
    }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-center h-16 text-white bg-blue-600">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🏥</span>
            <div>
              <h1 className="text-lg font-bold">TV Saúde</h1>
              <p className="text-xs text-blue-200">Admin Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-8">
          <div className="px-4 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200
                  ${isActive(item.path) 
                    ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </div>
        </nav>

        {/* User info and logout */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200">
          <div className="p-4">
            <div className="flex items-center mb-3">
              <div className="flex items-center justify-center w-10 h-10 font-medium text-white bg-blue-600 rounded-full">
                {user?.nome?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0 ml-3">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.nome}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.tipo === 'admin' ? 'Administrador' : 'Operador'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-full px-3 py-2 text-sm text-gray-700 transition-colors rounded-md hover:bg-gray-100"
            >
              <span className="mr-2">🚪</span>
              Sair
            </button>
          </div>
          
          {/* Logo DITIS */}
          <div className="flex justify-center px-4 pb-2">
            <LogoDitis size="small" className="opacity-70" />
          </div>
          
          {/* Footer info */}
          <div className="px-4 pb-4 text-xs text-center text-gray-400">
            <p>Sistema TV Saúde v1.0.0</p>
            <p>Guarapuava - PR</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
