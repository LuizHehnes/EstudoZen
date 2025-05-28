import React from 'react';
import { StatsDashboard } from '../components/Stats';
import { useSchedule } from '../context/ScheduleContext';
import { useContacts } from '../context/ContactsContext';
import { useVoiceNotes } from '../context/VoiceNotesContext';
import { useTextNotes } from '../context/TextNotesContext';
import { Calendar, Users, Mic, FileText, AlertCircle, TrendingUp, Clock } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { schedules, getUpcomingSchedules } = useSchedule();
  const { contacts } = useContacts();
  const { voiceNotes } = useVoiceNotes();
  const { textNotes, getFavoriteTextNotes } = useTextNotes();

  const upcomingSchedules = getUpcomingSchedules();
  const completedSchedules = schedules.filter(s => s.isCompleted);
  const totalVoiceDuration = voiceNotes.reduce((total, note) => total + note.duration, 0);
  const favoriteTextNotes = getFavoriteTextNotes();

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const quickStats = [
    {
      title: 'Agendamentos',
      value: schedules.length,
      subtitle: `${upcomingSchedules.length} próximos`,
      icon: Calendar,
      color: 'from-primary-500 to-primary-600',
      bgColor: 'bg-primary-100 dark:bg-primary-900/30'
    },
    {
      title: 'Contatos',
      value: contacts.length,
      subtitle: 'Professores e monitores',
      icon: Users,
      color: 'from-success-500 to-success-600',
      bgColor: 'bg-success-100 dark:bg-success-900/30'
    },
    {
      title: 'Notas de Voz',
      value: voiceNotes.length,
      subtitle: formatDuration(totalVoiceDuration),
      icon: Mic,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30'
    },
    {
      title: 'Notas de Texto',
      value: textNotes.length,
      subtitle: `${favoriteTextNotes.length} favoritas`,
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* header */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-light-text-primary dark:text-dark-text-primary">
          Dashboard
        </h1>
        <p className="text-light-text-secondary dark:text-dark-text-secondary text-lg">
          Acompanhe seu progresso e estatísticas de estudo
        </p>
      </div>

      {/* quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className="card card-hover p-6 space-y-4"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-light-text-muted dark:text-dark-text-muted">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
                    {stat.value}
                  </p>
                  <p className="text-xs text-light-text-muted dark:text-dark-text-muted">
                    {stat.subtitle}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <Icon size={24} className="text-primary-600 dark:text-primary-400" />
                </div>
              </div>
              
              {/* Progress indicator */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                <div 
                  className={`h-1 rounded-full bg-gradient-to-r ${stat.color}`}
                  style={{ width: `${Math.min((stat.value / 10) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* main dashboard */}
      <div className="card p-6">
        <StatsDashboard />
      </div>

      {/* recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* próximos agendamentos */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-heading font-semibold text-light-text-primary dark:text-dark-text-primary">
              Próximos Agendamentos
            </h3>
            <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
              <Calendar size={20} className="text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          
          {upcomingSchedules.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Calendar size={24} className="text-gray-400" />
              </div>
              <p className="text-light-text-muted dark:text-dark-text-muted">
                Nenhum agendamento próximo
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingSchedules.slice(0, 3).map((schedule, index) => (
                <div 
                  key={schedule.id} 
                  className="flex items-center space-x-4 p-4 bg-light-surface dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border hover:shadow-soft dark:hover:shadow-dark-soft transition-all duration-200"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-3 h-3 bg-primary-500 dark:bg-primary-400 rounded-full animate-pulse-glow"></div>
                  <div className="flex-1 space-y-1">
                    <p className="font-medium text-light-text-primary dark:text-dark-text-primary">
                      {schedule.title}
                    </p>
                    <p className="text-sm text-light-text-muted dark:text-dark-text-muted">
                      {schedule.subject}
                    </p>
                  </div>
                  <div className="text-sm text-light-text-muted dark:text-dark-text-muted">
                    {schedule.date.toLocaleDateString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* notas de voz recentes */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-heading font-semibold text-light-text-primary dark:text-dark-text-primary">
              Notas de Voz Recentes
            </h3>
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Mic size={20} className="text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          
          {voiceNotes.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Mic size={24} className="text-gray-400" />
              </div>
              <p className="text-light-text-muted dark:text-dark-text-muted">
                Nenhuma nota de voz gravada
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {voiceNotes.slice(-3).reverse().map((note, index) => (
                <div 
                  key={note.id} 
                  className="flex items-center space-x-4 p-4 bg-light-surface dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border hover:shadow-soft dark:hover:shadow-dark-soft transition-all duration-200"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-3 h-3 bg-purple-500 dark:bg-purple-400 rounded-full"></div>
                  <div className="flex-1 space-y-1">
                    <p className="font-medium text-light-text-primary dark:text-dark-text-primary">
                      {note.title}
                    </p>
                    <p className="text-sm text-light-text-muted dark:text-dark-text-muted">
                      {note.subject}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-light-text-muted dark:text-dark-text-muted">
                    <Clock size={14} />
                    <span>{formatDuration(note.duration)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* notas de texto recentes */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-heading font-semibold text-light-text-primary dark:text-dark-text-primary">
              Notas de Texto Recentes
            </h3>
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <FileText size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          
          {textNotes.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <FileText size={24} className="text-gray-400" />
              </div>
              <p className="text-light-text-muted dark:text-dark-text-muted">
                Nenhuma nota de texto criada
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {textNotes
                .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
                .slice(0, 3)
                .map((note, index) => (
                <div 
                  key={note.id} 
                  className="flex items-center space-x-4 p-4 bg-light-surface dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border hover:shadow-soft dark:hover:shadow-dark-soft transition-all duration-200"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: note.color }}
                  ></div>
                  <div className="flex-1 space-y-1">
                    <p className="font-medium text-light-text-primary dark:text-dark-text-primary">
                      {note.title}
                    </p>
                    <p className="text-sm text-light-text-muted dark:text-dark-text-muted">
                      {note.subject}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-light-text-muted dark:text-dark-text-muted">
                    <span>{note.blocks.length} bloco{note.blocks.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* insights */}
      <div className="card p-6 space-y-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-accent-100 dark:bg-accent-900/30">
            <TrendingUp size={20} className="text-accent-600 dark:text-accent-400" />
          </div>
          <h3 className="text-xl font-heading font-semibold text-light-text-primary dark:text-dark-text-primary">
            Insights e Recomendações
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schedules.length > 0 && completedSchedules.length / schedules.length < 0.5 && (
            <div className="p-4 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-xl">
              <div className="flex items-start space-x-3">
                <AlertCircle size={20} className="text-warning-600 dark:text-warning-400 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-medium text-warning-800 dark:text-warning-200">
                    Melhore sua taxa de conclusão
                  </h4>
                  <p className="text-sm text-warning-700 dark:text-warning-300">
                    Você tem uma taxa de conclusão de {Math.round((completedSchedules.length / schedules.length) * 100)}%. 
                    Tente quebrar tarefas grandes em menores.
                  </p>
                </div>
              </div>
            </div>
          )}

          {voiceNotes.length > 5 && (
            <div className="p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl">
              <div className="flex items-start space-x-3">
                <Mic size={20} className="text-primary-600 dark:text-primary-400 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-medium text-primary-800 dark:text-primary-200">
                    Organize suas notas de voz
                  </h4>
                  <p className="text-sm text-primary-700 dark:text-primary-300">
                    Você tem {voiceNotes.length} notas de voz. Considere organizá-las por tags para facilitar a busca.
                  </p>
                </div>
              </div>
            </div>
          )}

          {textNotes.length > 10 && favoriteTextNotes.length < 3 && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
              <div className="flex items-start space-x-3">
                <FileText size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200">
                    Marque suas notas importantes
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Você tem {textNotes.length} notas de texto. Marque as mais importantes como favoritas para acesso rápido.
                  </p>
                </div>
              </div>
            </div>
          )}

          {contacts.length === 0 && (
            <div className="p-4 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-xl">
              <div className="flex items-start space-x-3">
                <Users size={20} className="text-success-600 dark:text-success-400 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-medium text-success-800 dark:text-success-200">
                    Adicione contatos
                  </h4>
                  <p className="text-sm text-success-700 dark:text-success-300">
                    Cadastre seus professores e monitores para ter acesso rápido às informações de contato.
                  </p>
                </div>
              </div>
            </div>
          )}

          {upcomingSchedules.length === 0 && schedules.length > 0 && (
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl">
              <div className="flex items-start space-x-3">
                <Calendar size={20} className="text-purple-600 dark:text-purple-400 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-medium text-purple-800 dark:text-purple-200">
                    Planeje o futuro
                  </h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    Você não tem agendamentos futuros. Que tal planejar suas próximas sessões de estudo?
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 