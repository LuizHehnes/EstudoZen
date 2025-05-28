import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface StudyModeContextType {
  isStudyMode: boolean;
  enterStudyMode: () => void;
  exitStudyMode: () => void;
  toggleStudyMode: () => void;
}

const StudyModeContext = createContext<StudyModeContextType | undefined>(undefined);

interface StudyModeProviderProps {
  children: ReactNode;
}

export function StudyModeProvider({ children }: StudyModeProviderProps) {
  const [isStudyMode, setIsStudyMode] = useState(false);

  const enterStudyMode = () => {
    setIsStudyMode(true);
    // Entra em tela cheia
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Não foi possível entrar em tela cheia:', err);
      });
    }
  };

  const exitStudyMode = () => {
    setIsStudyMode(false);
    // Sai da tela cheia
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch((err) => {
        console.warn('Não foi possível sair da tela cheia:', err);
      });
    }
  };

  const toggleStudyMode = () => {
    if (isStudyMode) {
      exitStudyMode();
    } else {
      enterStudyMode();
    }
  };

  // Listener para tecla ESC
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isStudyMode) {
        exitStudyMode();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isStudyMode]);

  // Listener para mudanças de tela cheia (quando o usuário sai manualmente)
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isStudyMode) {
        setIsStudyMode(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isStudyMode]);

  return (
    <StudyModeContext.Provider
      value={{
        isStudyMode,
        enterStudyMode,
        exitStudyMode,
        toggleStudyMode,
      }}
    >
      {children}
    </StudyModeContext.Provider>
  );
}

export function useStudyMode() {
  const context = useContext(StudyModeContext);
  if (context === undefined) {
    throw new Error('useStudyMode deve ser usado dentro de um StudyModeProvider');
  }
  return context;
} 