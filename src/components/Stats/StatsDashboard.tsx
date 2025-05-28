import { useEffect, useState, useCallback } from 'react';
import { statsService, type StatsData } from '../../services/statsService';
import { ChartCard } from './ChartCard';
import { Clock, Target, TrendingUp, Calendar, Database, Trash2 } from 'lucide-react';

type FilterPeriod = 'week' | 'month' | 'all';

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

export function StatsDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('week');
  const [scheduledStats, setScheduledStats] = useState<{ completed: number; total: number }>({
    completed: 0,
    total: 0
  });
  const [timeDistributionData, setTimeDistributionData] = useState<ChartData | null>(null);
  const [typeDistributionData, setTypeDistributionData] = useState<ChartData | null>(null);

  // prepara dados para grafico de barras
  const getTimeDistributionData = useCallback(async (): Promise<ChartData> => {
    if (filterPeriod === 'week') {
      const weeklyStats = await statsService.getWeeklyStats();
      return {
        labels: Object.keys(weeklyStats),
        datasets: [
          {
            label: 'Tempo de estudo (minutos)',
            data: Object.values(weeklyStats),
            backgroundColor: 'rgba(14, 165, 233, 0.6)',
            borderColor: 'rgba(14, 165, 233, 1)',
            borderWidth: 2,
          },
        ],
      };
    } else {
      const monthlyStats = await statsService.getMonthlyStats();
      return {
        labels: Object.keys(monthlyStats),
        datasets: [
          {
            label: 'Tempo de estudo (minutos)',
            data: Object.values(monthlyStats),
            backgroundColor: 'rgba(14, 165, 233, 0.6)',
            borderColor: 'rgba(14, 165, 233, 1)',
            borderWidth: 2,
          },
        ],
      };
    }
  }, [filterPeriod]);

  // prepara dados para grafico de pizza
  const getTypeDistributionData = useCallback(async (): Promise<ChartData> => {
    const distribution = await statsService.getSessionTypeDistribution();
    
    if (Object.keys(distribution).length === 0) {
      return {
        labels: ['Nenhum dado'],
        datasets: [
          {
            label: 'Tempo por tipo',
            data: [1],
            backgroundColor: ['rgba(156, 163, 175, 0.6)'],
            borderColor: ['rgba(156, 163, 175, 1)'],
            borderWidth: 2,
          },
        ],
      };
    }
    
    return {
      labels: Object.keys(distribution).map(type => type.charAt(0).toUpperCase() + type.slice(1)),
      datasets: [
        {
          label: 'Tempo por tipo',
          data: Object.values(distribution),
          backgroundColor: [
            'rgba(14, 165, 233, 0.6)',
            'rgba(245, 158, 11, 0.6)',
            'rgba(34, 197, 94, 0.6)',
            'rgba(168, 85, 247, 0.6)',
            'rgba(239, 68, 68, 0.6)',
          ],
          borderColor: [
            'rgba(14, 165, 233, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(34, 197, 94, 1)',
            'rgba(168, 85, 247, 1)',
            'rgba(239, 68, 68, 1)',
          ],
          borderWidth: 2,
        },
      ],
    };
  }, []);

  useEffect(() => {
    const unsubscribe = statsService.addListener((statsData) => {
      setStats(statsData);
      setLoading(false);
    });

    // estats de agendamento
    const loadScheduledStats = async () => {
      const result = await statsService.getScheduledStudyStats();
      setScheduledStats(result);
    };
    loadScheduledStats();

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const loadChartData = async () => {
      try {
        // carrega dados de tempo
        if (filterPeriod !== 'all') {
          const timeData = await getTimeDistributionData();
          setTimeDistributionData(timeData);
        } else {
          setTimeDistributionData(null);
        }

        // carrega dados de tipo
        const typeData = await getTypeDistributionData();
        setTypeDistributionData(typeData);
      } catch (error) {
        console.error('Erro ao carregar dados dos gráficos:', error);
        // se der erro insere info 
        setTypeDistributionData({
          labels: ['Erro ao carregar'],
          datasets: [
            {
              label: 'Erro',
              data: [1],
              backgroundColor: ['rgba(239, 68, 68, 0.6)'],
              borderColor: ['rgba(239, 68, 68, 1)'],
              borderWidth: 2,
            },
          ],
        });
      }
    };

    if (!loading) {
      loadChartData();
    }
  }, [filterPeriod, loading, getTimeDistributionData, getTypeDistributionData]);

  const formatMinutes = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  if (loading) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center animate-pulse">
          <TrendingUp className="w-8 h-8 text-primary-600 dark:text-primary-400" />
        </div>
        <p className="text-light-text-muted dark:text-dark-text-muted">
          Carregando estatísticas...
        </p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <TrendingUp className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-light-text-muted dark:text-dark-text-muted">
          Nenhuma estatística disponível
        </p>
      </div>
    );
  }

  const summaryStats = [
    {
      title: 'Tempo Total de Estudo',
      value: formatMinutes(stats.totalStudyTime),
      icon: Clock,
      color: 'from-primary-500 to-primary-600',
      bgColor: 'bg-primary-100 dark:bg-primary-900/30'
    },
    {
      title: 'Sessões Completadas',
      value: stats.sessionsCompleted.toString(),
      icon: Target,
      color: 'from-success-500 to-success-600',
      bgColor: 'bg-success-100 dark:bg-success-900/30'
    },
    {
      title: 'Sequência de Estudo',
      value: `${stats.studyStreak} ${stats.studyStreak === 1 ? 'dia' : 'dias'}`,
      icon: TrendingUp,
      color: 'from-accent-500 to-accent-600',
      bgColor: 'bg-accent-100 dark:bg-accent-900/30'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
            <TrendingUp className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h2 className="text-2xl font-heading font-bold text-light-text-primary dark:text-dark-text-primary">
              Estatísticas de Estudo
            </h2>
            <p className="text-light-text-muted dark:text-dark-text-muted">
              Acompanhe seu progresso e desempenho
            </p>
          </div>
        </div>

        {/* Botões de desenvolvimento */}
        <div className="flex items-center space-x-2">
          <button
            onClick={async () => {
              if (confirm('Isso irá popular o sistema com dados de teste. Continuar?')) {
                await statsService.populateTestData();
              }
            }}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
            title="Popular dados de teste"
          >
            <Database className="w-4 h-4" />
            <span>Dados de Teste</span>
          </button>
          
          <button
            onClick={async () => {
              if (confirm('Isso irá limpar TODOS os dados de estatísticas. Esta ação não pode ser desfeita. Continuar?')) {
                await statsService.clearAllData();
              }
            }}
            className="flex items-center space-x-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors"
            title="Limpar todos os dados"
          >
            <Trash2 className="w-4 h-4" />
            <span>Limpar</span>
          </button>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {summaryStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.title} 
              className="card card-hover p-6 space-y-4"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-light-text-muted dark:text-dark-text-muted">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                <div 
                  className={`h-1 rounded-full bg-gradient-to-r ${stat.color}`}
                  style={{ width: '75%' }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Filtros */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-light-text-muted dark:text-dark-text-muted" />
            <span className="text-light-text-secondary dark:text-dark-text-secondary font-medium">
              Período de análise:
            </span>
          </div>
          
          <div className="flex bg-light-surface dark:bg-dark-surface rounded-xl p-1 border border-light-border dark:border-dark-border">
            {[
              { key: 'week', label: 'Semana' },
              { key: 'month', label: 'Mês' },
              { key: 'all', label: 'Total' }
            ].map((period) => (
              <button
                key={period.key}
                onClick={() => setFilterPeriod(period.key as FilterPeriod)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filterPeriod === period.key
                    ? 'bg-primary-600 dark:bg-primary-500 text-white shadow-soft'
                    : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filterPeriod !== 'all' && (
          timeDistributionData ? (
            <ChartCard
              title={filterPeriod === 'week' ? 'Tempo de Estudo Semanal' : 'Tempo de Estudo Mensal'}
              description={`Distribuição do tempo de estudo por ${
                filterPeriod === 'week' ? 'dia da semana' : 'mês'
              }`}
              type="bar"
              data={timeDistributionData}
            />
          ) : (
            <div className="card p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
                  {filterPeriod === 'week' ? 'Tempo de Estudo Semanal' : 'Tempo de Estudo Mensal'}
                </h3>
                <p className="text-sm text-light-text-muted dark:text-dark-text-muted mt-1">
                  Distribuição do tempo de estudo por {filterPeriod === 'week' ? 'dia da semana' : 'mês'}
                </p>
              </div>
              <div className="h-64 flex items-center justify-center">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center animate-pulse">
                    <TrendingUp className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-light-text-muted dark:text-dark-text-muted">Carregando gráfico...</p>
                </div>
              </div>
            </div>
          )
        )}
        
        {typeDistributionData ? (
          <ChartCard
            title="Distribuição por Tipo"
            description="Tempo dedicado a cada tipo de estudo"
            type="pie"
            data={typeDistributionData}
          />
        ) : (
          <div className="card p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
                Distribuição por Tipo
              </h3>
              <p className="text-sm text-light-text-muted dark:text-dark-text-muted mt-1">
                Tempo dedicado a cada tipo de estudo
              </p>
            </div>
            <div className="h-64 flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center animate-pulse">
                  <TrendingUp className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-light-text-muted dark:text-dark-text-muted">Carregando gráfico...</p>
              </div>
            </div>
          </div>
        )}
        
        {filterPeriod === 'all' && (
          <ChartCard
            title="Progresso de Tarefas de Estudo"
            description="Tarefas de estudo agendadas vs. concluídas"
            type="pie"
            data={{
              labels: ['Concluídas', 'Pendentes'],
              datasets: [
                {
                  label: 'Tarefas',
                  data: [
                    scheduledStats.completed,
                    scheduledStats.total - scheduledStats.completed
                  ],
                  backgroundColor: [
                    'rgba(34, 197, 94, 0.6)',
                    'rgba(239, 68, 68, 0.6)'
                  ],
                  borderColor: [
                    'rgba(34, 197, 94, 1)',
                    'rgba(239, 68, 68, 1)'
                  ],
                  borderWidth: 2,
                },
              ],
            }}
          />
        )}
      </div>
    </div>
  );
} 