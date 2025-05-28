import { useTimer } from '../../hooks/useTimer';

export function ResetButton() {
  const { resetTimer } = useTimer();

  return (
    <button
      onClick={resetTimer}
      className="
        flex items-center justify-center
        w-12 h-12 rounded-full
        bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600
        transform hover:scale-105 active:scale-95
        shadow-md hover:shadow-lg
      "
      aria-label="Reiniciar timer"
      title="Reiniciar timer"
    >
      {/* ícone de reset */}
      <svg 
        className="w-5 h-5 text-gray-600 dark:text-gray-300" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
        />
      </svg>
    </button>
  );
} 