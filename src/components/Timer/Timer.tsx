import { TimerDisplay } from './TimerDisplay';
import { PlayPauseButton } from './PlayPauseButton';
import { ResetButton } from './ResetButton';
import { LockButton } from './LockButton';
import { useStudyMode } from '../../context/StudyModeContext';
import { Maximize2 } from 'lucide-react';

export function Timer() {
  const { enterStudyMode } = useStudyMode();

  const handleStudyMode = () => {
    enterStudyMode();
  };

  return (
    <div className="flex flex-col items-center space-y-8 p-8">
      {/* titulo */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-4 mb-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Pomodoro Timer
          </h1>
          <button
            onClick={handleStudyMode}
            className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
            title="Modo Estudo (Tela Cheia)"
          >
            <Maximize2 size={20} />
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Mantenha o foco e seja mais produtivo
        </p>
      </div>

      {/* display do timer */}
      <TimerDisplay />

      {/* controles */}
      <div className="flex items-center space-x-6">
        <PlayPauseButton />
        <ResetButton />
        <LockButton />
      </div>

      {/* dicas */}
      <div className="text-center max-w-md space-y-3">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          💡 <strong>Dica:</strong> Use a técnica Pomodoro: 25 minutos de foco, 5 minutos de pausa
        </p>
        <div className="flex items-center justify-center space-x-2 text-sm text-accent-600 dark:text-accent-400">
          <Maximize2 size={16} />
          <span>Clique no ícone para entrar no modo estudo</span>
        </div>
      </div>
    </div>
  );
} 