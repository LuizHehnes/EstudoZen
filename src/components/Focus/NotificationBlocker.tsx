import React from 'react';
import { Shield, ShieldOff, Bell, BellOff } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

interface NotificationBlockerProps {
  className?: string;
}

export const NotificationBlocker: React.FC<NotificationBlockerProps> = ({ className = '' }) => {
  const { isBlocked, toggleBlock, requestPermission, hasPermission } = useNotification();

  const handleToggleBlock = async () => {
    if (!hasPermission) {
      await requestPermission();
    }
    toggleBlock();
  };

  return (
    <div className={`bg-light-card dark:bg-dark-card rounded-xl shadow-soft dark:shadow-dark-soft border border-light-border dark:border-dark-border p-6 ${className}`}>
      <div className="text-center">
        <div className="flex justify-center mb-4">
          {isBlocked ? (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
              <ShieldOff size={32} className="text-red-600 dark:text-red-400" />
            </div>
          ) : (
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <Shield size={32} className="text-green-600 dark:text-green-400" />
            </div>
          )}
        </div>

        <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
          Modo Foco
        </h3>

        <p className="text-sm text-light-text-muted dark:text-dark-text-muted mb-4">
          {isBlocked 
            ? 'Notificações bloqueadas para máxima concentração'
            : 'Clique para ativar o modo foco e bloquear distrações'
          }
        </p>

        <button
          onClick={handleToggleBlock}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            isBlocked
              ? 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white'
              : 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            {isBlocked ? (
              <>
                <BellOff size={20} />
                <span>Desativar Modo Foco</span>
              </>
            ) : (
              <>
                <Bell size={20} />
                <span>Ativar Modo Foco</span>
              </>
            )}
          </div>
        </button>

        {!hasPermission && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Para usar o modo foco, permita notificações no navegador
            </p>
          </div>
        )}

        {isBlocked && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-center space-x-2 text-sm text-light-text-muted dark:text-dark-text-muted">
              <div className="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full animate-pulse"></div>
              <span>Modo foco ativo</span>
            </div>
            
            <div className="text-xs text-light-text-muted dark:text-dark-text-muted">
              Notificações do sistema estão temporariamente bloqueadas
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 