import { useState } from 'react';
import { SoundItem } from './SoundItem';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { StopAllAudioButton } from './StopAllAudioButton';

interface SoundListProps {
  category?: string;
}

export function SoundList({ category }: SoundListProps) {
  const { 
    sounds, 
    getAllCategories, 
    getSoundsByCategory, 
    getPlayingSoundsCount
  } = useAudioPlayer();
  
  const [selectedCategory, setSelectedCategory] = useState<string>(category || 'all');
  const categories = getAllCategories();
  
  // Usar a categoria passada por props ou a selecionada internamente
  const effectiveCategory = category || selectedCategory;
  
  const filteredSounds = effectiveCategory === 'all' 
    ? sounds 
    : getSoundsByCategory(effectiveCategory);

  const categoryLabels: Record<string, string> = {
    'all': 'Todos',
    'nature': 'Natureza',
    'urban': 'Urbano',
    'white-noise': 'Ruído',
    'instrumental': 'Instrumental',
  };

  return (
    <div className="space-y-6">
      {/* header - mostrado apenas se não for fornecida uma categoria */}
      {!category && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Sons Ambiente
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Combine diferentes sons para criar o ambiente perfeito
            </p>
          </div>
          
          {/* status e controles */}
          <div className="flex items-center space-x-4">
            {getPlayingSoundsCount() > 0 && (
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-75"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-150"></div>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {getPlayingSoundsCount()} reproduzindo
                </span>
              </div>
            )}
            
            {getPlayingSoundsCount() > 0 && (
              <StopAllAudioButton
                size="sm"
                variant="error"
                showText={true}
                buttonText="Parar Todos"
              />
            )}
          </div>
        </div>
      )}

      {/* filtros de categoria - mostrados apenas se não for fornecida uma categoria */}
      {!category && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Todos ({sounds.length})
          </button>
          
          {categories.map((cat) => {
            const categoryCount = getSoundsByCategory(cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {categoryLabels[cat] || cat} ({categoryCount})
              </button>
            );
          })}
        </div>
      )}

      {/* lista de sons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSounds.map((sound) => (
          <SoundItem key={sound.id} sound={sound} />
        ))}
      </div>

      {/* mensagem quando não há sons */}
      {filteredSounds.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Nenhum som encontrado
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Tente selecionar uma categoria diferente
          </p>
        </div>
      )}

      {/* dicas - mostradas apenas se não for fornecida uma categoria */}
      {!category && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="text-blue-500 text-xl">💡</div>
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Dicas para usar os sons ambiente:
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Combine diferentes sons para criar ambientes únicos</li>
                <li>• Ajuste o volume de cada som individualmente</li>
                <li>• Sons da natureza ajudam na concentração</li>
                <li>• Ruído branco pode mascarar distrações</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 