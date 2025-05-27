import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import localforage from 'localforage';

interface TimerState {
  hours: number;
  minutes: number;
  seconds: number;
  isRunning: boolean;
  totalSeconds: number;
  mode: string;
}

interface TimerContextType {
  state: TimerState;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  setTime: (hours: number, minutes: number, seconds: number) => void;
}

type TimerAction =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESET' }
  | { type: 'TICK' }
  | { type: 'SET_TIME'; payload: { hours: number; minutes: number; seconds: number } };

const initialState: TimerState = {
  hours: 0,
  minutes: 25,
  seconds: 0,
  isRunning: false,
  totalSeconds: 1500, // 25 minutos padrão
  mode: 'work',
};

function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'START':
      return { ...state, isRunning: true };
    case 'PAUSE':
      return { ...state, isRunning: false };
    case 'RESET':
      return {
        ...state,
        isRunning: false,
        totalSeconds: state.hours * 3600 + state.minutes * 60 + state.seconds,
      };
    case 'TICK':
      if (state.totalSeconds <= 0) {
        return { ...state, isRunning: false, totalSeconds: 0 };
      }
      const newTotalSeconds = state.totalSeconds - 1;
      return {
        ...state,
        totalSeconds: newTotalSeconds,
        hours: Math.floor(newTotalSeconds / 3600),
        minutes: Math.floor((newTotalSeconds % 3600) / 60),
        seconds: newTotalSeconds % 60,
      };
    case 'SET_TIME':
      const { hours, minutes, seconds } = action.payload;
      const total = hours * 3600 + minutes * 60 + seconds;
      return {
        ...state,
        hours,
        minutes,
        seconds,
        totalSeconds: total,
        isRunning: false,
      };
    default:
      return state;
  }
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

interface TimerProviderProps {
  children: ReactNode;
}

export function TimerProvider({ children }: TimerProviderProps) {
  const [state, dispatch] = useReducer(timerReducer, initialState);

  // persistencia no LocalStorage
  useEffect(() => {
    const savedTimer = localStorage.getItem('estudozen-timer');
    if (savedTimer) {
      const parsed = JSON.parse(savedTimer);
      dispatch({
        type: 'SET_TIME',
        payload: {
          hours: parsed.hours || 0,
          minutes: parsed.minutes || 25,
          seconds: parsed.seconds || 0,
        },
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('estudozen-timer', JSON.stringify({
      hours: state.hours,
      minutes: state.minutes,
      seconds: state.seconds,
      totalSeconds: state.totalSeconds,
    }));
  }, [state.hours, state.minutes, state.seconds, state.totalSeconds]);

  // timer tick
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state.isRunning && state.totalSeconds > 0) {
      interval = setInterval(() => {
        dispatch({ type: 'TICK' });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state.isRunning, state.totalSeconds]);

  const startTimer = () => dispatch({ type: 'START' });
  const pauseTimer = () => dispatch({ type: 'PAUSE' });
  const resetTimer = () => dispatch({ type: 'RESET' });
  const setTime = (hours: number, minutes: number, seconds: number) =>
    dispatch({ type: 'SET_TIME', payload: { hours, minutes, seconds } });

  return (
    <TimerContext.Provider
      value={{
        state,
        startTimer,
        pauseTimer,
        resetTimer,
        setTime,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimerContext() {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimerContext deve ser usado dentro de um TimerProvider');
  }
  return context;
} 