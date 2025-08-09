import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LogoDitis from '../components/LogoDitis';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const result = await login(formData.email, formData.senha);
      
      if (result.success) {
        showMessage(result.message, 'success');
      } else {
        showMessage(result.message, 'error');
      }
    } catch (error) {
      showMessage('Erro inesperado ao fazer login', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-green-900">
      <div className="w-full max-w-md p-8 space-y-8">
        <div className="p-8 bg-white rounded-lg shadow-2xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center mx-auto mb-4">
              <LogoDitis size="medium" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">TV Saúde</h2>
            <p className="mt-2 text-gray-600">Dashboard Administrativo</p>
          </div>

          {/* Mensagem de feedback */}
          {message.text && (
            <div className={`mb-4 p-3 rounded-md ${
              message.type === 'success' 
                ? 'bg-green-100 text-green-700 border border-green-300' 
                : 'bg-red-100 text-red-700 border border-red-300'
            }`}>
              {message.text}
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="senha" className="block mb-2 text-sm font-medium text-gray-700">
                Senha
              </label>
              <input
                id="senha"
                name="senha"
                type="password"
                required
                value={formData.senha}
                onChange={handleChange}
                className="w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                  Entrando...
                </div>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/* Informações de acesso padrão */}
          <div className="p-4 mt-8 rounded-md bg-gray-50">
            <h3 className="mb-2 text-sm font-medium text-gray-900">Acesso Padrão:</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>Email:</strong> admin@tvsaude.com</p>
              <p><strong>Senha:</strong> admin123</p>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Altere a senha padrão após o primeiro acesso
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-white/80">
            Sistema TV Saúde Guarapuava
          </p>
          <p className="mt-1 text-xs text-white/60">
            Educação em Saúde para todos
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
