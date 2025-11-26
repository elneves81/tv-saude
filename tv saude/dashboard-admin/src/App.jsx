import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import VideoList from './pages/VideoList';
import VideoUpload from './pages/VideoUpload';
import VideoEdit from './pages/VideoEdit';
import Settings from './pages/Settings';
import PlaylistManager from './pages/PlaylistManager';
import PlaylistEdit from './pages/PlaylistEdit';
import RemoteControl from './pages/RemoteControl';
import Messages from './pages/Messages';
import Users from './pages/Users';
import ImageManager from './pages/ImageManager';
import LocalidadeManager from './pages/LocalidadeManager';
import StatusMonitor from './components/StatusMonitor';
import GerenciadorAvisos from './components/GerenciadorAvisos';
import Login from './pages/Login';

// Componente para proteger rotas que precisam de autenticação
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Login />;
  }

  return children;
};

// Componente principal da aplicação autenticada
const AuthenticatedApp = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        {/* Page content */}
        <main className="flex-1 p-6 overflow-x-hidden overflow-y-auto bg-gray-100">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/videos" element={<VideoList />} />
            <Route path="/upload" element={<VideoUpload />} />
            <Route path="/edit/:id" element={<VideoEdit />} />
            <Route path="/playlists" element={<PlaylistManager />} />
            <Route path="/playlists/:id/edit" element={<PlaylistEdit />} />
            <Route path="/controle" element={<RemoteControl />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/images" element={<ImageManager />} />
            <Route path="/localidades" element={<LocalidadeManager />} />
            <Route path="/avisos" element={<GerenciadorAvisos />} />
            <Route path="/status" element={<StatusMonitor />} />
            <Route path="/users" element={<Users />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ProtectedRoute>
          <AuthenticatedApp />
        </ProtectedRoute>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
