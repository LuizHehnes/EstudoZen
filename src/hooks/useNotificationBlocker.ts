import { useState, useEffect } from 'react';
import { notificationBlocker } from '../services/notificationBlocker';
import type { NotificationState } from '../services/notificationBlocker';

export const useNotificationBlocker = () => {
  const [state, setState] = useState<NotificationState>(notificationBlocker.currentState);

  useEffect(() => {
    // listener mudanças de estado
    const unsubscribe = notificationBlocker.addListener(setState);
    
    // Cleanup
    return unsubscribe;
  }, []);

  const requestPermission = async () => {
    try {
      await notificationBlocker.requestPermission();
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
    }
  };

  const toggleBlock = () => {
    if (state.isBlocked) {
      notificationBlocker.unblockNotifications();
    } else {
      notificationBlocker.blockNotifications();
    }
  };

  const startStudySession = () => {
    notificationBlocker.startStudySession();
  };

  const endStudySession = () => {
    notificationBlocker.endStudySession();
  };

  return {
    ...state,
    requestPermission,
    toggleBlock,
    startStudySession,
    endStudySession,
  };
}; 