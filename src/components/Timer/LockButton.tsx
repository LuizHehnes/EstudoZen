import React, { useEffect, useState } from 'react';
import { notificationBlocker } from '../../services/notificationBlocker';
import type { NotificationState } from '../../services/notificationBlocker';

export function LockButton() {
  const [notificationState, setNotificationState] = useState<NotificationState>(
    notificationBlocker.currentState
  );

  useEffect(() => {
    // registra listener para mudanças no estado de notificações
    const unsubscribe = notificationBlocker.addListener((state) => {
      setNotificationState(state);
    });

    // solicita permissão ao montar o componente
    if (notificationState.permission === 'default') {
      notificationBlocker.requestPermission();
    }

    return () => {
      unsubscribe();
    };
  }, []);

  const handleToggleBlock = () => {
    if (notificationState.isSessionActive) {
      notificationBlocker.endStudySession();
    } else {
      notificationBlocker.startStudySession();
    }
  };

  const getStatusText = () => {
    if (notificationState.permission !== 'granted') {
      return 'Permissão negada';
    }
    return notificationState.isBlocked 
      ? 'Notificações bloqueadas' 
      : 'Bloquear notificações';
  };

  return (
    <button
      onClick={handleToggleBlock}
      disabled={notificationState.permission !== 'granted'}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
        notificationState.isBlocked
          ? 'bg-red-500 hover:bg-red-600 text-white'
          : 'bg-blue-500 hover:bg-blue-600 text-white'
      } ${
        notificationState.permission !== 'granted' ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      title={notificationState.permission !== 'granted' ? 'Permissão de notificações necessária' : ''}
    >
      <span className="material-icons-outlined">
        {notificationState.isBlocked ? 'notifications_off' : 'notifications'}
      </span>
      <span>{getStatusText()}</span>
    </button>
  );
} 