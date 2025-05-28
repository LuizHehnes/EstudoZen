import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudySession } from '../../context/StudySessionContext';
import { Clock, Play, Pause, X, Maximize2 } from 'lucide-react';

export const PersistentIndicator: React.FC = () => {
  const { state, pauseStopwatch, startStopwatch, toggleVisibility } = useStudySession();
  const navigate = useNavigate();

  // só mostra o indicador se tem cronômetro ativo (não mostra mais p/ áudio)
  if (!state.isVisible && !state.stopwatch.isRunning && state.stopwatch.time === 0) {
    return null;
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleGoToStudyPage = () => {
    navigate('/study');
  };

  const handleToggleStopwatch = () => {
    if (state.stopwatch.isRunning) {
      pauseStopwatch();
    } else {
      startStopwatch();
    }
  };

  return (
    <div className="fixed bottom-20 right-4 z-40 animate-slide-up">
      <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-strong dark:shadow-dark-strong border border-light-border dark:border-dark-border p-4 max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
              Cronômetro Ativo
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={handleGoToStudyPage}
              className="p-1 text-light-text-muted dark:text-dark-text-muted hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              title="Ir para Área de Estudo"
            >
              <Maximize2 size={16} />
            </button>
            <button
              onClick={toggleVisibility}
              className="p-1 text-light-text-muted dark:text-dark-text-muted hover:text-error-600 dark:hover:text-error-400 transition-colors"
              title="Minimizar"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Cronômetro */}
        <div className="flex items-center justify-between p-3 bg-light-surface dark:bg-dark-surface rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
              <Clock className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <div className="text-lg font-mono font-bold text-light-text-primary dark:text-dark-text-primary">
                {formatTime(state.stopwatch.time)}
              </div>
              <div className="text-xs text-light-text-muted dark:text-dark-text-muted">
                {state.stopwatch.isRunning ? 'Em execução' : 'Pausado'}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleToggleStopwatch}
              className={`p-2 rounded-lg transition-colors ${
                state.stopwatch.isRunning
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50'
                  : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
              }`}
              title={state.stopwatch.isRunning ? 'Pausar' : 'Continuar'}
            >
              {state.stopwatch.isRunning ? <Pause size={16} /> : <Play size={16} />}
            </button>
          </div>
        </div>

        {/* Botão para ir à página de estudo */}
        <button
          onClick={handleGoToStudyPage}
          className="w-full mt-3 px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors text-sm font-medium"
        >
          Ir para Área de Estudo
        </button>
      </div>
    </div>
  );
}; 