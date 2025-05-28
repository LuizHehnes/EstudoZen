import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudySession } from '../../context/StudySessionContext';
import { Volume2, X } from 'lucide-react';

export const PersistentAudioControl: React.FC = () => {
  const { state, setActiveSound } = useStudySession();
  const navigate = useNavigate();

  // só mostra se tem som ativo
  if (!state.activeSound) {
    return null;
  }

  const handleGoToStudyPage = () => {
    navigate('/study');
  };

  const handleStopSound = () => {
    setActiveSound(null);
  };

  return (
    <div className="fixed bottom-24 left-4 z-40 animate-slide-up">
      <div 
        className="bg-light-card dark:bg-dark-card rounded-xl shadow-strong dark:shadow-dark-strong border border-light-border dark:border-dark-border p-3 cursor-pointer hover:shadow-glow-primary transition-all duration-200"
        onClick={handleGoToStudyPage}
      >
        <div className="flex items-center space-x-3">
          {/* Ícone de música com animação */}
          <div className="relative">
            <div className="p-2 rounded-lg bg-success-100 dark:bg-success-900/30">
              <Volume2 className="w-5 h-5 text-success-600 dark:text-success-400" />
            </div>
            {/* Indicador de reprodução */}
            <div className="absolute -top-1 -right-1 flex space-x-0.5">
              <div className="w-1 h-1 bg-success-500 rounded-full animate-pulse"></div>
              <div className="w-1 h-1 bg-success-500 rounded-full animate-pulse delay-75"></div>
              <div className="w-1 h-1 bg-success-500 rounded-full animate-pulse delay-150"></div>
            </div>
          </div>

          {/* Informações da música */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{state.activeSound.icon}</span>
              <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary truncate">
                {state.activeSound.name}
              </span>
            </div>
            <div className="text-xs text-light-text-muted dark:text-dark-text-muted">
              Clique para ir às músicas
            </div>
          </div>

          {/* Botão de parar */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStopSound();
            }}
            className="p-1.5 rounded-lg bg-error-100 dark:bg-error-900/30 text-error-600 dark:text-error-400 hover:bg-error-200 dark:hover:bg-error-900/50 transition-colors"
            title="Parar música"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}; 