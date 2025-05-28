import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // pega a página de origem ou usa '/' como padrão
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.error || 'Erro no login');
      }
    } catch (error) {
      setError('Erro interno do sistema');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo e título */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-strong">
              <span className="text-white font-bold text-2xl">E</span>
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-heading font-bold bg-gradient-to-r from-primary-600 to-primary-500 dark:from-primary-400 dark:to-primary-300 bg-clip-text text-transparent">
            Bem-vindo de volta
          </h2>
          <p className="mt-2 text-sm text-light-text-muted dark:text-dark-text-muted">
            Entre na sua conta para continuar estudando
          </p>
        </div>

        {/* Formulário */}
        <div className="bg-light-card dark:bg-dark-card shadow-soft dark:shadow-dark-soft rounded-2xl p-8 border border-light-border dark:border-dark-border">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg p-4">
                <div className="flex">
                  <svg className="h-5 w-5 text-error-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div className="ml-3">
                    <p className="text-sm text-error-800 dark:text-error-200">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full px-4 py-3 border border-light-border dark:border-dark-border placeholder-light-text-muted dark:placeholder-dark-text-muted text-light-text-primary dark:text-dark-text-primary bg-light-bg dark:bg-dark-bg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-all duration-200"
                  placeholder="seu@email.com"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg className="h-5 w-5 text-light-text-muted dark:text-dark-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-4 py-3 border border-light-border dark:border-dark-border placeholder-light-text-muted dark:placeholder-dark-text-muted text-light-text-primary dark:text-dark-text-primary bg-light-bg dark:bg-dark-bg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-all duration-200"
                  placeholder="Sua senha"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-light-text-muted dark:text-dark-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-light-text-muted dark:text-dark-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white gradient-primary hover:shadow-glow-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-dark-bg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Entrando...
                  </div>
                ) : (
                  'Entrar'
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-light-text-muted dark:text-dark-text-muted">
                Não tem uma conta?{' '}
                <Link
                  to="/register"
                  className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 transition-colors duration-200"
                >
                  Cadastre-se aqui
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Demonstração */}
        <div className="bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-800 rounded-lg p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-accent-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-accent-800 dark:text-accent-200">
                Demonstração
              </h3>
              <div className="mt-2 text-sm text-accent-700 dark:text-accent-300">
                <p>Email: demo@estudozen.com</p>
                <p>Senha: demo123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 