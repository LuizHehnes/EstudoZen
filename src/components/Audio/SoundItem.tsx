import React, { useState } from 'react';
import type { Sound } from '../../context/AudioContext';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';

interface SoundItemProps {
  sound: Sound;
}

export function SoundItem({ sound }: SoundItemProps) {
  const { toggleSound, isPlaying, getVolume, setVolume } = useAudioPlayer();
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  
  const playing = isPlaying(sound.id);
  const volume = getVolume(sound.id);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(sound.id, newVolume);
  };

  return (
    <div className={`
      relative group
      bg-white dark:bg-gray-800 
      rounded-xl shadow-md hover:shadow-lg
      transition-all duration-200
      border-2 ${playing ? 'border-blue-500' : 'border-transparent'}
      ${playing ? 'ring-2 ring-blue-500 ring-opacity-20' : ''}
    `}>
      <div className="p-4">
        {/* header ícone e nome */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{sound.icon}</span>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {sound.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {sound.category.replace('-', ' ')}
              </p>
            </div>
          </div>
          
          {/* Indicador de reprodução */}
          {playing && (
            <div className="flex space-x-1">
              <div className="w-1 h-4 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="w-1 h-4 bg-blue-500 rounded-full animate-pulse delay-75"></div>
              <div className="w-1 h-4 bg-blue-500 rounded-full animate-pulse delay-150"></div>
            </div>
          )}
        </div>

        {/* Controles */}
        <div className="flex items-center justify-between">
          {/* Botão Play/Pause */}
          <button
            onClick={() => toggleSound(sound.id)}
            className={`
              flex items-center justify-center
              w-10 h-10 rounded-full
              transition-all duration-200
              focus:outline-none focus:ring-4 focus:ring-opacity-50
              ${playing 
                ? 'bg-red-500 hover:bg-red-600 focus:ring-red-300 text-white' 
                : 'bg-green-500 hover:bg-green-600 focus:ring-green-300 text-white'
              }
              transform hover:scale-105 active:scale-95
            `}
            aria-label={playing ? `Pausar ${sound.name}` : `Reproduzir ${sound.name}`}
          >
            {playing ? (
              <div className="flex space-x-0.5">
                <div className="w-1 h-4 bg-white rounded-sm"></div>
                <div className="w-1 h-4 bg-white rounded-sm"></div>
              </div>
            ) : (
              <div className="w-0 h-0 border-l-[8px] border-l-white border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-0.5"></div>
            )}
          </button>

          {/* Controle de Volume */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowVolumeControl(!showVolumeControl)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Controle de volume"
            >
              <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.824L4.5 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.5l3.883-3.824a1 1 0 011.617.824zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.983 5.983 0 01-1.757 4.243 1 1 0 01-1.415-1.414A3.983 3.983 0 0013 10a3.983 3.983 0 00-1.172-2.829 1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            <span className="text-sm text-gray-500 dark:text-gray-400 min-w-[3rem]">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>

        {/* Slider de Volume */}
        {showVolumeControl && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.824L4.5 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.5l3.883-3.824a1 1 0 011.617.824z" clipRule="evenodd" />
              </svg>
              
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider"
              />
              
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.824L4.5 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.5l3.883-3.824a1 1 0 011.617.824zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.983 5.983 0 01-1.757 4.243 1 1 0 01-1.415-1.414A3.983 3.983 0 0013 10a3.983 3.983 0 00-1.172-2.829 1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 