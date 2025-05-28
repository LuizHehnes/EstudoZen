import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, BarChart3, Calendar, Users, Mic, Target, TrendingUp, Brain, Zap } from 'lucide-react';

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

  const objectives = [
    {
      icon: Brain,
      title: 'Maximizar o Foco',
      description: 'Elimine distrações e concentre-se no que realmente importa através de técnicas comprovadas de produtividade.'
    },
    {
      icon: Target,
      title: 'Organizar o Tempo',
      description: 'Transforme o caos acadêmico em um sistema organizado e eficiente de gestão de estudos.'
    },
    {
      icon: TrendingUp,
      title: 'Acompanhar Progresso',
      description: 'Monitore seu desenvolvimento e identifique áreas de melhoria através de dados e estatísticas.'
    },
    {
      icon: Zap,
      title: 'Aumentar Produtividade',
      description: 'Aprenda mais em menos tempo com métodos científicos e ferramentas especializadas.'
    }
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
            Sua plataforma completa para estudos eficientes e organizados. 
            Transforme sua forma de aprender com foco, produtividade e zen.
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

      {/* objetivo do projeto */}
      <div className="card p-8 space-y-6 bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 border-primary-200 dark:border-primary-800">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-heading font-bold text-light-text-primary dark:text-dark-text-primary">
            O Que é o EstudoZen?
          </h2>
          <p className="text-lg text-light-text-secondary dark:text-dark-text-secondary max-w-4xl mx-auto leading-relaxed">
            O EstudoZen é uma plataforma inovadora desenvolvida para revolucionar a forma como você estuda. 
            Nosso objetivo é combinar técnicas científicas de produtividade, como a Técnica Pomodoro, 
            com ferramentas modernas de organização e acompanhamento de progresso.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {objectives.map((objective, index) => {
            const Icon = objective.icon;
            return (
              <div
                key={objective.title}
                className="text-center space-y-4 p-4"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-medium">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-heading font-semibold text-light-text-primary dark:text-dark-text-primary">
                    {objective.title}
                  </h3>
                  <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm leading-relaxed">
                    {objective.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* missão */}
      <div className="card p-8 space-y-6">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-heading font-bold text-light-text-primary dark:text-dark-text-primary">
            Nossa Missão
          </h2>
          <div className="max-w-4xl mx-auto space-y-4 text-light-text-secondary dark:text-dark-text-secondary">
            <p className="text-lg leading-relaxed">
              Acreditamos que todo estudante merece ter acesso às melhores ferramentas para potencializar seu aprendizado. 
              Por isso, criamos o EstudoZen: uma solução completa que une produtividade, organização e bem-estar.
            </p>
            <p className="text-lg leading-relaxed">
              Nossa plataforma não é apenas sobre estudar mais, mas sobre estudar melhor. Queremos ajudar você a 
              desenvolver hábitos saudáveis de estudo, manter o foco e alcançar seus objetivos acadêmicos com menos estresse e mais eficiência.
            </p>
          </div>
        </div>
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
      <div className="card p-8 text-center space-y-6 bg-gradient-to-br from-accent-50 to-primary-50 dark:from-accent-900/20 dark:to-primary-900/20 border-accent-200 dark:border-accent-800">
        <div className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-light-text-primary dark:text-dark-text-primary">
            Comece Sua Jornada de Estudos Zen
          </h2>
          <p className="text-light-text-secondary dark:text-dark-text-secondary max-w-2xl mx-auto">
            Junte-se a uma nova era de estudos inteligentes. Experimente a diferença de estudar com foco, 
            organização e as melhores práticas de produtividade.
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