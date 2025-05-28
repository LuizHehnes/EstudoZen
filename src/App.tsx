import { Outlet, Link } from 'react-router-dom';
import { TimerProvider } from './context/TimerContext';
import { AudioProvider } from './context/AudioContext';
import { StudySessionProvider } from './context/StudySessionContext';
import { StudyModeProvider } from './context/StudyModeContext';
import { NotificationProvider } from './context/NotificationContext';
import { ScheduleProvider } from './context/ScheduleContext';
import { ContactsProvider } from './context/ContactsContext';
import { VoiceNotesProvider } from './context/VoiceNotesContext';
import { TextNotesProvider } from './context/TextNotesContext';
import { ThemeProvider } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';
import { BottomNavigation } from './components/Navigation/BottomNavigation';
import { PersistentIndicator } from './components/StudySession';
import { PersistentAudioControl } from './components/Audio';
import { StudyModeTimer } from './components/Timer';
import { useState } from 'react';

const AppContent = () => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-300">
      <header className="bg-light-card dark:bg-dark-card shadow-soft dark:shadow-dark-soft border-b border-light-border dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                {/* logo com gradiente */}
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                  <span className="text-white font-bold text-lg">E</span>
                </div>
                <h1 className="text-2xl font-heading font-bold bg-gradient-to-r from-primary-600 to-primary-500 dark:from-primary-400 dark:to-primary-300 bg-clip-text text-transparent">
                  EstudoZen
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Informações do usuário */}
              {user && (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-3 text-light-text-primary dark:text-dark-text-primary hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center text-white font-medium text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="hidden sm:block text-sm font-medium">{user.name}</span>
                    </div>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Menu dropdown */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-light-card dark:bg-dark-card rounded-lg shadow-strong dark:shadow-dark-strong border border-light-border dark:border-dark-border py-1 z-50">
                      <div className="px-4 py-2 border-b border-light-border dark:border-dark-border">
                        <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">{user.name}</p>
                        <p className="text-xs text-light-text-muted dark:text-dark-text-muted">{user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg dark:hover:bg-dark-bg transition-colors duration-200"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Perfil
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-error-600 dark:text-error-400 hover:bg-light-bg dark:hover:bg-dark-bg transition-colors duration-200"
                      >
                        Sair
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        <Outlet />
      </main>

      {user && <BottomNavigation />}
      {user && <PersistentIndicator />}
      {user && <PersistentAudioControl />}
      {user && <StudyModeTimer />}
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <StudyModeProvider>
        <TimerProvider>
          <AudioProvider>
            <StudySessionProvider>
              <NotificationProvider>
                <ScheduleProvider>
                  <ContactsProvider>
                    <VoiceNotesProvider>
                      <TextNotesProvider>
                        <AppContent />
                      </TextNotesProvider>
                    </VoiceNotesProvider>
                  </ContactsProvider>
                </ScheduleProvider>
              </NotificationProvider>
            </StudySessionProvider>
          </AudioProvider>
        </TimerProvider>
      </StudyModeProvider>
    </ThemeProvider>
  );
}

export default App; 