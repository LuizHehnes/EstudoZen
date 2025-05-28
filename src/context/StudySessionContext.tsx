import { createContext, useContext, useReducer, useEffect, useRef, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { statsService, type StudySession } from '../services/statsService';

interface StopwatchState {
  time: number;
  isRunning: boolean;
  startTime: string | null;
  sessionId: string | null;
}

interface ActiveSound {
  id: string;
  name: string;
  icon: string;
  volume: number;
}

interface StudySessionState {
  stopwatch: StopwatchState;
  activeSound: ActiveSound | null;
  isVisible: boolean;
  sessionStats: {
    totalTime: number;
    soundUsageTime: number;
    lastActivity: string | null;
  };
}

interface StudySessionContextType {
  state: StudySessionState;
  startStopwatch: () => void;
  pauseStopwatch: () => void;
  resetStopwatch: () => void;
  setActiveSound: (sound: ActiveSound | null) => void;
  toggleVisibility: () => void;
  recordActivity: (activity: string) => void;
}

type StudySessionAction =
  | { type: 'START_STOPWATCH' }
  | { type: 'PAUSE_STOPWATCH' }
  | { type: 'RESET_STOPWATCH' }
  | { type: 'TICK_STOPWATCH' }
  | { type: 'SET_ACTIVE_SOUND'; payload: ActiveSound | null }
  | { type: 'TOGGLE_VISIBILITY' }
  | { type: 'RECORD_ACTIVITY'; payload: string }
  | { type: 'LOAD_STATE'; payload: Partial<StudySessionState> };

const initialState: StudySessionState = {
  stopwatch: {
    time: 0,
    isRunning: false,
    startTime: null,
    sessionId: null,
  },
  activeSound: null,
  isVisible: false,
  sessionStats: {
    totalTime: 0,
    soundUsageTime: 0,
    lastActivity: null,
  },
};

function studySessionReducer(state: StudySessionState, action: StudySessionAction): StudySessionState {
  switch (action.type) {
    case 'START_STOPWATCH':
      return {
        ...state,
        stopwatch: {
          ...state.stopwatch,
          isRunning: true,
          startTime: state.stopwatch.startTime || new Date().toISOString(),
          sessionId: state.stopwatch.sessionId || crypto.randomUUID(),
        },
        isVisible: true,
      };
    
    case 'PAUSE_STOPWATCH':
      return {
        ...state,
        stopwatch: {
          ...state.stopwatch,
          isRunning: false,
        },
      };
    
    case 'RESET_STOPWATCH':
      return {
        ...state,
        stopwatch: {
          time: 0,
          isRunning: false,
          startTime: null,
          sessionId: null,
        },
        isVisible: false,
      };
    
    case 'TICK_STOPWATCH':
      return {
        ...state,
        stopwatch: {
          ...state.stopwatch,
          time: state.stopwatch.time + 1,
        },
        sessionStats: {
          ...state.sessionStats,
          totalTime: state.sessionStats.totalTime + 1,
          soundUsageTime: state.activeSound 
            ? state.sessionStats.soundUsageTime + 1 
            : state.sessionStats.soundUsageTime,
        },
      };
    
    case 'SET_ACTIVE_SOUND':
      return {
        ...state,
        activeSound: action.payload,
        isVisible: action.payload ? true : state.isVisible,
      };
    
    case 'TOGGLE_VISIBILITY':
      return {
        ...state,
        isVisible: !state.isVisible,
      };
    
    case 'RECORD_ACTIVITY':
      return {
        ...state,
        sessionStats: {
          ...state.sessionStats,
          lastActivity: action.payload,
        },
      };
    
    case 'LOAD_STATE':
      return {
        ...state,
        ...action.payload,
      };
    
    default:
      return state;
  }
}

const StudySessionContext = createContext<StudySessionContextType | undefined>(undefined);

interface StudySessionProviderProps {
  children: ReactNode;
}

export function StudySessionProvider({ children }: StudySessionProviderProps) {
  const [state, dispatch] = useReducer(studySessionReducer, initialState);
  const { user } = useAuth();
  const lastAudioUsageRef = useRef<{ soundId: string; startTime: string } | null>(null);

  const getStorageKey = () => `estudozen-study-session-${user?.id}`;

  // Carrega estado do localStorage
  useEffect(() => {
    if (user) {
      const savedState = localStorage.getItem(getStorageKey());
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          dispatch({ type: 'LOAD_STATE', payload: parsed });
        } catch (error) {
          console.warn('Erro ao carregar estado da sessão:', error);
        }
      }
    }
  }, [user]);

  // Salva estado no localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(getStorageKey(), JSON.stringify(state));
    }
  }, [state, user]);

  // Timer tick para o cronômetro
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (state.stopwatch.isRunning) {
      interval = setInterval(() => {
        dispatch({ type: 'TICK_STOPWATCH' });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state.stopwatch.isRunning]);

  // Rastreia uso de áudio
  useEffect(() => {
    if (state.activeSound) {
      // Inicia rastreamento de áudio
      if (!lastAudioUsageRef.current || lastAudioUsageRef.current.soundId !== state.activeSound.id) {
        lastAudioUsageRef.current = {
          soundId: state.activeSound.id,
          startTime: new Date().toISOString()
        };
      }
    } else {
      // Para rastreamento de áudio
      if (lastAudioUsageRef.current) {
        const duration = Math.floor((Date.now() - new Date(lastAudioUsageRef.current.startTime).getTime()) / 1000);
        if (duration > 0) {
          const soundName = 'Som desconhecido'; // Como o som já foi parado, usamos um nome genérico
          statsService.recordAudioUsage(lastAudioUsageRef.current.soundId, soundName, duration);
        }
        lastAudioUsageRef.current = null;
      }
    }
  }, [state.activeSound]);

  // Registra sessão quando o cronômetro é pausado ou resetado
  useEffect(() => {
    const recordSession = async () => {
      if (state.stopwatch.sessionId && state.stopwatch.startTime && state.stopwatch.time > 0) {
        // Finaliza rastreamento de áudio se houver
        if (lastAudioUsageRef.current) {
          const duration = Math.floor((Date.now() - new Date(lastAudioUsageRef.current.startTime).getTime()) / 1000);
          if (duration > 0) {
            const soundName = state.activeSound?.name || 'Som desconhecido';
            await statsService.recordAudioUsage(lastAudioUsageRef.current.soundId, soundName, duration);
          }
        }

        const session: Omit<StudySession, 'id'> = {
          startTime: state.stopwatch.startTime,
          endTime: new Date().toISOString(),
          duration: Math.floor(state.stopwatch.time / 60), // converte para minutos
          completed: state.stopwatch.time >= 300, // considera completa se >= 5 minutos
          type: 'stopwatch',
          audioUsed: state.activeSound?.name,
          activities: state.sessionStats.lastActivity ? [state.sessionStats.lastActivity] : undefined,
        };
        
        try {
          await statsService.recordSession(session);
        } catch (error) {
          console.error('Erro ao registrar sessão:', error);
        }
      }
    };

    // Registra quando para de executar e tem tempo
    if (!state.stopwatch.isRunning && state.stopwatch.time > 0 && state.stopwatch.sessionId) {
      recordSession();
    }
  }, [state.stopwatch.isRunning, state.stopwatch.time, state.stopwatch.sessionId, state.stopwatch.startTime, state.activeSound?.name, state.sessionStats.lastActivity]);

  const startStopwatch = () => {
    dispatch({ type: 'START_STOPWATCH' });
  };

  const pauseStopwatch = () => {
    dispatch({ type: 'PAUSE_STOPWATCH' });
  };

  const resetStopwatch = () => {
    dispatch({ type: 'RESET_STOPWATCH' });
  };

  const setActiveSound = (sound: ActiveSound | null) => {
    dispatch({ type: 'SET_ACTIVE_SOUND', payload: sound });
  };

  const toggleVisibility = () => {
    dispatch({ type: 'TOGGLE_VISIBILITY' });
  };

  const recordActivity = (activity: string) => {
    dispatch({ type: 'RECORD_ACTIVITY', payload: activity });
    // Registra também no serviço de estatísticas
    statsService.recordActivity(activity, state.stopwatch.sessionId || undefined);
  };

  return (
    <StudySessionContext.Provider
      value={{
        state,
        startStopwatch,
        pauseStopwatch,
        resetStopwatch,
        setActiveSound,
        toggleVisibility,
        recordActivity,
      }}
    >
      {children}
    </StudySessionContext.Provider>
  );
}

export function useStudySession() {
  const context = useContext(StudySessionContext);
  if (context === undefined) {
    throw new Error('useStudySession deve ser usado dentro de um StudySessionProvider');
  }
  return context;
} 