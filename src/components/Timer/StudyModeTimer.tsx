import React from 'react';
import { useStudyMode } from '../../context/StudyModeContext';
import { useStudySession } from '../../context/StudySessionContext';
import { useTimerContext } from '../../context/TimerContext';
import { X, Play, Pause, RotateCcw } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const StudyModeTimer: React.FC = () => {
  const { isStudyMode, exitStudyMode } = useStudyMode();
  const { state: sessionState, startStopwatch, pauseStopwatch, resetStopwatch } = useStudySession();
  const { state: timerState, startTimer, pauseTimer, resetTimer } = useTimerContext();
  const location = useLocation();

  if (!isStudyMode) {
    return null;
  }

  // Detecta qual tipo de timer usar baseado na página atual e estado
  const isOnStudyPage = location.pathname === '/study';
  const hasStopwatchActivity = sessionState.stopwatch.time > 0 || sessionState.stopwatch.isRunning;
  const hasPomodoroActivity = timerState.isRunning || timerState.totalSeconds !== 1500; // 1500 = 25min padrão

  // Prioriza cronômetro se estiver na página de estudo ou se houver atividade no cronômetro
  const useStopwatch = isOnStudyPage ? hasStopwatchActivity || !hasPomodoroActivity : hasStopwatchActivity;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPomodoroTime = () => {
    const hours = timerState.hours.toString().padStart(2, '0');
    const minutes = timerState.minutes.toString().padStart(2, '0');
    const seconds = timerState.seconds.toString().padStart(2, '0');
    
    if (timerState.hours > 0) {
      return `${hours}:${minutes}:${seconds}`;
    }
    return `${minutes}:${seconds}`;
  };

  const isRunning = useStopwatch ? sessionState.stopwatch.isRunning : timerState.isRunning;
  const currentTime = useStopwatch ? sessionState.stopwatch.time : 0;
  const displayTime = useStopwatch ? formatTime(currentTime) : formatPomodoroTime();
  const timerType = useStopwatch ? 'Cronômetro de Estudo' : 'Pomodoro Timer';

  const handleToggle = () => {
    if (useStopwatch) {
      if (sessionState.stopwatch.isRunning) {
        pauseStopwatch();
      } else {
        startStopwatch();
      }
    } else {
      if (timerState.isRunning) {
        pauseTimer();
      } else {
        startTimer();
      }
    }
  };

  const handleReset = () => {
    if (useStopwatch) {
      resetStopwatch();
    } else {
      resetTimer();
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 z-50 flex items-center justify-center">
      {/* Botão de sair */}
      <button
        onClick={exitStudyMode}
        className="absolute top-8 right-8 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-200 backdrop-blur-sm"
        title="Sair do modo estudo (ESC)"
      >
        <X size={24} />
      </button>

      {/* Indicador ESC */}
      <div className="absolute top-8 left-8 text-white/60 text-sm">
        Pressione <kbd className="px-2 py-1 bg-white/10 rounded">ESC</kbd> para sair
      </div>

      {/* Timer principal */}
      <div className="text-center">
        {/* Título */}
        <h1 className="text-2xl md:text-3xl font-light text-white/80 mb-8">
          {timerType}
        </h1>

        {/* Display do tempo */}
        <div className="mb-12">
          <div className="text-8xl md:text-9xl lg:text-[12rem] font-mono font-light text-white leading-none tracking-wider">
            {displayTime}
          </div>
          
          {/* Status */}
          <div className="mt-6 text-xl md:text-2xl text-white/60">
            {isRunning ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span>Em execução</span>
              </div>
            ) : (
              <span>Pausado</span>
            )}
          </div>
        </div>

        {/* Controles */}
        <div className="flex items-center justify-center space-x-8">
          {/* Play/Pause */}
          <button
            onClick={handleToggle}
            className={`p-6 rounded-full transition-all duration-200 transform hover:scale-105 ${
              isRunning
                ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border-2 border-yellow-500/50'
                : 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border-2 border-green-500/50'
            }`}
            title={isRunning ? 'Pausar' : 'Iniciar'}
          >
            {isRunning ? <Pause size={32} /> : <Play size={32} />}
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            className="p-6 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border-2 border-red-500/50 transition-all duration-200 transform hover:scale-105"
            title="Resetar"
          >
            <RotateCcw size={32} />
          </button>
        </div>

        {/* Som ativo (se houver) */}
        {sessionState.activeSound && (
          <div className="mt-12 flex items-center justify-center space-x-3 text-white/60">
            <span className="text-2xl">{sessionState.activeSound.icon}</span>
            <span className="text-lg">{sessionState.activeSound.name}</span>
            <div className="flex space-x-1 ml-2">
              <div className="w-1 h-4 bg-white/40 rounded-full animate-pulse"></div>
              <div className="w-1 h-4 bg-white/40 rounded-full animate-pulse delay-75"></div>
              <div className="w-1 h-4 bg-white/40 rounded-full animate-pulse delay-150"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 