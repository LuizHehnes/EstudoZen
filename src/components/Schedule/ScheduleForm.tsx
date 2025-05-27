import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { scheduleService } from '../../services/scheduleService';
import type { ScheduleItem } from '../../services/scheduleService';
import { notificationBlocker } from '../../services/notificationBlocker';

interface FormData {
  title: string;
  description: string;
  type: 'study' | 'task';
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  reminder: boolean;
  reminderMinutes: number;
}

const defaultFormData: FormData = {
  title: '',
  description: '',
  type: 'study',
  startDate: new Date().toISOString().split('T')[0],
  startTime: '08:00',
  endDate: new Date().toISOString().split('T')[0],
  endTime: '09:00',
  reminder: false,
  reminderMinutes: 15
};

const reminderOptions = [
  { value: 5, label: '5 minutos antes' },
  { value: 15, label: '15 minutos antes' },
  { value: 30, label: '30 minutos antes' },
  { value: 60, label: '1 hora antes' }
];

export function ScheduleForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    notificationBlocker.permission
  );

  const isEditMode = !!id;

  useEffect(() => {
    if (isEditMode) {
      const loadItem = async () => {
        setLoading(true);
        try {
          const item = await scheduleService.getItemById(id);
          
          if (!item) {
            setError('Item não encontrado');
            return;
          }
          
          const startDate = new Date(item.startTime);
          const endDate = new Date(item.endTime);
          
          setFormData({
            title: item.title,
            description: item.description || '',
            type: item.type,
            startDate: startDate.toISOString().split('T')[0],
            startTime: startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
            endDate: endDate.toISOString().split('T')[0],
            endTime: endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
            reminder: !!item.reminder,
            reminderMinutes: item.reminderTime 
              ? Math.round((new Date(item.startTime).getTime() - new Date(item.reminderTime).getTime()) / 60000)
              : 15
          });
        } catch (err) {
          setError('Erro ao carregar dados');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      
      loadItem();
    }
  }, [id, isEditMode]);

  useEffect(() => {
    const unsubscribe = notificationBlocker.addListener((state) => {
      setNotificationPermission(state.permission);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : value
    }));
  };

  const requestNotificationPermission = async () => {
    await notificationBlocker.requestPermission();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
      
      let reminderTime: string | undefined = undefined;
      
      if (formData.reminder) {
        const reminderDate = new Date(startDateTime.getTime() - (formData.reminderMinutes * 60000));
        reminderTime = reminderDate.toISOString();
      }
      
      const scheduleData: Omit<ScheduleItem, 'id'> = {
        title: formData.title,
        description: formData.description || undefined,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        isCompleted: false,
        type: formData.type,
        reminder: formData.reminder,
        reminderTime
      };
      
      if (isEditMode) {
        await scheduleService.updateItem(id, scheduleData);
      } else {
        await scheduleService.addItem(scheduleData);
      }
      
      navigate('/schedule');
    } catch (err) {
      console.error('Erro ao salvar:', err);
      setError('Erro ao salvar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        Carregando...
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        {isEditMode ? 'Editar Agendamento' : 'Novo Agendamento'}
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Título
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            value={formData.title}
            onChange={handleInputChange}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Descrição
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleInputChange}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
          />
        </div>
        
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tipo
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
          >
            <option value="study">Estudo</option>
            <option value="task">Tarefa</option>
          </select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Data de Início
            </label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              required
              value={formData.startDate}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hora de Início
            </label>
            <input
              id="startTime"
              name="startTime"
              type="time"
              required
              value={formData.startTime}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Data de Término
            </label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              required
              value={formData.endDate}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hora de Término
            </label>
            <input
              id="endTime"
              name="endTime"
              type="time"
              required
              value={formData.endTime}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
          <div className="flex items-center mb-4">
            <input
              id="reminder"
              name="reminder"
              type="checkbox"
              checked={formData.reminder}
              onChange={handleInputChange}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={notificationPermission !== 'granted'}
            />
            <label htmlFor="reminder" className="ml-2 block text-sm text-gray-900 dark:text-white">
              Enviar lembrete
            </label>
            
            {notificationPermission !== 'granted' && (
              <button
                type="button"
                onClick={requestNotificationPermission}
                className="ml-3 text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 underline"
              >
                Permitir notificações
              </button>
            )}
          </div>
          
          {formData.reminder && (
            <div>
              <label htmlFor="reminderMinutes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Quando enviar o lembrete?
              </label>
              <select
                id="reminderMinutes"
                name="reminderMinutes"
                value={formData.reminderMinutes}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
              >
                {reminderOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={() => navigate('/schedule')}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md shadow-sm disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
} 