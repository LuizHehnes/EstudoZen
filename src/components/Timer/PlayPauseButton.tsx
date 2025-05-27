import React from 'react';
import { useTimer } from '../../hooks/useTimer';

export function PlayPauseButton() {
  const { isRunning, toggleTimer, isFinished } = useTimer();

  return (
    <button
      onClick={toggleTimer}
      disabled={isFinished}
      className={`
        relative flex items-center justify-center
        w-16 h-16 rounded-full
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-4 focus:ring-opacity-50
        disabled:opacity-50 disabled:cursor-not-allowed
        ${isRunning 
          ? 'bg-red-500 hover:bg-red-600 focus:ring-red-300 shadow-lg shadow-red-500/25' 
          : 'bg-green-500 hover:bg-green-600 focus:ring-green-300 shadow-lg shadow-green-500/25'
        }
        transform hover:scale-105 active:scale-95
      `}
      aria-label={isRunning ? 'Pausar timer' : 'Iniciar timer'}
    >
      {isRunning ? (
        <div className="flex space-x-1">
          <div className="w-1.5 h-6 bg-white rounded-sm"></div>
          <div className="w-1.5 h-6 bg-white rounded-sm"></div>
        </div>
      ) : (
        <div className="w-0 h-0 border-l-[12px] border-l-white border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1"></div>
      )}
      
      {/* ripple */}
      <div className={`
        absolute inset-0 rounded-full
        ${isRunning ? 'bg-red-400' : 'bg-green-400'}
        opacity-0 animate-ping
      `}></div>
    </button>
  );
} 