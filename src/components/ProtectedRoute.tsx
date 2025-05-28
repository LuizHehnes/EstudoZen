import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  
  try {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-strong mx-auto mb-4 animate-pulse">
              <span className="text-white font-bold text-2xl">E</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <svg className="animate-spin h-5 w-5 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-light-text-muted dark:text-dark-text-muted">Carregando...</span>
            </div>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      // salva a localização atual p/ redirecionar depois do login
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
  } catch (error) {
    // se der erro no contexto, redireciona p/ login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
}; 