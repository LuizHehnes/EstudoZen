import { useTimer } from '../../hooks/useTimer';

export function TimerDisplay() {
  const { formatDisplay, isFinished, progress } = useTimer();
  const { hours, minutes, seconds } = formatDisplay();

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* círculo de progresso */}
      <div className="relative w-64 h-64">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* círculo de fundo */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />
          {/* círculo progresso */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
            className={`transition-all duration-1000 ${
              isFinished 
                ? 'text-red-500' 
                : 'text-blue-500 dark:text-blue-400'
            }`}
            strokeLinecap="round"
          />
        </svg>
        
          {/* display tempo no centro */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="flex flex-col items-center">
                <span className={`text-4xl font-mono font-bold ${
                  isFinished 
                    ? 'text-red-500' 
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {hours}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Horas
                </span>
              </div>
              
              <span className={`text-4xl font-mono font-bold ${
                isFinished 
                  ? 'text-red-500' 
                  : 'text-gray-900 dark:text-white'
              }`}>
                :
              </span>
              
              <div className="flex flex-col items-center">
                <span className={`text-4xl font-mono font-bold ${
                  isFinished 
                    ? 'text-red-500' 
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {minutes}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Min
                </span>
              </div>
              
              <span className={`text-4xl font-mono font-bold ${
                isFinished 
                  ? 'text-red-500' 
                  : 'text-gray-900 dark:text-white'
              }`}>
                :
              </span>
              
              <div className="flex flex-col items-center">
                <span className={`text-4xl font-mono font-bold ${
                  isFinished 
                    ? 'text-red-500' 
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {seconds}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Seg
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* status */}
      {isFinished && (
        <div className="text-center">
          <p className="text-lg font-semibold text-red-500">
            ⏰ Tempo Esgotado!
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Hora de fazer uma pausa
          </p>
        </div>
      )}
    </div>
  );
} 