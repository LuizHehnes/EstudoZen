import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';

export interface Sound {
  id: string;
  name: string;
  url: string;
  icon: string;
  category: 'nature' | 'urban' | 'white-noise' | 'instrumental';
}

interface AudioState {
  id: string;
  isPlaying: boolean;
  volume: number;
  audio: HTMLAudioElement | null;
}

interface AudioContextType {
  sounds: Sound[];
  audioStates: Record<string, AudioState>;
  playSound: (soundId: string) => void;
  pauseSound: (soundId: string) => void;
  setVolume: (soundId: string, volume: number) => void;
  stopAllSounds: () => void;
}

type AudioAction =
  | { type: 'PLAY_SOUND'; payload: { soundId: string } }
  | { type: 'PAUSE_SOUND'; payload: { soundId: string } }
  | { type: 'SET_VOLUME'; payload: { soundId: string; volume: number } }
  | { type: 'STOP_ALL' }
  | { type: 'INIT_AUDIO'; payload: { soundId: string; audio: HTMLAudioElement } };

// lista sons
const defaultSounds: Sound[] = [
  {
    id: 'rain',
    name: 'Chuva',
    url: '/assets/sounds/chuva.mp3',
    icon: '🌧️',
    category: 'nature',
  },
  {
    id: 'forest',
    name: 'Floresta',
    url: '/assets/sounds/floresta.mp3',
    icon: '🌲',
    category: 'nature',
  },
  {
    id: 'coffee-shop',
    name: 'Cafeteria',
    url: '/assets/sounds/cafe.mp3',
    icon: '☕',
    category: 'urban',
  },
];

function audioReducer(state: Record<string, AudioState>, action: AudioAction): Record<string, AudioState> {
  switch (action.type) {
    case 'INIT_AUDIO':
      return {
        ...state,
        [action.payload.soundId]: {
          id: action.payload.soundId,
          isPlaying: false,
          volume: 0.5,
          audio: action.payload.audio,
        },
      };
    case 'PLAY_SOUND':
      return {
        ...state,
        [action.payload.soundId]: {
          ...state[action.payload.soundId],
          isPlaying: true,
        },
      };
    case 'PAUSE_SOUND':
      return {
        ...state,
        [action.payload.soundId]: {
          ...state[action.payload.soundId],
          isPlaying: false,
        },
      };
    case 'SET_VOLUME':
      return {
        ...state,
        [action.payload.soundId]: {
          ...state[action.payload.soundId],
          volume: action.payload.volume,
        },
      };
    case 'STOP_ALL':
      return Object.keys(state).reduce((acc, soundId) => {
        acc[soundId] = {
          ...state[soundId],
          isPlaying: false,
        };
        return acc;
      }, {} as Record<string, AudioState>);
    default:
      return state;
  }
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

interface AudioProviderProps {
  children: ReactNode;
}

export function AudioProvider({ children }: AudioProviderProps) {
  const [audioStates, dispatch] = useReducer(audioReducer, {});

  // inicializa audios
  useEffect(() => {
    defaultSounds.forEach((sound) => {
      const audio = new Audio();
      audio.src = sound.url;
      audio.loop = true;
      audio.volume = 0.5;
      
      // tratamento de erro
      audio.onerror = (error) => {
        console.warn(`Não foi possível carregar o som ${sound.name}:`, error);
      };
      
      dispatch({
        type: 'INIT_AUDIO',
        payload: { soundId: sound.id, audio },
      });
    });
  }, []);

  // carregar LocalStorage
  useEffect(() => {
    const savedAudioState = localStorage.getItem('estudozen-audio');
    if (savedAudioState) {
      try {
        const parsed = JSON.parse(savedAudioState);
        Object.keys(parsed).forEach((soundId) => {
          if (parsed[soundId].volume !== undefined) {
            dispatch({
              type: 'SET_VOLUME',
              payload: { soundId, volume: parsed[soundId].volume },
            });
          }
        });
      } catch (error) {
        console.warn('Erro ao carregar estado do áudio do localStorage:', error);
      }
    }
  }, []);

  // Salvar LocalStorage
  useEffect(() => {
    const stateToSave = Object.keys(audioStates).reduce((acc, soundId) => {
      acc[soundId] = {
        volume: audioStates[soundId].volume,
        isPlaying: audioStates[soundId].isPlaying,
      };
      return acc;
    }, {} as Record<string, { volume: number; isPlaying: boolean }>);

    localStorage.setItem('estudozen-audio', JSON.stringify(stateToSave));
  }, [audioStates]);

  const playSound = (soundId: string) => {
    const audioState = audioStates[soundId];
    if (audioState?.audio) {
      audioState.audio.play().catch((error) => {
        console.warn(`Erro ao reproduzir som ${soundId}:`, error);
      });
      dispatch({ type: 'PLAY_SOUND', payload: { soundId } });
    }
  };

  const pauseSound = (soundId: string) => {
    const audioState = audioStates[soundId];
    if (audioState?.audio) {
      audioState.audio.pause();
      dispatch({ type: 'PAUSE_SOUND', payload: { soundId } });
    }
  };

  const setVolume = (soundId: string, volume: number) => {
    const audioState = audioStates[soundId];
    if (audioState?.audio) {
      audioState.audio.volume = volume;
      dispatch({ type: 'SET_VOLUME', payload: { soundId, volume } });
    }
  };

  const stopAllSounds = () => {
    // Parar todos os áudios gerenciados pelo contexto
    Object.keys(audioStates).forEach((soundId) => {
      const audioState = audioStates[soundId];
      if (audioState?.audio) {
        audioState.audio.pause();
        audioState.audio.currentTime = 0;
      }
    });
    
    // Também parar elementos de áudio HTML nativos que possam existir na página
    try {
      const allAudioElements = document.querySelectorAll('audio');
      allAudioElements.forEach((audio) => {
        if (!audio.paused) {
          audio.pause();
          audio.currentTime = 0;
        }
      });

      // Parar elementos de vídeo também, já que podem ter áudio
      const allVideoElements = document.querySelectorAll('video');
      allVideoElements.forEach((video) => {
        if (!video.paused) {
          video.pause();
          video.currentTime = 0;
        }
      });
      
      // Notificar outros componentes da parada global
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('estudozen:stop-all-audio'));
      }
      
      console.log('Todos os áudios foram interrompidos');
    } catch (error) {
      console.error('Erro ao interromper áudios da página:', error);
    }
    
    dispatch({ type: 'STOP_ALL' });
  };

  return (
    <AudioContext.Provider
      value={{
        sounds: defaultSounds,
        audioStates,
        playSound,
        pauseSound,
        setVolume,
        stopAllSounds,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudioContext() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudioContext deve ser usado dentro de um AudioProvider');
  }
  return context;
} 