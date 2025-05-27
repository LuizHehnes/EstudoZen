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
    <div className={`bg-white rounded-xl shadow-soft p-6 ${className}`}>
      <div className="text-center">
        <div className="flex justify-center mb-4">
          {isBlocked ? (
            <div className="p-3 bg-red-100 rounded-full">
              <ShieldOff size={32} className="text-red-600" />
            </div>
          ) : (
            <div className="p-3 bg-green-100 rounded-full">
              <Shield size={32} className="text-green-600" />
            </div>
          )}
        </div>

        <h3 className="text-lg font-semibold text-neutral-800 mb-2">
          Modo Foco
        </h3>

        <p className="text-sm text-neutral-600 mb-4">
          {isBlocked 
            ? 'Notificações bloqueadas para máxima concentração'
            : 'Clique para ativar o modo foco e bloquear distrações'
          }
        </p>

        <button
          onClick={handleToggleBlock}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            isBlocked
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
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
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Para usar o modo foco, permita notificações no navegador
            </p>
          </div>
        )}

        {isBlocked && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-center space-x-2 text-sm text-neutral-600">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span>Modo foco ativo</span>
            </div>
            
            <div className="text-xs text-neutral-500">
              Notificações do sistema estão temporariamente bloqueadas
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 