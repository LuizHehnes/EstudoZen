import { useAudioContext } from '../context/AudioContext';
import { useEffect, useCallback } from 'react';

export function useAudioPlayer() {
  const { sounds, audioStates, playSound, pauseSound, setVolume, stopAllSounds } = useAudioContext();

  const toggleSound = (soundId: string) => {
    const audioState = audioStates[soundId];
    if (audioState?.isPlaying) {
      pauseSound(soundId);
    } else {
      playSound(soundId);
    }
  };

  const isPlaying = (soundId: string): boolean => {
    return audioStates[soundId]?.isPlaying || false;
  };

  const getVolume = (soundId: string): number => {
    return audioStates[soundId]?.volume || 0.5;
  };

  const getPlayingSounds = () => {
    return Object.keys(audioStates).filter(soundId => audioStates[soundId]?.isPlaying);
  };

  const getPlayingSoundsCount = () => {
    return getPlayingSounds().length;
  };

  const getSoundsByCategory = (category: string) => {
    return sounds.filter(sound => sound.category === category);
  };

  const getAllCategories = () => {
    const categories = sounds.map(sound => sound.category);
    return [...new Set(categories)];
  };

  // Função para registrar tecla de atalho para parar todos os sons
  const registerStopAllShortcut = useCallback((key = 'Escape') => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === key) {
        stopAllSounds();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [stopAllSounds]);

  // Utilidade para verificar se há algum áudio tocando na página inteira
  const isAnyAudioPlayingInPage = useCallback((): boolean => {
    // Verificar áudios gerenciados pelo contexto
    const managedAudiosPlaying = getPlayingSoundsCount() > 0;
    
    // Verificar elementos HTML nativos
    const audioElements = document.querySelectorAll('audio');
    const videoElements = document.querySelectorAll('video');
    
    let nativeAudiosPlaying = false;
    
    audioElements.forEach(audio => {
      if (!audio.paused) nativeAudiosPlaying = true;
    });
    
    videoElements.forEach(video => {
      if (!video.paused) nativeAudiosPlaying = true;
    });
    
    return managedAudiosPlaying || nativeAudiosPlaying;
  }, [getPlayingSoundsCount]);

  // Ouvir eventos globais de parada de áudio
  useEffect(() => {
    const handleGlobalStopEvent = () => {
      // Pode ser usado para sincronizar outros componentes quando
      // o stopAllSounds é chamado de qualquer lugar
      console.log('Evento global de parada de áudio recebido');
    };

    window.addEventListener('estudozen:stop-all-audio', handleGlobalStopEvent);
    
    return () => {
      window.removeEventListener('estudozen:stop-all-audio', handleGlobalStopEvent);
    };
  }, []);

  return {
    sounds,
    audioStates,
    toggleSound,
    playSound,
    pauseSound,
    setVolume,
    stopAllSounds,
    isPlaying,
    getVolume,
    getPlayingSounds,
    getPlayingSoundsCount,
    getSoundsByCategory,
    getAllCategories,
    registerStopAllShortcut,
    isAnyAudioPlayingInPage,
  };
} 