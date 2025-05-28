import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Bell, BookOpen } from 'lucide-react';
import { useSchedule } from '../context/ScheduleContext';

export const ScheduleFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addSchedule, updateSchedule, getScheduleById } = useSchedule();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    subject: '',
    alertMinutes: 15
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(id);

  useEffect(() => {
    if (isEditing && id) {
      const schedule = getScheduleById(id);
      if (schedule) {
        setFormData({
          title: schedule.title,
          description: schedule.description,
          date: schedule.date.toISOString().split('T')[0],
          time: schedule.time,
          subject: schedule.subject,
          alertMinutes: schedule.alertMinutes
        });
      }
    }
  }, [id, isEditing, getScheduleById]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    if (!formData.date) {
      newErrors.date = 'Data é obrigatória';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.date = 'Data não pode ser no passado';
      }
    }

    if (!formData.time) {
      newErrors.time = 'Horário é obrigatório';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Disciplina é obrigatória';
    }

    if (formData.alertMinutes < 0) {
      newErrors.alertMinutes = 'Tempo de alerta deve ser positivo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const scheduleData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: new Date(formData.date),
        time: formData.time,
        subject: formData.subject.trim(),
        alertMinutes: formData.alertMinutes,
        isCompleted: false
      };

      if (isEditing && id) {
        await updateSchedule(id, scheduleData);
      } else {
        await addSchedule(scheduleData);
      }

      navigate('/schedule');
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // limpa erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const alertOptions = [
    { value: 5, label: '5 minutos antes' },
    { value: 10, label: '10 minutos antes' },
    { value: 15, label: '15 minutos antes' },
    { value: 30, label: '30 minutos antes' },
    { value: 60, label: '1 hora antes' },
    { value: 120, label: '2 horas antes' },
    { value: 1440, label: '1 dia antes' }
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/schedule')}
          className="p-2 text-light-text-muted dark:text-dark-text-muted hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        
        <div>
          <h1 className="text-3xl font-heading font-bold text-light-text-primary dark:text-dark-text-primary">
            {isEditing ? 'Editar Agendamento' : 'Novo Agendamento'}
          </h1>
          <p className="text-light-text-muted dark:text-dark-text-muted mt-1">
            {isEditing ? 'Atualize as informações do agendamento' : 'Crie um novo compromisso com alertas'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-light-card dark:bg-dark-card rounded-xl shadow-soft dark:shadow-dark-soft border border-light-border dark:border-dark-border p-6 space-y-6">
        {/* titulo */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
            Título *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary ${
              errors.title ? 'border-red-500' : 'border-light-border dark:border-dark-border'
            }`}
            placeholder="Ex: Prova de Matemática"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
          )}
        </div>

        {/* descrição */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
            Descrição
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
            placeholder="Detalhes adicionais sobre o compromisso..."
          />
        </div>

        {/* data e hora */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
              <Calendar size={16} className="inline mr-1" />
              Data *
            </label>
            <input
              type="date"
              id="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary ${
                errors.date ? 'border-red-500' : 'border-light-border dark:border-dark-border'
              }`}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.date}</p>
            )}
          </div>

          <div>
            <label htmlFor="time" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
              <Clock size={16} className="inline mr-1" />
              Horário *
            </label>
            <input
              type="time"
              id="time"
              value={formData.time}
              onChange={(e) => handleInputChange('time', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary ${
                errors.time ? 'border-red-500' : 'border-light-border dark:border-dark-border'
              }`}
            />
            {errors.time && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.time}</p>
            )}
          </div>
        </div>

        {/* disciplina */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
            <BookOpen size={16} className="inline mr-1" />
            Disciplina *
          </label>
          <input
            type="text"
            id="subject"
            value={formData.subject}
            onChange={(e) => handleInputChange('subject', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary ${
              errors.subject ? 'border-red-500' : 'border-light-border dark:border-dark-border'
            }`}
            placeholder="Ex: Matemática, História, Física..."
          />
          {errors.subject && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.subject}</p>
          )}
        </div>

        {/* alerta */}
        <div>
          <label htmlFor="alertMinutes" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
            <Bell size={16} className="inline mr-1" />
            Alerta
          </label>
          <select
            id="alertMinutes"
            value={formData.alertMinutes}
            onChange={(e) => handleInputChange('alertMinutes', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
          >
            {alertOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* botões */}
        <div className="flex space-x-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/schedule')}
            className="flex-1 py-2 px-4 border border-light-border dark:border-dark-border text-light-text-secondary dark:text-dark-text-secondary rounded-lg hover:bg-light-surface dark:hover:bg-dark-surface transition-colors"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-2 px-4 bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting 
              ? 'Salvando...' 
              : isEditing 
                ? 'Atualizar' 
                : 'Criar Agendamento'
            }
          </button>
        </div>
      </form>
    </div>
  );
}; 