import { Outlet, Link } from 'react-router-dom';
import { TimerProvider } from './context/TimerContext';
import { AudioProvider } from './context/AudioContext';
import { NotificationProvider } from './context/NotificationContext';
import { ScheduleProvider } from './context/ScheduleContext';
import { ContactsProvider } from './context/ContactsContext';
import { VoiceNotesProvider } from './context/VoiceNotesContext';
import { ThemeProvider } from './context/ThemeContext';
import { BottomNavigation } from './components/Navigation/BottomNavigation';
import { ThemeToggle } from './components/ThemeToggle';

function App() {
  return (
    <ThemeProvider>
      <TimerProvider>
        <AudioProvider>
          <NotificationProvider>
            <ScheduleProvider>
              <ContactsProvider>
                <VoiceNotesProvider>
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
                            <nav className="hidden md:flex space-x-1">
                              <Link
                                to="/"
                                className="nav-link"
                              >
                                Home
                              </Link>
                              <Link
                                to="/dashboard"
                                className="nav-link"
                              >
                                Dashboard
                              </Link>
                              <Link
                                to="/study"
                                className="nav-link"
                              >
                                Estudar
                              </Link>
                              <Link
                                to="/schedule"
                                className="nav-link"
                              >
                                Agenda
                              </Link>
                              <Link
                                to="/contacts"
                                className="nav-link"
                              >
                                Contatos
                              </Link>
                              <Link
                                to="/voice-notes"
                                className="nav-link"
                              >
                                Notas de Voz
                              </Link>
                            </nav>
                            
                            {/* toggle de tema */}
                            <ThemeToggle />
                          </div>
                        </div>
                      </div>
                    </header>

                    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
                      <Outlet />
                    </main>

                    <BottomNavigation />
                  </div>
                </VoiceNotesProvider>
              </ContactsProvider>
            </ScheduleProvider>
          </NotificationProvider>
        </AudioProvider>
      </TimerProvider>
    </ThemeProvider>
  );
}

export default App; 