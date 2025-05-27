import React, { useState } from 'react';
import { Timer } from '../components/Timer';
import { Stopwatch } from '../components/Timer/Stopwatch';
import { AmbientSounds } from '../components/Audio/AmbientSounds';
import { NotificationBlocker } from '../components/Focus/NotificationBlocker';
import { Clock, Volume2, Shield, Mic, Target, TrendingUp, Play } from 'lucide-react';

interface Goal {
  id: number;
  task: string;
  completed: boolean;
}

export const StudyPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'timer' | 'sounds' | 'focus' | 'stopwatch'>('timer');
  const [goals, setGoals] = useState<Goal[]>([
    { id: 1, task: '2 horas de matemática', completed: false },
    { id: 2, task: 'Revisar história', completed: true },
    { id: 3, task: 'Exercícios de física', completed: false }
  ]);

  const handleGoalToggle = (goalId: number) => {
    setGoals(prevGoals => 
      prevGoals.map(goal => 
        goal.id === goalId 
          ? { ...goal, completed: !goal.completed }
          : goal
      )
    );
  };

  const tabs = [
    { id: 'timer', label: 'Pomodoro', icon: Clock, color: 'from-primary-500 to-primary-600' },
    { id: 'stopwatch', label: 'Cronômetro', icon: Clock, color: 'from-accent-500 to-accent-600' },
    { id: 'sounds', label: 'Sons', icon: Volume2, color: 'from-success-500 to-success-600' },
    { id: 'focus', label: 'Foco', icon: Shield, color: 'from-purple-500 to-purple-600' }
  ];

  return (
    <div className="space-y-8 pb-20 animate-fade-in">
      {/* header */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-light-text-primary dark:text-dark-text-primary">
          Área de Estudo
        </h1>
        <p className="text-light-text-secondary dark:text-dark-text-secondary text-lg">
          Ferramentas para maximizar sua concentração e produtividade
        </p>
      </div>

      {/* navigation tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary-600 dark:bg-primary-500 text-white shadow-glow-primary'
                  : 'card hover:shadow-medium dark:hover:shadow-dark-medium text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Icon size={20} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* main content */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'timer' && (
            <div className="space-y-6">
              <Timer />
              <div className="card p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                    <Target className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-xl font-heading font-semibold text-light-text-primary dark:text-dark-text-primary">
                    Dicas para o Pomodoro
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { icon: '🎯', title: 'Foque em uma tarefa', desc: 'Uma única atividade por sessão' },
                    { icon: '📱', title: 'Evite distrações', desc: 'Desligue redes sociais' },
                    { icon: '⏰', title: 'Respeite os intervalos', desc: 'Descanse realmente' },
                    { icon: '💧', title: 'Mantenha-se hidratado', desc: 'Água sempre por perto' },
                    { icon: '🪑', title: 'Ambiente confortável', desc: 'Ajuste iluminação e postura' },
                    { icon: '📝', title: 'Anote ideias', desc: 'Capture insights rapidamente' }
                  ].map((tip, index) => (
                    <div 
                      key={index}
                      className="p-4 bg-light-surface dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border hover:shadow-soft dark:hover:shadow-dark-soft transition-all duration-200"
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">{tip.icon}</span>
                        <div>
                          <h4 className="font-medium text-light-text-primary dark:text-dark-text-primary">
                            {tip.title}
                          </h4>
                          <p className="text-sm text-light-text-muted dark:text-dark-text-muted">
                            {tip.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'stopwatch' && (
            <div className="space-y-6">
              <Stopwatch />
              <div className="card p-6 space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-accent-100 dark:bg-accent-900/30">
                    <Clock className="w-5 h-5 text-accent-600 dark:text-accent-400" />
                  </div>
                  <h3 className="text-xl font-heading font-semibold text-light-text-primary dark:text-dark-text-primary">
                    Cronômetro de Sessões
                  </h3>
                </div>
                
                <p className="text-light-text-secondary dark:text-dark-text-secondary">
                  Use o cronômetro para medir o tempo dedicado a cada atividade de estudo.
                  Ideal para sessões livres sem a estrutura do Pomodoro.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                      <h4 className="font-medium text-primary-800 dark:text-primary-200">Sessões Curtas</h4>
                    </div>
                    <p className="text-primary-600 dark:text-primary-400 font-semibold">15-30 minutos</p>
                    <p className="text-sm text-primary-700 dark:text-primary-300 mt-1">
                      Ideal para revisões e exercícios
                    </p>
                  </div>
                  
                  <div className="p-4 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-xl">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                      <h4 className="font-medium text-success-800 dark:text-success-200">Sessões Longas</h4>
                    </div>
                    <p className="text-success-600 dark:text-success-400 font-semibold">45-90 minutos</p>
                    <p className="text-sm text-success-700 dark:text-success-300 mt-1">
                      Perfeito para estudo profundo
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'sounds' && (
            <div className="space-y-6">
              <AmbientSounds />
              <div className="card p-6 space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-success-100 dark:bg-success-900/30">
                    <Volume2 className="w-5 h-5 text-success-600 dark:text-success-400" />
                  </div>
                  <h3 className="text-xl font-heading font-semibold text-light-text-primary dark:text-dark-text-primary">
                    Benefícios dos Sons Ambiente
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { emoji: '🌧️', title: 'Chuva', desc: 'Relaxante e mascarador de ruídos externos', color: 'blue' },
                    { emoji: '🌲', title: 'Floresta', desc: 'Conecta com a natureza e reduz estresse', color: 'green' },
                    { emoji: '🌊', title: 'Oceano', desc: 'Promove calma e concentração profunda', color: 'cyan' },
                    { emoji: '☕', title: 'Café', desc: 'Simula ambiente de estudo social', color: 'amber' }
                  ].map((sound, index) => (
                    <div 
                      key={index}
                      className="p-4 bg-light-surface dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border hover:shadow-soft dark:hover:shadow-dark-soft transition-all duration-200"
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">{sound.emoji}</span>
                        <div>
                          <h4 className="font-medium text-light-text-primary dark:text-dark-text-primary mb-1">
                            {sound.title}
                          </h4>
                          <p className="text-sm text-light-text-muted dark:text-dark-text-muted">
                            {sound.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'focus' && (
            <div className="space-y-6">
              <NotificationBlocker />
              <div className="card p-6 space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-heading font-semibold text-light-text-primary dark:text-dark-text-primary">
                    Estratégias de Foco
                  </h3>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-xl">
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">🚫</span>
                      <div>
                        <h4 className="font-medium text-error-800 dark:text-error-200 mb-2">
                          Elimine Distrações
                        </h4>
                        <p className="text-error-700 dark:text-error-300 text-sm">
                          Desligue notificações, coloque o celular em modo silencioso e organize seu espaço de estudo.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl">
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">🎯</span>
                      <div>
                        <h4 className="font-medium text-primary-800 dark:text-primary-200 mb-2">
                          Defina Objetivos
                        </h4>
                        <p className="text-primary-700 dark:text-primary-300 text-sm">
                          Estabeleça metas claras para cada sessão de estudo antes de começar.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-xl">
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">💪</span>
                      <div>
                        <h4 className="font-medium text-success-800 dark:text-success-200 mb-2">
                          Mantenha Disciplina
                        </h4>
                        <p className="text-success-700 dark:text-success-300 text-sm">
                          Resista à tentação de verificar redes sociais durante as sessões de foco.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* sidebar */}
        <div className="space-y-6">
          {/* quick stats */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-accent-100 dark:bg-accent-900/30">
                <TrendingUp className="w-5 h-5 text-accent-600 dark:text-accent-400" />
              </div>
              <h3 className="text-lg font-heading font-semibold text-light-text-primary dark:text-dark-text-primary">
                Sessão Atual
              </h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-light-surface dark:bg-dark-surface rounded-lg">
                <span className="text-sm text-light-text-muted dark:text-dark-text-muted">Tempo Total</span>
                <span className="font-mono font-semibold text-light-text-primary dark:text-dark-text-primary">00:00</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-light-surface dark:bg-dark-surface rounded-lg">
                <span className="text-sm text-light-text-muted dark:text-dark-text-muted">Pausas</span>
                <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">0</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-light-surface dark:bg-dark-surface rounded-lg">
                <span className="text-sm text-light-text-muted dark:text-dark-text-muted">Foco</span>
                <span className="font-semibold text-success-600 dark:text-success-400">Alto</span>
              </div>
            </div>
          </div>

          {/* quick actions */}
          <div className="card p-6 space-y-4">
            <h3 className="text-lg font-heading font-semibold text-light-text-primary dark:text-dark-text-primary">
              Ações Rápidas
            </h3>
            
            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 p-4 text-left bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded-xl transition-all duration-200 border border-primary-200 dark:border-primary-800">
                <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                  <Mic size={16} className="text-primary-600 dark:text-primary-400" />
                </div>
                <span className="text-primary-700 dark:text-primary-300 font-medium">Gravar Nota</span>
              </button>
              
              <button className="w-full flex items-center space-x-3 p-4 text-left bg-accent-50 dark:bg-accent-900/20 hover:bg-accent-100 dark:hover:bg-accent-900/30 rounded-xl transition-all duration-200 border border-accent-200 dark:border-accent-800">
                <div className="p-2 rounded-lg bg-accent-100 dark:bg-accent-900/30">
                  <Clock size={16} className="text-accent-600 dark:text-accent-400" />
                </div>
                <span className="text-accent-700 dark:text-accent-300 font-medium">Novo Timer</span>
              </button>
              
              <button className="w-full flex items-center space-x-3 p-4 text-left bg-success-50 dark:bg-success-900/20 hover:bg-success-100 dark:hover:bg-success-900/30 rounded-xl transition-all duration-200 border border-success-200 dark:border-success-800">
                <div className="p-2 rounded-lg bg-success-100 dark:bg-success-900/30">
                  <Shield size={16} className="text-success-600 dark:text-success-400" />
                </div>
                <span className="text-success-700 dark:text-success-300 font-medium">Modo Foco</span>
              </button>
            </div>
          </div>

          {/* today's goals */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-heading font-semibold text-light-text-primary dark:text-dark-text-primary">
                Metas de Hoje
              </h3>
              <button className="p-1 rounded-lg hover:bg-light-surface dark:hover:bg-dark-surface transition-colors">
                <Play size={16} className="text-light-text-muted dark:text-dark-text-muted" />
              </button>
            </div>
            
            <div className="space-y-3">
              {goals.map((goal) => (
                <div key={goal.id} className="flex items-center space-x-3 p-3 bg-light-surface dark:bg-dark-surface rounded-lg">
                  <input 
                    type="checkbox" 
                    checked={goal.completed}
                    onChange={() => handleGoalToggle(goal.id)}
                    className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-400" 
                  />
                  <span className={`text-sm flex-1 ${
                    goal.completed 
                      ? 'text-light-text-muted dark:text-dark-text-muted line-through' 
                      : 'text-light-text-secondary dark:text-dark-text-secondary'
                  }`}>
                    {goal.task}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 