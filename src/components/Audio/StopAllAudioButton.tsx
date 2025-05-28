import React, { useEffect, useCallback } from 'react';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { VolumeX } from 'lucide-react';

interface StopAllAudioButtonProps {
  className?: string;
  showIcon?: boolean;
  showText?: boolean;
  buttonText?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'error' | 'ghost';
}

export const StopAllAudioButton: React.FC<StopAllAudioButtonProps> = ({
  className = '',
  showIcon = true,
  showText = true,
  buttonText = 'Parar todos os sons',
  size = 'md',
  variant = 'error',
}) => {
  const { stopAllSounds, getPlayingSoundsCount } = useAudioPlayer();
  
  // Dimensões do botão baseadas no tamanho
  const sizeClasses = {
    sm: 'text-xs py-1 px-2',
    md: 'text-sm py-1.5 px-3',
    lg: 'text-base py-2 px-4',
  };

  // Variantes de estilo
  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white',
    error: 'bg-error-600 hover:bg-error-700 text-white',
    ghost: 'bg-transparent hover:bg-error-100 dark:hover:bg-error-900/20 text-error-600 dark:text-error-400',
  };

  // Tamanho do ícone
  const iconSize = {
    sm: 14,
    md: 16,
    lg: 20,
  };

  // Handler para parar todos os áudios
  const handleStopAllAudio = useCallback(() => {
    stopAllSounds();
  }, [stopAllSounds]);

  // Listener global para a tecla Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Parar todos os áudios quando Escape for pressionado
      if (event.key === 'Escape') {
        handleStopAllAudio();
      }
    };

    // Adicionar o event listener
    window.addEventListener('keydown', handleKeyDown);

    // Limpar o event listener quando o componente for desmontado
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleStopAllAudio]);

  // Handler para capturar áudios HTML padrão na página
  useEffect(() => {
    // Função para parar elementos de áudio HTML padrão
    const stopHtmlAudioElements = () => {
      const audioElements = document.querySelectorAll('audio');
      audioElements.forEach((audio) => {
        if (!audio.paused) {
          audio.pause();
          audio.currentTime = 0;
        }
      });

      // Parar elementos de vídeo também, já que eles podem ter áudio
      const videoElements = document.querySelectorAll('video');
      videoElements.forEach((video) => {
        if (!video.paused) {
          video.pause();
          video.currentTime = 0;
        }
      });
    };

    // Incluir esta função no handler principal
    const originalStopAllSounds = handleStopAllAudio;
    const enhancedStopAllSounds = () => {
      originalStopAllSounds();
      stopHtmlAudioElements();
    };

    // Substituir o handler global para incluir esta função
    window.stopAllAudios = enhancedStopAllSounds;

    return () => {
      // Limpar quando o componente for desmontado
      delete window.stopAllAudios;
    };
  }, [handleStopAllAudio]);

  const playingSoundsCount = getPlayingSoundsCount();
  const hasPlayingSounds = playingSoundsCount > 0;

  return (
    <button
      className={`rounded-lg transition-all duration-200 flex items-center gap-2 ${sizeClasses[size]} ${variantClasses[variant]} ${className} ${!hasPlayingSounds ? 'opacity-70' : 'opacity-100'}`}
      onClick={handleStopAllAudio}
      title="Parar todos os sons em reprodução"
      aria-label="Parar todos os sons em reprodução"
      disabled={!hasPlayingSounds}
    >
      {showIcon && (
        <VolumeX size={iconSize[size]} />
      )}
      {showText && (
        <span>{buttonText}</span>
      )}
      {playingSoundsCount > 0 && (
        <span className="inline-flex items-center justify-center bg-white/20 text-white text-xs rounded-full w-5 h-5 ml-1">
          {playingSoundsCount}
        </span>
      )}
    </button>
  );
};

// Adicionar a tipagem para a propriedade global
declare global {
  interface Window {
    stopAllAudios?: () => void;
  }
} 