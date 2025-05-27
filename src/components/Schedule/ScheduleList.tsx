import React, { useEffect, useState } from 'react';
import { scheduleService } from '../../services/scheduleService';
import type { ScheduleItem } from '../../services/scheduleService';

export function ScheduleList() {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = scheduleService.addListener((items) => {
      setScheduleItems(items);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(event.target.value);
    setSelectedDate(date);
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const getFilteredItems = (): ScheduleItem[] => {
    const dateString = formatDate(selectedDate);
    
    return scheduleItems.filter(item => {
      const itemStartDate = new Date(item.startTime).toISOString().split('T')[0];
      return itemStartDate === dateString;
    }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  };

  const handleToggleComplete = async (id: string, currentStatus: boolean) => {
    await scheduleService.updateItem(id, { isCompleted: !currentStatus });
  };

  const handleDeleteItem = async (id: string) => {
    await scheduleService.removeItem(id);
  };

  const formatTime = (isoString: string): string => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredItems = getFilteredItems();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Agenda</h2>
        
        <div className="flex items-center mb-4">
          <input
            type="date"
            value={formatDate(selectedDate)}
            onChange={handleDateChange}
            className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
          Carregando...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
          Nenhuma tarefa agendada para esta data
        </div>
      ) : (
        <ul className="space-y-3">
          {filteredItems.map((item) => (
            <li 
              key={item.id} 
              className={`border-l-4 ${
                item.type === 'study' 
                  ? 'border-blue-500' 
                  : 'border-green-500'
              } bg-gray-50 dark:bg-gray-700 rounded-r-md p-4 flex items-center justify-between`}
            >
              <div className="flex-1">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={item.isCompleted}
                    onChange={() => handleToggleComplete(item.id, item.isCompleted)}
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <h3 className={`ml-3 text-lg font-medium ${
                    item.isCompleted 
                      ? 'text-gray-400 dark:text-gray-500 line-through' 
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {item.title}
                  </h3>
                </div>
                
                {item.description && (
                  <p className="mt-1 ml-8 text-sm text-gray-500 dark:text-gray-400">
                    {item.description}
                  </p>
                )}
                
                <div className="mt-2 ml-8 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  <span className="mr-2">⏰</span>
                  <span>
                    {formatTime(item.startTime)} - {formatTime(item.endTime)}
                  </span>
                  
                  {item.reminder && (
                    <span className="ml-3 text-blue-500 dark:text-blue-400 flex items-center">
                      <span className="mr-1">🔔</span>
                      Lembrete: {formatTime(item.reminderTime || item.startTime)}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => window.location.href = `/schedule/edit/${item.id}`}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  title="Editar"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  title="Excluir"
                >
                  🗑️
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      
      <div className="mt-6 text-center">
        <button 
          onClick={() => window.location.href = '/schedule/new'}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm"
        >
          + Adicionar Novo
        </button>
      </div>
    </div>
  );
} 