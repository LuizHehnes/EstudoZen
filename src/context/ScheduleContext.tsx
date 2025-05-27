import React, { createContext, useContext, useState, useEffect } from 'react';
import localforage from 'localforage';

export interface ScheduleItem {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  subject: string;
  alertMinutes: number;
  isCompleted: boolean;
  createdAt: Date;
}

interface ScheduleContextType {
  schedules: ScheduleItem[];
  addSchedule: (schedule: Omit<ScheduleItem, 'id' | 'createdAt'>) => Promise<void>;
  updateSchedule: (id: string, schedule: Partial<ScheduleItem>) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  getScheduleById: (id: string) => ScheduleItem | undefined;
  getUpcomingSchedules: () => ScheduleItem[];
  markAsCompleted: (id: string) => Promise<void>;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useSchedule deve ser usado dentro de um ScheduleProvider');
  }
  return context;
};

interface ScheduleProviderProps {
  children: React.ReactNode;
}

export const ScheduleProvider: React.FC<ScheduleProviderProps> = ({ children }) => {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);

  useEffect(() => {
    loadSchedules();
  }, []);

  useEffect(() => {
    // verifica alertas a cada minuto
    const interval = setInterval(checkAlerts, 60000);
    return () => clearInterval(interval);
  }, [schedules]);

  const loadSchedules = async () => {
    try {
      const savedSchedules = await localforage.getItem<ScheduleItem[]>('schedules');
      if (savedSchedules) {
        // converter strings de data de volta para objetos Date
        const parsedSchedules = savedSchedules.map(schedule => ({
          ...schedule,
          date: new Date(schedule.date),
          createdAt: new Date(schedule.createdAt)
        }));
        setSchedules(parsedSchedules);
      }
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    }
  };

  const saveSchedules = async (newSchedules: ScheduleItem[]) => {
    try {
      await localforage.setItem('schedules', newSchedules);
      setSchedules(newSchedules);
    } catch (error) {
      console.error('Erro ao salvar agendamentos:', error);
    }
  };

  const checkAlerts = () => {
    const now = new Date();
    schedules.forEach(schedule => {
      if (!schedule.isCompleted) {
        const scheduleDateTime = new Date(schedule.date);
        const [hours, minutes] = schedule.time.split(':').map(Number);
        scheduleDateTime.setHours(hours, minutes, 0, 0);
        
        const alertTime = new Date(scheduleDateTime.getTime() - schedule.alertMinutes * 60000);
        
        if (now >= alertTime && now < scheduleDateTime) {
          // Mostrar notificação
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`Lembrete: ${schedule.title}`, {
              body: `${schedule.description} - ${schedule.subject}`,
              icon: '/favicon.ico'
            });
          }
        }
      }
    });
  };

  const addSchedule = async (scheduleData: Omit<ScheduleItem, 'id' | 'createdAt'>) => {
    const newSchedule: ScheduleItem = {
      ...scheduleData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    
    const newSchedules = [...schedules, newSchedule];
    await saveSchedules(newSchedules);
  };

  const updateSchedule = async (id: string, scheduleData: Partial<ScheduleItem>) => {
    const newSchedules = schedules.map(schedule =>
      schedule.id === id ? { ...schedule, ...scheduleData } : schedule
    );
    await saveSchedules(newSchedules);
  };

  const deleteSchedule = async (id: string) => {
    const newSchedules = schedules.filter(schedule => schedule.id !== id);
    await saveSchedules(newSchedules);
  };

  const getScheduleById = (id: string) => {
    return schedules.find(schedule => schedule.id === id);
  };

  const getUpcomingSchedules = () => {
    const now = new Date();
    return schedules
      .filter(schedule => {
        const scheduleDateTime = new Date(schedule.date);
        const [hours, minutes] = schedule.time.split(':').map(Number);
        scheduleDateTime.setHours(hours, minutes, 0, 0);
        return scheduleDateTime > now && !schedule.isCompleted;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      });
  };

  const markAsCompleted = async (id: string) => {
    await updateSchedule(id, { isCompleted: true });
  };

  return (
    <ScheduleContext.Provider value={{
      schedules,
      addSchedule,
      updateSchedule,
      deleteSchedule,
      getScheduleById,
      getUpcomingSchedules,
      markAsCompleted
    }}>
      {children}
    </ScheduleContext.Provider>
  );
}; 