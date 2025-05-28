import React, { useEffect } from 'react';
import { Play, Pause, Square, RotateCcw, Maximize2 } from 'lucide-react';
import { useStudySession } from '../../context/StudySessionContext';
import { useStudyMode } from '../../context/StudyModeContext';

interface StopwatchProps {
  onTimeUpdate?: (time: number) => void;
  className?: string;
}

export const Stopwatch: React.FC<StopwatchProps> = ({ onTimeUpdate, className = '' }) => {
  const { state, startStopwatch, pauseStopwatch, resetStopwatch, recordActivity } = useStudySession();
  const { enterStudyMode } = useStudyMode();

  // Notifica mudanças de tempo para componentes pai
  useEffect(() => {
    onTimeUpdate?.(state.stopwatch.time);
  }, [state.stopwatch.time, onTimeUpdate]);

  // Registra atividade quando o cronômetro é usado
  useEffect(() => {
    if (state.stopwatch.isRunning) {
      recordActivity('Cronômetro iniciado');
    }
  }, [state.stopwatch.isRunning, recordActivity]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlay = () => {
    startStopwatch();
  };

  const handlePause = () => {
    pauseStopwatch();
  };

  const handleStop = () => {
    resetStopwatch();
    recordActivity('Cronômetro parado');
  };

  const handleReset = () => {
    resetStopwatch();
    recordActivity('Cronômetro resetado');
  };

  const handleStudyMode = () => {
    enterStudyMode();
    recordActivity('Modo estudo ativado');
  };

  return (
    <div className={`bg-light-card dark:bg-dark-card rounded-xl shadow-soft dark:shadow-dark-soft border border-light-border dark:border-dark-border p-6 ${className}`}>
      <div className="text-center">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
            Cronômetro de Sessão
          </h3>
          <button
            onClick={handleStudyMode}
            className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
            title="Modo Estudo (Tela Cheia)"
          >
            <Maximize2 size={20} />
          </button>
        </div>
        
        <div className="text-4xl font-mono font-bold text-primary-600 dark:text-primary-400 mb-6">
          {formatTime(state.stopwatch.time)}
        </div>

        <div className="flex justify-center space-x-3">
          {!state.stopwatch.isRunning ? (
            <button
              onClick={handlePlay}
              className="flex items-center justify-center w-12 h-12 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-full transition-colors"
              title="Iniciar"
            >
              <Play size={20} fill="currentColor" />
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="flex items-center justify-center w-12 h-12 bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700 text-white rounded-full transition-colors"
              title="Pausar"
            >
              <Pause size={20} fill="currentColor" />
            </button>
          )}

          <button
            onClick={handleStop}
            className="flex items-center justify-center w-12 h-12 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white rounded-full transition-colors"
            title="Parar"
          >
            <Square size={20} fill="currentColor" />
          </button>

          <button
            onClick={handleReset}
            className="flex items-center justify-center w-12 h-12 bg-light-text-muted hover:bg-light-text-secondary dark:bg-dark-text-muted dark:hover:bg-dark-text-secondary text-white rounded-full transition-colors"
            title="Resetar"
          >
            <RotateCcw size={20} />
          </button>
        </div>

        {state.stopwatch.time > 0 && (
          <div className="mt-4 text-sm text-light-text-muted dark:text-dark-text-muted">
            {state.stopwatch.isRunning ? 'Cronômetro em execução...' : 'Cronômetro pausado'}
          </div>
        )}

        {/* Indicador de sessão persistente */}
        {(state.stopwatch.isRunning || state.stopwatch.time > 0) && (
          <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-primary-700 dark:text-primary-300 font-medium">
                Sessão será mantida ao navegar entre páginas
              </span>
            </div>
          </div>
        )}

        {/* Dica sobre modo estudo */}
        <div className="mt-4 p-3 bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-800 rounded-lg">
          <div className="flex items-center justify-center space-x-2">
            <Maximize2 size={16} className="text-accent-600 dark:text-accent-400" />
            <span className="text-sm text-accent-700 dark:text-accent-300">
              Use o modo estudo para foco total
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}; 