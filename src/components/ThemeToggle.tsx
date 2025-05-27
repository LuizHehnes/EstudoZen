import React from 'react';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { isDark, toggleTheme, theme, setTheme } = useTheme();

  return (
    <div className="flex items-center space-x-2">
      {/* toggle simples */}
      <button
        onClick={toggleTheme}
        className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-light-bg dark:focus:ring-offset-dark-bg"
        aria-label="Alternar tema"
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-300 transition-transform duration-300 ${
            isDark ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
        
        {/* ícone do sol */}  
        <svg
          className={`absolute left-1 h-3 w-3 text-yellow-500 transition-opacity duration-300 ${
            isDark ? 'opacity-0' : 'opacity-100'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        </svg>

        {/* ícone da lua */}
        <svg
          className={`absolute right-1 h-3 w-3 text-blue-400 transition-opacity duration-300 ${
            isDark ? 'opacity-100' : 'opacity-0'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      </button>

      {/* dropdown para seleção avançada */}
      <div className="relative">
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
          className="appearance-none bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg px-3 py-1 text-sm text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition-all duration-200"
        >
          <option value="light">☀️ Claro</option>
          <option value="dark">🌙 Escuro</option>
          <option value="system">🖥️ Sistema</option>
        </select>
        
        {/* ícone de dropdown */}
        <svg
          className="absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-light-text-muted dark:text-dark-text-muted pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}; 