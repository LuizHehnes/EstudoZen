import React, { createContext, useContext, useState, useEffect } from 'react';

interface NotificationContextType {
  isBlocked: boolean;
  toggleBlock: () => void;
  requestPermission: () => Promise<void>;
  hasPermission: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification deve ser usado dentro de um NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [isBlocked, setIsBlocked] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    // verificar se o navegador suporta notificações
    if ('Notification' in window) {
      setHasPermission(Notification.permission === 'granted');
    }
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setHasPermission(permission === 'granted');
    }
  };

  const toggleBlock = () => {
    setIsBlocked(!isBlocked);
    
    if (!isBlocked) {
      // simula bloqueio de notificações
      console.log('Modo foco ativado - notificações bloqueadas');
    } else {
      console.log('Modo foco desativado - notificações liberadas');
    }
  };

  return (
    <NotificationContext.Provider value={{
      isBlocked,
      toggleBlock,
      requestPermission,
      hasPermission
    }}>
      {children}
    </NotificationContext.Provider>
  );
}; 