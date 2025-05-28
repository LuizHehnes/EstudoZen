import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useStudySession } from '../../context/StudySessionContext';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { SoundList } from './SoundList';
import { StopAllAudioButton } from './StopAllAudioButton';

interface AmbientSoundsProps {
  className?: string;
}

export const AmbientSounds: React.FC<AmbientSoundsProps> = ({ className = '' }) => {
  const { state, setActiveSound } = useStudySession();
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>('nature');
  const { getAllCategories, getPlayingSoundsCount } = useAudioPlayer();

  const categories = getAllCategories();
  const hasPlayingSounds = getPlayingSoundsCount() > 0;

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
    
    // atualiza o volume no contexto global
    if (state.activeSound) {
      setActiveSound({
        ...state.activeSound,
        volume: isMuted ? 0 : volume
      });
    }
  }, [volume, isMuted, state.activeSound, setActiveSound]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // efeito p/ manter o áudio sincronizado quando o contexto muda externamente
  useEffect(() => {
    if (!state.activeSound && audioRef.current) {
      audioRef.current.pause();
    }
  }, [state.activeSound]);

  return (
    <div className={`bg-light-card dark:bg-dark-card rounded-xl shadow-soft dark:shadow-dark-soft border border-light-border dark:border-dark-border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
          Sons Ambiente
        </h3>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMute}
            className="p-2 text-light-text-muted dark:text-dark-text-muted hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            title={isMuted ? 'Ativar som' : 'Silenciar'}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20 h-2 bg-light-surface dark:bg-dark-surface rounded-lg appearance-none cursor-pointer"
            title="Volume"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {categories.map((category) => {
          let categoryName = '';
          let categoryIcon = '';

          switch (category) {
            case 'nature':
              categoryName = 'Natureza';
              categoryIcon = '🌿';
              break;
            case 'urban':
              categoryName = 'Urbano';
              categoryIcon = '🏙️';
              break;
            case 'white-noise':
              categoryName = 'Ruído Branco';
              categoryIcon = '📻';
              break;
            case 'instrumental':
              categoryName = 'Instrumental';
              categoryIcon = '🎵';
              break;
            default:
              categoryName = category;
              categoryIcon = '🔊';
          }

          return (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                activeCategory === category
                  ? 'border-primary-500 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'border-light-border dark:border-dark-border hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-25 dark:hover:bg-primary-900/20'
              }`}
            >
              <div className="text-2xl mb-2">{categoryIcon}</div>
              <div className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">{categoryName}</div>
            </button>
          );
        })}
      </div>

      {activeCategory && (
        <SoundList category={activeCategory} />
      )}

      {hasPlayingSounds && (
        <div className="mt-6 p-4 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-1.5 rounded-lg bg-primary-100 dark:bg-primary-800/50">
                <Volume2 className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                  {getPlayingSoundsCount()} {getPlayingSoundsCount() === 1 ? 'som ativo' : 'sons ativos'}
                </span>
                <p className="text-xs text-primary-600/80 dark:text-primary-400/80">
                  Combine diferentes sons para criar seu ambiente perfeito
                </p>
              </div>
            </div>
            
            <StopAllAudioButton 
              variant="primary"
              size="sm"
              showText={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}; 