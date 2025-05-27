import { useAudioContext } from '../context/AudioContext';

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
  };
} 