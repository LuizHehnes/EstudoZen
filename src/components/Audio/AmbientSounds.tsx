import React, { useState, useRef, useEffect } from 'react';
import { Pause, Volume2, VolumeX } from 'lucide-react';

interface AmbientSound {
  id: string;
  name: string;
  url: string;
  icon: string;
}

const ambientSounds: AmbientSound[] = [
  {
    id: 'rain',
    name: 'Chuva',
    url: '/assets/sounds/chuva.mp3',
    icon: '🌧️'
  },
  {
    id: 'forest',
    name: 'Floresta',
    url: '/assets/sounds/floresta.mp3',
    icon: '🌲'
  },
  {
    id: 'cafe',
    name: 'Café',
    url: '/assets/sounds/cafe.mp3',
    icon: '☕'
  },
  {
    id: 'ocean',
    name: 'Oceano',
    url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
    icon: '🌊'
  },
  {
    id: 'fire',
    name: 'Lareira',
    url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
    icon: '🔥'
  },
  {
    id: 'library',
    name: 'Biblioteca',
    url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
    icon: '📚'
  }
];

interface AmbientSoundsProps {
  className?: string;
}

export const AmbientSounds: React.FC<AmbientSoundsProps> = ({ className = '' }) => {
  const [currentSound, setCurrentSound] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const playSound = (sound: AmbientSound) => {
    if (currentSound === sound.id) {
      if (audioRef.current) {
        audioRef.current.pause();
        setCurrentSound(null);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio();
      audio.src = sound.url;
      audio.loop = true;
      audio.volume = isMuted ? 0 : volume;
      
      audio.oncanplaythrough = () => {
        audio.play().catch((error) => {
          console.error('Erro ao reproduzir som:', sound.name, error);
          createSimpleTone(sound.id);
        });
      };
      
      audio.onerror = (error) => {
        console.error('Erro ao carregar som:', sound.name, error);
        createSimpleTone(sound.id);
      };

      audio.load();
      
      audioRef.current = audio;
      setCurrentSound(sound.id);
    }
  };

  const createSimpleTone = (soundId: string) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      const frequencies: { [key: string]: number } = {
        rain: 200,
        forest: 150,
        ocean: 100,
        fire: 80,
        cafe: 300,
        library: 250
      };

      oscillator.frequency.setValueAtTime(frequencies[soundId] || 200, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(isMuted ? 0 : volume * 0.1, audioContext.currentTime);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start();
      
      const stopTone = () => {
        try {
          oscillator.stop();
          audioContext.close();
        } catch (e) {
          console.log('Áudio já foi parado');
        }
      };

      (audioRef.current as any) = { 
        pause: stopTone,
        volume: isMuted ? 0 : volume * 0.1
      };
    } catch (error) {
      console.error('Erro ao criar tom de fallback:', error);
    }
  };

  const stopAllSounds = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setCurrentSound(null);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className={`bg-white rounded-xl shadow-soft p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-neutral-800">
          Sons Ambiente
        </h3>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMute}
            className="p-2 text-neutral-600 hover:text-primary-600 transition-colors"
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
            className="w-20 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
            title="Volume"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {ambientSounds.map((sound) => (
          <button
            key={sound.id}
            onClick={() => playSound(sound)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              currentSound === sound.id
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-neutral-200 hover:border-primary-300 hover:bg-primary-25'
            }`}
          >
            <div className="text-2xl mb-2">{sound.icon}</div>
            <div className="text-sm font-medium">{sound.name}</div>
            {currentSound === sound.id && (
              <div className="flex items-center justify-center mt-2">
                <Pause size={16} className="text-primary-600" />
              </div>
            )}
          </button>
        ))}
      </div>

      {currentSound && (
        <div className="mt-4 flex items-center justify-between p-3 bg-primary-50 rounded-lg">
          <span className="text-sm text-primary-700">
            Tocando: {ambientSounds.find(s => s.id === currentSound)?.name}
          </span>
          <button
            onClick={stopAllSounds}
            className="text-sm text-primary-600 hover:text-primary-800 font-medium"
          >
            Parar
          </button>
        </div>
      )}

      <div className="mt-4 text-xs text-neutral-500">
        <p>💡 Dica: Os sons de Chuva, Floresta e Café estão disponíveis em alta qualidade.</p>
        <p>Os demais sons usam tons sintéticos para demonstração.</p>
      </div>
    </div>
  );
}; 