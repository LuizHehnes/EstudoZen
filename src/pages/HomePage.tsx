import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, BarChart3, Calendar, Users, Mic, BookOpen, Target, TrendingUp } from 'lucide-react';

const HomePage: React.FC = () => {
  const features = [
    {
      icon: Clock,
      title: 'Técnica Pomodoro',
      description: 'Organize seus estudos com sessões focadas e pausas estratégicas.',
      link: '/study',
      color: 'from-primary-500 to-primary-600'
    },
    {
      icon: BarChart3,
      title: 'Dashboard Inteligente',
      description: 'Visualize seu progresso e estatísticas de estudo em tempo real.',
      link: '/dashboard',
      color: 'from-accent-500 to-accent-600'
    },
    {
      icon: Calendar,
      title: 'Agenda Personalizada',
      description: 'Planeje suas sessões de estudo e compromissos acadêmicos.',
      link: '/schedule',
      color: 'from-success-500 to-success-600'
    },
    {
      icon: Users,
      title: 'Rede de Contatos',
      description: 'Conecte-se com colegas e organize grupos de estudo.',
      link: '/contacts',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Mic,
      title: 'Notas de Voz',
      description: 'Grave ideias e resumos importantes durante seus estudos.',
      link: '/voice-notes',
      color: 'from-pink-500 to-pink-600'
    }
  ];

  const stats = [
    { label: 'Sessões Concluídas', value: '0', icon: Target },
    { label: 'Horas Estudadas', value: '0h', icon: Clock },
    { label: 'Produtividade', value: '0%', icon: TrendingUp },
    { label: 'Sequência Atual', value: '0 dias', icon: BookOpen }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* hero section */}
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-heading font-bold bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 dark:from-primary-400 dark:via-primary-300 dark:to-accent-400 bg-clip-text text-transparent">
            EstudoZen
          </h1>
          <p className="text-xl md:text-2xl text-light-text-secondary dark:text-dark-text-secondary max-w-3xl mx-auto leading-relaxed">
            Transforme seus estudos com foco, organização e produtividade. 
            Sua jornada acadêmica começa aqui.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/study"
            className="btn-primary text-lg px-8 py-3 rounded-xl shadow-glow-primary"
          >
            Começar a Estudar
          </Link>
          <Link
            to="/dashboard"
            className="btn-secondary text-lg px-8 py-3 rounded-xl"
          >
            Ver Dashboard
          </Link>
        </div>
      </div>

      {/* stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="card card-hover p-6 text-center space-y-3"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 mx-auto rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
                  {stat.value}
                </div>
                <div className="text-sm text-light-text-muted dark:text-dark-text-muted">
                  {stat.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* features grid */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-heading font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
            Recursos Principais
          </h2>
          <p className="text-light-text-secondary dark:text-dark-text-secondary max-w-2xl mx-auto">
            Descubra todas as ferramentas que vão revolucionar sua forma de estudar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.title}
                to={feature.link}
                className="card card-hover p-6 space-y-4 group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-medium group-hover:shadow-strong transition-all duration-300`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-heading font-semibold text-light-text-primary dark:text-dark-text-primary group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="flex items-center text-primary-600 dark:text-primary-400 font-medium group-hover:translate-x-1 transition-transform">
                  Explorar
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* call to action */}
      <div className="card p-8 text-center space-y-6 bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 border-primary-200 dark:border-primary-800">
        <div className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-light-text-primary dark:text-dark-text-primary">
            Pronto para transformar seus estudos?
          </h2>
          <p className="text-light-text-secondary dark:text-dark-text-secondary max-w-2xl mx-auto">
            Junte-se a milhares de estudantes que já descobriram o poder do foco e da organização.
          </p>
        </div>
        
        <Link
          to="/study"
          className="btn-accent text-lg px-8 py-3 rounded-xl inline-flex items-center space-x-2"
        >
          <Clock className="w-5 h-5" />
          <span>Iniciar Primeira Sessão</span>
        </Link>
      </div>
    </div>
  );
};

export default HomePage; 