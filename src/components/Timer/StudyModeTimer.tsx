import React, { useState, useEffect } from 'react';
import { useStudyMode } from '../../context/StudyModeContext';
import { useStudySession } from '../../context/StudySessionContext';
import { useTimerContext } from '../../context/TimerContext';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  Timer as TimerIcon, 
  Volume2, 
  Repeat, 
  XCircle, 
  ChevronUp, 
  ChevronDown
} from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const StudyModeTimer: React.FC = () => {
  const { isStudyMode, exitStudyMode } = useStudyMode();
  const { state: sessionState, startStopwatch, pauseStopwatch, resetStopwatch, setActiveSound } = useStudySession();
  const { state: timerState, startTimer, pauseTimer, resetTimer } = useTimerContext();
  const { 
    sounds, 
    toggleSound, 
    setVolume, 
    getVolume, 
    isPlaying 
  } = useAudioPlayer();
  
  const location = useLocation();

  // Estado para controlar se usamos cronômetro ou pomodoro
  const [timerMode, setTimerMode] = useState<'stopwatch' | 'pomodoro'>('stopwatch');
  
  // Estado para controlar o painel de sons
  const [isSoundPanelOpen, setIsSoundPanelOpen] = useState(false);
  
  // Estado para repetição de sons
  const [soundsLooping, setSoundsLooping] = useState(true);

  // Atualiza o modo do temporizador baseado no estado inicial
  useEffect(() => {
    const isOnStudyPage = location.pathname === '/study';
    const hasStopwatchActivity = sessionState.stopwatch.time > 0 || sessionState.stopwatch.isRunning;
    const hasPomodoroActivity = timerState.isRunning || timerState.totalSeconds !== 1500;

    // Define o modo inicial baseado na atividade atual
    if (isOnStudyPage) {
      if (hasPomodoroActivity && !hasStopwatchActivity) {
        setTimerMode('pomodoro');
      } else {
        setTimerMode('stopwatch');
      }
    } else {
      setTimerMode(hasStopwatchActivity ? 'stopwatch' : 'pomodoro');
    }
  }, [location.pathname, sessionState.stopwatch, timerState]);

  if (!isStudyMode) {
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

  const formatPomodoroTime = () => {
    const hours = timerState.hours.toString().padStart(2, '0');
    const minutes = timerState.minutes.toString().padStart(2, '0');
    const seconds = timerState.seconds.toString().padStart(2, '0');
    
    if (timerState.hours > 0) {
      return `${hours}:${minutes}:${seconds}`;
    }
    return `${minutes}:${seconds}`;
  };

  const isRunning = timerMode === 'stopwatch' ? sessionState.stopwatch.isRunning : timerState.isRunning;
  const currentTime = timerMode === 'stopwatch' ? sessionState.stopwatch.time : 0;
  const displayTime = timerMode === 'stopwatch' ? formatTime(currentTime) : formatPomodoroTime();
  const timerType = timerMode === 'stopwatch' ? 'Cronômetro de Estudo' : 'Pomodoro Timer';

  const handleToggle = () => {
    if (timerMode === 'stopwatch') {
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
    if (timerMode === 'stopwatch') {
      resetStopwatch();
    } else {
      resetTimer();
    }
  };

  const handleVolumeChange = (soundId: string, newVolume: number) => {
    setVolume(soundId, newVolume);
    
    // atualiza o som ativo no contexto da sessão se for o mesmo
    if (sessionState.activeSound && sessionState.activeSound.id === soundId) {
      setActiveSound({
        ...sessionState.activeSound,
        volume: newVolume
      });
    }
  };
  
  const toggleSoundLooping = () => {
    // implementa a lógica de loop para os sons
    setSoundsLooping(!soundsLooping);
    
    // atualiza todos os elementos de áudio no DOM
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      audio.loop = !soundsLooping;
    });
  };

  // filtra só os sons ambientes para o painel
  const ambientSounds = sounds.filter(sound => 
    sound.category === 'nature' || 
    sound.category === 'white-noise' ||
    sound.category === 'instrumental'
  );

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

      {/* indicador ESC */}
      <div className="absolute top-8 left-8 text-white/60 text-sm">
        Pressione <kbd className="px-2 py-1 bg-white/10 rounded">ESC</kbd> para sair
      </div>

      {/* Seletor de modo (cronômetro/pomodoro) */}
      <div className="absolute top-24 left-1/2 transform -translate-x-1/2 flex bg-white/5 backdrop-blur-md rounded-full p-1.5 space-x-1">
        <button
          onClick={() => setTimerMode('stopwatch')}
          className={`px-4 py-2 rounded-full flex items-center space-x-2 ${
            timerMode === 'stopwatch' 
              ? 'bg-white/20 text-white shadow-glow-white' 
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          <Clock size={18} />
          <span>Cronômetro</span>
        </button>
        <button
          onClick={() => setTimerMode('pomodoro')}
          className={`px-4 py-2 rounded-full flex items-center space-x-2 ${
            timerMode === 'pomodoro' 
              ? 'bg-white/20 text-white shadow-glow-white' 
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          <TimerIcon size={18} />
          <span>Pomodoro</span>
        </button>
      </div>

      {/* timer principal */}
      <div className="text-center">
        {/* título */}
        <h1 className="text-2xl md:text-3xl font-light text-white/80 mb-8">
          {timerType}
        </h1>

        {/* display do tempo */}
        <div className="mb-12">
          <div className="text-8xl md:text-9xl lg:text-[12rem] font-mono font-light text-white leading-none tracking-wider">
            {displayTime}
          </div>
          
          {/* status */}
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

        {/* controles */}
        <div className="flex items-center justify-center space-x-8">
          {/* play/pause */}
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

        {/* Botão para expandir painel de sons */}
        <div className="mt-12">
          <button
            onClick={() => setIsSoundPanelOpen(!isSoundPanelOpen)}
            className="flex items-center justify-center space-x-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-white/80 transition-all duration-200"
          >
            <Volume2 size={18} />
            <span>Sons Ambiente</span>
            {isSoundPanelOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>

        {/* Painel de sons (expandido/recolhido) */}
        {isSoundPanelOpen && (
          <div className="mt-6 bg-black/20 backdrop-blur-sm rounded-xl p-6 max-w-3xl mx-auto animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl text-white/80">Sons Ambiente</h3>
              <div className="flex space-x-3">
                <button
                  onClick={toggleSoundLooping}
                  className={`p-2 rounded-lg ${
                    soundsLooping ? 'bg-primary-500/30 text-primary-400' : 'bg-white/10 text-white/60'
                  }`}
                  title={soundsLooping ? 'Desativar repetição' : 'Ativar repetição'}
                >
                  {soundsLooping ? <Repeat size={20} /> : <XCircle size={20} />}
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {ambientSounds.map(sound => (
                <div 
                  key={sound.id}
                  className={`p-3 rounded-lg transition-all duration-200 ${
                    isPlaying(sound.id) 
                      ? 'bg-primary-500/20 border border-primary-500/40' 
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{sound.icon}</span>
                      <span className={isPlaying(sound.id) ? 'text-primary-300' : 'text-white/80'}>
                        {sound.name}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleSound(sound.id)}
                      className={`p-1.5 rounded-full ${
                        isPlaying(sound.id) 
                          ? 'bg-primary-500/30 text-primary-300' 
                          : 'bg-white/10 text-white/60 hover:bg-white/20'
                      }`}
                    >
                      {isPlaying(sound.id) ? <Pause size={18} /> : <Play size={18} />}
                    </button>
                  </div>
                  
                  {/* Controle de volume */}
                  <div className="flex items-center space-x-2 mt-2">
                    <Volume2 size={14} className="text-white/60" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={getVolume(sound.id)}
                      onChange={(e) => handleVolumeChange(sound.id, parseFloat(e.target.value))}
                      className="w-full h-1.5 appearance-none bg-white/20 rounded-full outline-none 
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 
                        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Som ativo indicador (quando painel fechado) */}
        {!isSoundPanelOpen && sessionState.activeSound && (
          <div className="mt-8 flex items-center justify-center space-x-3 text-white/60 animate-fade-in">
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