import React from 'react';
import { TimerDisplay } from './TimerDisplay';
import { PlayPauseButton } from './PlayPauseButton';
import { ResetButton } from './ResetButton';
import { LockButton } from './LockButton';

export function Timer() {
  return (
    <div className="flex flex-col items-center space-y-8 p-8">
      {/* titulo */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Pomodoro Timer
        </h1>
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
      <div className="text-center max-w-md">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          💡 <strong>Dica:</strong> Use a técnica Pomodoro: 25 minutos de foco, 5 minutos de pausa
        </p>
      </div>
    </div>
  );
} 