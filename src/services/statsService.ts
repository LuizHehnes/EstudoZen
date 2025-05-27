import localForage from 'localforage';
import { scheduleService } from './scheduleService';
import type { ScheduleItem } from './scheduleService';

// Configuração do localForage para estatísticas
localForage.config({
  name: 'EstudoZenStats',
  storeName: 'stats',
  description: 'Armazenamento de estatísticas do EstudoZen'
});

export interface StudySession {
  id: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  duration: number; // em minutos
  completed: boolean;
  type: string; // 'pomodoro', 'custom', etc.
}

export interface StatsData {
  totalStudyTime: number; // em minutos
  sessionsCompleted: number;
  lastStudyDate: string | null; // ISO string
  studyStreak: number;
  studySessions: StudySession[];
}

interface WeeklyStats {
  [key: string]: number; // dia da semana -> minutos
}

interface MonthlyStats {
  [key: string]: number; // mês -> minutos
}

const defaultStats: StatsData = {
  totalStudyTime: 0,
  sessionsCompleted: 0,
  lastStudyDate: null,
  studyStreak: 0,
  studySessions: []
};

class StatsService {
  private listeners: ((stats: StatsData) => void)[] = [];
  private cachedStats: StatsData = { ...defaultStats };

  constructor() {
    this.loadStats();
  }

  // Carrega estatísticas do IndexedDB
  private async loadStats(): Promise<void> {
    try {
      const stats = await localForage.getItem<StatsData>('studyStats');
      this.cachedStats = stats || { ...defaultStats };
      this.notifyListeners();
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      this.cachedStats = { ...defaultStats };
    }
  }

  // Salva estatísticas no IndexedDB
  private async saveStats(): Promise<void> {
    try {
      await localForage.setItem('studyStats', this.cachedStats);
    } catch (error) {
      console.error('Erro ao salvar estatísticas:', error);
    }
  }

  // Registra uma nova sessão de estudo
  async recordSession(session: Omit<StudySession, 'id'>): Promise<StudySession> {
    const newSession: StudySession = {
      ...session,
      id: crypto.randomUUID()
    };
    
    this.cachedStats.studySessions.push(newSession);
    
    if (session.completed) {
      this.cachedStats.sessionsCompleted++;
      this.cachedStats.totalStudyTime += session.duration;
      
      // Atualiza o streak de estudo
      const today = new Date().toISOString().split('T')[0];
      const lastDate = this.cachedStats.lastStudyDate 
        ? new Date(this.cachedStats.lastStudyDate).toISOString().split('T')[0]
        : null;
      
      if (lastDate) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (lastDate === yesterdayStr || lastDate === today) {
          this.cachedStats.studyStreak++;
        } else {
          this.cachedStats.studyStreak = 1;
        }
      } else {
        this.cachedStats.studyStreak = 1;
      }
      
      this.cachedStats.lastStudyDate = new Date().toISOString();
    }
    
    await this.saveStats();
    this.notifyListeners();
    
    return newSession;
  }

  // Obtém estatísticas semanais
  async getWeeklyStats(): Promise<WeeklyStats> {
    const weeklyStats: WeeklyStats = {
      'Domingo': 0,
      'Segunda': 0,
      'Terça': 0,
      'Quarta': 0,
      'Quinta': 0,
      'Sexta': 0, 
      'Sábado': 0
    };
    
    // Calcula início da semana (domingo)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Domingo, 6 = Sábado
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Calcula fim da semana (sábado)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    // Filtra sessões desta semana
    const sessionsThisWeek = this.cachedStats.studySessions.filter(session => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= startOfWeek && sessionDate <= endOfWeek && session.completed;
    });
    
    // Agrupa por dia da semana
    sessionsThisWeek.forEach(session => {
      const sessionDate = new Date(session.startTime);
      const dayIndex = sessionDate.getDay();
      const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      const dayName = dayNames[dayIndex];
      
      weeklyStats[dayName] += session.duration;
    });
    
    return weeklyStats;
  }

  // Obtém estatísticas mensais
  async getMonthlyStats(): Promise<MonthlyStats> {
    const monthlyStats: MonthlyStats = {};
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    // Inicializa últimos 6 meses
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const month = new Date(today);
      month.setMonth(today.getMonth() - i);
      const monthName = monthNames[month.getMonth()];
      monthlyStats[monthName] = 0;
    }
    
    // Define intervalo dos últimos 6 meses
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);
    
    // Filtra sessões dos últimos 6 meses
    const recentSessions = this.cachedStats.studySessions.filter(session => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= sixMonthsAgo && session.completed;
    });
    
    // Agrupa por mês
    recentSessions.forEach(session => {
      const sessionDate = new Date(session.startTime);
      const monthName = monthNames[sessionDate.getMonth()];
      
      if (monthlyStats[monthName] !== undefined) {
        monthlyStats[monthName] += session.duration;
      }
    });
    
    return monthlyStats;
  }

  // Obtém distribuição do tempo por tipo de sessão
  async getSessionTypeDistribution(): Promise<Record<string, number>> {
    const distribution: Record<string, number> = {};
    
    this.cachedStats.studySessions.forEach(session => {
      if (session.completed) {
        if (!distribution[session.type]) {
          distribution[session.type] = 0;
        }
        distribution[session.type] += session.duration;
      }
    });
    
    return distribution;
  }

  // Obtém tarefas de estudo agendadas e concluídas
  async getScheduledStudyStats(): Promise<{ completed: number; total: number }> {
    const items = await scheduleService.getItems();
    const studyItems = items.filter(item => item.type === 'study');
    
    return {
      completed: studyItems.filter(item => item.isCompleted).length,
      total: studyItems.length
    };
  }

  // Retorna todas as estatísticas
  async getStats(): Promise<StatsData> {
    return { ...this.cachedStats };
  }

  // Adiciona listener para mudanças
  addListener(callback: (stats: StatsData) => void): () => void {
    this.listeners.push(callback);
    
    // Notifica imediatamente com os dados atuais
    callback({ ...this.cachedStats });
    
    // Retorna função para remover o listener
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Notifica todos os listeners sobre mudanças
  private notifyListeners(): void {
    const stats = { ...this.cachedStats };
    this.listeners.forEach(callback => callback(stats));
  }
}

// Instância singleton
export const statsService = new StatsService(); 