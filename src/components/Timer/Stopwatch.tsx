import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';

interface StopwatchProps {
  onTimeUpdate?: (time: number) => void;
  className?: string;
}

export const Stopwatch: React.FC<StopwatchProps> = ({ onTimeUpdate, className = '' }) => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => {
          const newTime = prevTime + 1;
          onTimeUpdate?.(newTime);
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, onTimeUpdate]);

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
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    setTime(0);
    onTimeUpdate?.(0);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    onTimeUpdate?.(0);
  };

  return (
    <div className={`bg-white rounded-xl shadow-soft p-6 ${className}`}>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">
          Cronômetro de Sessão
        </h3>
        
        <div className="text-4xl font-mono font-bold text-primary-600 mb-6">
          {formatTime(time)}
        </div>

        <div className="flex justify-center space-x-3">
          {!isRunning ? (
            <button
              onClick={handlePlay}
              className="flex items-center justify-center w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors"
              title="Iniciar"
            >
              <Play size={20} fill="currentColor" />
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="flex items-center justify-center w-12 h-12 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full transition-colors"
              title="Pausar"
            >
              <Pause size={20} fill="currentColor" />
            </button>
          )}

          <button
            onClick={handleStop}
            className="flex items-center justify-center w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
            title="Parar"
          >
            <Square size={20} fill="currentColor" />
          </button>

          <button
            onClick={handleReset}
            className="flex items-center justify-center w-12 h-12 bg-neutral-500 hover:bg-neutral-600 text-white rounded-full transition-colors"
            title="Resetar"
          >
            <RotateCcw size={20} />
          </button>
        </div>

        {time > 0 && (
          <div className="mt-4 text-sm text-neutral-600">
            {isRunning ? 'Cronômetro em execução...' : 'Cronômetro pausado'}
          </div>
        )}
      </div>
    </div>
  );
}; 