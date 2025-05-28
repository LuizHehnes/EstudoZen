import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { statsService, type StudySession } from '../services/statsService';

interface TimerState {
  hours: number;
  minutes: number;
  seconds: number;
  isRunning: boolean;
  totalSeconds: number;
  mode: string;
  sessionId: string | null;
  startTime: string | null;
  initialDuration: number; // duração inicial em segundos
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
  | { type: 'SET_TIME'; payload: { hours: number; minutes: number; seconds: number } }
  | { type: 'COMPLETE_SESSION' };

const initialState: TimerState = {
  hours: 0,
  minutes: 25,
  seconds: 0,
  isRunning: false,
  totalSeconds: 1500, // 25 min padrão
  mode: 'work',
  sessionId: null,
  startTime: null,
  initialDuration: 1500,
};

function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'START':
      return { 
        ...state, 
        isRunning: true,
        sessionId: state.sessionId || crypto.randomUUID(),
        startTime: state.startTime || new Date().toISOString(),
      };
    case 'PAUSE':
      return { ...state, isRunning: false };
    case 'RESET':
      return {
        ...state,
        isRunning: false,
        totalSeconds: state.initialDuration,
        hours: Math.floor(state.initialDuration / 3600),
        minutes: Math.floor((state.initialDuration % 3600) / 60),
        seconds: state.initialDuration % 60,
        sessionId: null,
        startTime: null,
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
        initialDuration: total,
        isRunning: false,
        sessionId: null,
        startTime: null,
      };
    case 'COMPLETE_SESSION':
      return {
        ...state,
        isRunning: false,
        sessionId: null,
        startTime: null,
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
  const { user } = useAuth();

  const getStorageKey = () => `estudozen-timer-${user?.id}`;

  // salva no LocalStorage
  useEffect(() => {
    if (user) {
      const savedTimer = localStorage.getItem(getStorageKey());
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
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(getStorageKey(), JSON.stringify({
        hours: state.hours,
        minutes: state.minutes,
        seconds: state.seconds,
        totalSeconds: state.totalSeconds,
        initialDuration: state.initialDuration,
      }));
    }
  }, [state.hours, state.minutes, state.seconds, state.totalSeconds, state.initialDuration, user]);

  // timer funcionando
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (state.isRunning && state.totalSeconds > 0) {
      interval = setInterval(() => {
        dispatch({ type: 'TICK' });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state.isRunning, state.totalSeconds]);

  // detecta quando o timer termina e registra a sessão
  useEffect(() => {
    if (state.totalSeconds === 0 && state.sessionId && state.startTime) {
      recordCompletedSession();
    }
  }, [state.totalSeconds, state.sessionId, state.startTime]);

  // registra sessão quando pausa (se tiver tempo significativo)
  useEffect(() => {
    const recordPausedSession = async () => {
      if (state.sessionId && state.startTime && !state.isRunning) {
        const elapsedTime = state.initialDuration - state.totalSeconds;
        
        // só registra se passou pelo menos 2 min
        if (elapsedTime >= 120) {
          const session: Omit<StudySession, 'id'> = {
            startTime: state.startTime,
            endTime: new Date().toISOString(),
            duration: Math.floor(elapsedTime / 60), // converte p/ minutos
            completed: state.totalSeconds === 0, // completa se chegou ao fim
            type: 'pomodoro',
            activities: ['Sessão Pomodoro']
          };
          
          try {
            await statsService.recordSession(session);
            console.log('Sessão Pomodoro registrada:', session);
          } catch (error) {
            console.error('Erro ao registrar sessão Pomodoro:', error);
          }
        }
      }
    };

    // registra quando para de executar e tem sessão ativa
    if (!state.isRunning && state.sessionId && state.startTime) {
      recordPausedSession();
    }
  }, [state.isRunning, state.sessionId, state.startTime, state.totalSeconds, state.initialDuration]);

  const recordCompletedSession = async () => {
    if (!state.sessionId || !state.startTime) return;

    const session: Omit<StudySession, 'id'> = {
      startTime: state.startTime,
      endTime: new Date().toISOString(),
      duration: Math.floor(state.initialDuration / 60), // duração total em min
      completed: true,
      type: 'pomodoro',
      activities: ['Pomodoro completado']
    };
    
    try {
      await statsService.recordSession(session);
      await statsService.recordActivity('Pomodoro completado com sucesso', state.sessionId);
      console.log('Sessão Pomodoro completada registrada:', session);
      
      // limpa a sessão
      dispatch({ type: 'COMPLETE_SESSION' });
    } catch (error) {
      console.error('Erro ao registrar sessão Pomodoro completada:', error);
    }
  };

  const startTimer = () => {
    dispatch({ type: 'START' });
    if (state.sessionId) {
      statsService.recordActivity('Pomodoro iniciado', state.sessionId);
    }
  };

  const pauseTimer = () => {
    dispatch({ type: 'PAUSE' });
    if (state.sessionId) {
      statsService.recordActivity('Pomodoro pausado', state.sessionId);
    }
  };

  const resetTimer = () => {
    // se tinha uma sessão ativa, registra como interrompida
    if (state.sessionId && state.startTime && !state.isRunning) {
      const elapsedTime = state.initialDuration - state.totalSeconds;
      if (elapsedTime >= 60) { // pelo menos 1 min
        const session: Omit<StudySession, 'id'> = {
          startTime: state.startTime,
          endTime: new Date().toISOString(),
          duration: Math.floor(elapsedTime / 60),
          completed: false,
          type: 'pomodoro',
          activities: ['Pomodoro interrompido']
        };
        
        statsService.recordSession(session).catch(console.error);
      }
    }

    dispatch({ type: 'RESET' });
  };

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