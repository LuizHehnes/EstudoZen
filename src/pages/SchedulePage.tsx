import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, Bell, CheckCircle, Trash2, Edit } from 'lucide-react';
import { useSchedule } from '../context/ScheduleContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const SchedulePage: React.FC = () => {
  const { schedules, deleteSchedule, markAsCompleted, getUpcomingSchedules } = useSchedule();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');

  const filteredSchedules = () => {
    switch (filter) {
      case 'upcoming':
        return getUpcomingSchedules();
      case 'completed':
        return schedules.filter(s => s.isCompleted);
      default:
        return schedules;
    }
  };

  const formatDateTime = (date: Date, time: string) => {
    const [hours, minutes] = time.split(':');
    const dateTime = new Date(date);
    dateTime.setHours(parseInt(hours), parseInt(minutes));
    return format(dateTime, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const getAlertText = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min antes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h antes`;
    }
    return `${hours}h ${remainingMinutes}min antes`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-neutral-800">
            Agendamentos
          </h1>
          <p className="text-neutral-600 mt-1">
            Gerencie seus compromissos e receba alertas
          </p>
        </div>
        
        <Link
          to="/schedule/new"
          className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          <span>Novo Agendamento</span>
        </Link>
      </div>

      {/* filtros */}
      <div className="flex space-x-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          Todos ({schedules.length})
        </button>
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'upcoming'
              ? 'bg-primary-600 text-white'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          Próximos ({getUpcomingSchedules().length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'completed'
              ? 'bg-primary-600 text-white'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          Concluídos ({schedules.filter(s => s.isCompleted).length})
        </button>
      </div>

      {/* lista de agendamentos */}
      <div className="space-y-4">
        {filteredSchedules().length === 0 ? (
          <div className="text-center py-12">
            <Calendar size={48} className="mx-auto text-neutral-400 mb-4" />
            <h3 className="text-lg font-medium text-neutral-600 mb-2">
              {filter === 'all' && 'Nenhum agendamento encontrado'}
              {filter === 'upcoming' && 'Nenhum agendamento próximo'}
              {filter === 'completed' && 'Nenhum agendamento concluído'}
            </h3>
            <p className="text-neutral-500 mb-4">
              Crie seu primeiro agendamento para começar
            </p>
            <Link
              to="/schedule/new"
              className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={20} />
              <span>Criar Agendamento</span>
            </Link>
          </div>
        ) : (
          filteredSchedules().map((schedule) => (
            <div
              key={schedule.id}
              className={`bg-white rounded-xl shadow-soft p-6 border-l-4 ${
                schedule.isCompleted
                  ? 'border-green-500'
                  : 'border-primary-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className={`text-lg font-semibold ${
                      schedule.isCompleted ? 'text-neutral-500 line-through' : 'text-neutral-800'
                    }`}>
                      {schedule.title}
                    </h3>
                    {schedule.isCompleted && (
                      <CheckCircle size={20} className="text-green-500" />
                    )}
                  </div>
                  
                  <p className="text-neutral-600 mb-3">
                    {schedule.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-neutral-500">
                    <div className="flex items-center space-x-1">
                      <Calendar size={16} />
                      <span>{formatDateTime(schedule.date, schedule.time)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Bell size={16} />
                      <span>Alerta {getAlertText(schedule.alertMinutes)}</span>
                    </div>
                    
                    <div className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs">
                      {schedule.subject}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {!schedule.isCompleted && (
                    <>
                      <button
                        onClick={() => markAsCompleted(schedule.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Marcar como concluído"
                      >
                        <CheckCircle size={20} />
                      </button>
                      
                      <Link
                        to={`/schedule/edit/${schedule.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit size={20} />
                      </Link>
                    </>
                  )}
                  
                  <button
                    onClick={() => deleteSchedule(schedule.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}; 