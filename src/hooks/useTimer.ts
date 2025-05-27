import { useTimerContext } from '../context/TimerContext';

export function useTimer() {
  const { state, startTimer, pauseTimer, resetTimer, setTime } = useTimerContext();

  const toggleTimer = () => {
    if (state.isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  };

  const formatTime = (value: number): string => {
    return value.toString().padStart(2, '0');
  };

  const formatDisplay = () => {
    return {
      hours: formatTime(state.hours),
      minutes: formatTime(state.minutes),
      seconds: formatTime(state.seconds),
      display: `${formatTime(state.hours)}:${formatTime(state.minutes)}:${formatTime(state.seconds)}`,
    };
  };

  const isFinished = state.totalSeconds === 0;
  const progress = state.totalSeconds > 0 ? 
    ((state.hours * 3600 + state.minutes * 60 + state.seconds - state.totalSeconds) / 
     (state.hours * 3600 + state.minutes * 60 + state.seconds)) * 100 : 0;

  return {
    ...state,
    toggleTimer,
    resetTimer,
    setTime,
    formatDisplay,
    isFinished,
    progress,
  };
} 