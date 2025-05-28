import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  BarChart3, 
  Clock, 
  Calendar, 
  Users, 
  Mic,
  FileText
} from 'lucide-react';
import { StopAllAudioButton } from '../Audio/StopAllAudioButton';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';

interface NavItem {
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
}

const navItems: NavItem[] = [
  {
    path: '/',
    icon: Home,
    label: 'Home'
  },
  {
    path: '/study',
    icon: Clock,
    label: 'Estudar'
  },
  {
    path: '/schedule',
    icon: Calendar,
    label: 'Agenda'
  },
  {
    path: '/dashboard',
    icon: BarChart3,
    label: 'Stats'
  },
  {
    path: '/contacts',
    icon: Users,
    label: 'Contatos'
  },
  {
    path: '/voice-notes',
    icon: Mic,
    label: 'Voz'
  },
  {
    path: '/text-notes',
    icon: FileText,
    label: 'Texto'
  },
];

export const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const { isAnyAudioPlayingInPage } = useAudioPlayer();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-light-card/95 dark:bg-dark-card/95 backdrop-blur-lg border-t border-light-border dark:border-dark-border shadow-soft dark:shadow-dark-soft z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center space-y-1 px-3 py-2 rounded-xl transition-all duration-200 ${
                  active
                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 shadow-glow-primary'
                    : 'text-light-text-muted dark:text-dark-text-muted hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/20'
                }`}
              >
                <Icon 
                  size={20} 
                  className={`transition-colors duration-200 ${
                    active 
                      ? 'text-primary-600 dark:text-primary-400' 
                      : 'text-light-text-muted dark:text-dark-text-muted group-hover:text-primary-600 dark:group-hover:text-primary-400'
                  }`} 
                />
                <span className={`text-xs font-medium transition-colors duration-200 ${
                  active 
                    ? 'text-primary-600 dark:text-primary-400' 
                    : 'text-light-text-muted dark:text-dark-text-muted'
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Botão de parar todos os áudios - aparece apenas quando há áudios tocando */}
          <div className="flex flex-col items-center justify-center space-y-1 px-3 py-2">
            <StopAllAudioButton
              size="sm"
              variant="ghost"
              showText={true}
              buttonText="Parar"
              className={`rounded-full ${!isAnyAudioPlayingInPage() ? 'hidden' : ''}`}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}; 