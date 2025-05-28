import localForage from 'localforage';
import { scheduleService } from './scheduleService';

// config do localForage p/ as stats
localForage.config({
  name: 'EstudoZenStats',
  storeName: 'stats',
  description: 'Armazenamento de estatísticas do EstudoZen'
});

export interface StudySession {
  id: string;
  startTime: string;
  endTime: string;
  duration: number;
  completed: boolean;
  type: string; // tipo da sessão tipo 'pomodoro', 'stopwatch', etc.
  audioUsed?: string; // som que foi usado na sessão
  activities?: string[]; // coisas que o user fez durante a sessão
}

export interface AudioUsage {
  soundId: string;
  soundName: string;
  totalTime: number; // tempo em segundos
  sessionsUsed: number;
  lastUsed: string;
}

export interface StatsData {
  totalStudyTime: number; // tempo em minutos
  sessionsCompleted: number;
  lastStudyDate: string | null; // formato ISO string
  studyStreak: number;
  studySessions: StudySession[];
  audioUsage: Record<string, AudioUsage>;
  totalAudioTime: number; // tempo total com som tocando em segundos
  activitiesLog: Array<{
    timestamp: string;
    activity: string;
    sessionId?: string;
  }>;
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
  studySessions: [],
  audioUsage: {},
  totalAudioTime: 0,
  activitiesLog: []
};

class StatsService {
  private listeners: ((stats: StatsData) => void)[] = [];
  private cachedStats: StatsData = { ...defaultStats };

  constructor() {
    this.loadStats();
  }

  // carrega as stats do banco local
  private async loadStats(): Promise<void> {
    try {
      const stats = await localForage.getItem<StatsData>('studyStats');
      this.cachedStats = stats || { ...defaultStats };
      
      // migração p/ campos novos se precisar
      if (!this.cachedStats.audioUsage) {
        this.cachedStats.audioUsage = {};
      }
      if (!this.cachedStats.totalAudioTime) {
        this.cachedStats.totalAudioTime = 0;
      }
      if (!this.cachedStats.activitiesLog) {
        this.cachedStats.activitiesLog = [];
      }
      
      this.notifyListeners();
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      this.cachedStats = { ...defaultStats };
    }
  }

  // salva as stats no banco local
  private async saveStats(): Promise<void> {
    try {
      await localForage.setItem('studyStats', this.cachedStats);
    } catch (error) {
      console.error('Erro ao salvar estatísticas:', error);
    }
  }

  // registra uma sessão nova de estudo
  async recordSession(session: Omit<StudySession, 'id'>): Promise<StudySession> {
    const newSession: StudySession = {
      ...session,
      id: crypto.randomUUID()
    };
    
    this.cachedStats.studySessions.push(newSession);
    
    if (session.completed) {
      this.cachedStats.sessionsCompleted++;
      this.cachedStats.totalStudyTime += session.duration;
      
      // recalcula o streak usando o método arrumado
      this.calculateStudyStreak();
    }
    
    await this.saveStats();
    this.notifyListeners();
    
    return newSession;
  }

  // registra quando o user usa áudio
  async recordAudioUsage(soundId: string, soundName: string, duration: number): Promise<void> {
    if (!this.cachedStats.audioUsage[soundId]) {
      this.cachedStats.audioUsage[soundId] = {
        soundId,
        soundName,
        totalTime: 0,
        sessionsUsed: 0,
        lastUsed: new Date().toISOString()
      };
    }

    this.cachedStats.audioUsage[soundId].totalTime += duration;
    this.cachedStats.audioUsage[soundId].sessionsUsed++;
    this.cachedStats.audioUsage[soundId].lastUsed = new Date().toISOString();
    this.cachedStats.totalAudioTime += duration;

    await this.saveStats();
    this.notifyListeners();
  }

  // registra atividade do user
  async recordActivity(activity: string, sessionId?: string): Promise<void> {
    this.cachedStats.activitiesLog.push({
      timestamp: new Date().toISOString(),
      activity,
      sessionId
    });

    // mantém só as últimas 1000 atividades p/ não sobrecarregar o storage
    if (this.cachedStats.activitiesLog.length > 1000) {
      this.cachedStats.activitiesLog = this.cachedStats.activitiesLog.slice(-1000);
    }

    await this.saveStats();
    this.notifyListeners();
  }

  // pega as stats da semana
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
    
    // calcula quando a semana começou (domingo)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Domingo, 6 = Sábado
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);
    
    // calcula quando a semana termina (sábado)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    // filtra só as sessões desta semana
    const sessionsThisWeek = this.cachedStats.studySessions.filter(session => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= startOfWeek && sessionDate <= endOfWeek && session.completed;
    });
    
    // agrupa por dia da semana
    sessionsThisWeek.forEach(session => {
      const sessionDate = new Date(session.startTime);
      const dayIndex = sessionDate.getDay();
      const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      const dayName = dayNames[dayIndex];
      
      weeklyStats[dayName] += session.duration;
    });
    
    return weeklyStats;
  }

  // stats dos meses
  async getMonthlyStats(): Promise<MonthlyStats> {
    const monthlyStats: MonthlyStats = {};
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    // seta os últimos 6 meses
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const month = new Date(today);
      month.setMonth(today.getMonth() - i);
      const monthName = monthNames[month.getMonth()];
      monthlyStats[monthName] = 0;
    }
    
    // define o período dos últimos 6 meses
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);
    
    // filtra as sessões dos últimos 6 meses
    const recentSessions = this.cachedStats.studySessions.filter(session => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= sixMonthsAgo && session.completed;
    });
    
    // agrupa por mês
    recentSessions.forEach(session => {
      const sessionDate = new Date(session.startTime);
      const monthName = monthNames[sessionDate.getMonth()];
      
      if (monthlyStats[monthName] !== undefined) {
        monthlyStats[monthName] += session.duration;
      }
    });
    
    return monthlyStats;
  }

  // pega como o tempo tá distribuído por tipo de sessão
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

  // pega as stats de uso de áudio
  async getAudioStats(): Promise<{
    mostUsedSounds: AudioUsage[];
    totalAudioTime: number;
    audioUsagePercentage: number;
  }> {
    const audioUsageArray = Object.values(this.cachedStats.audioUsage);
    const mostUsedSounds = audioUsageArray
      .sort((a, b) => b.totalTime - a.totalTime)
      .slice(0, 5);

    const totalStudyTimeSeconds = this.cachedStats.totalStudyTime * 60;
    const audioUsagePercentage = totalStudyTimeSeconds > 0 
      ? (this.cachedStats.totalAudioTime / totalStudyTimeSeconds) * 100 
      : 0;

    return {
      mostUsedSounds,
      totalAudioTime: this.cachedStats.totalAudioTime,
      audioUsagePercentage
    };
  }

  // pega as atividades recentes
  async getRecentActivities(limit: number = 50): Promise<Array<{
    timestamp: string;
    activity: string;
    sessionId?: string;
  }>> {
    return this.cachedStats.activitiesLog
      .slice(-limit)
      .reverse(); // mais recentes primeiro
  }

  // pega as tarefas de estudo agendadas e concluídas
  async getScheduledStudyStats(): Promise<{ completed: number; total: number }> {
    const items = await scheduleService.getItems();
    const studyItems = items.filter(item => item.type === 'study');
    
    return {
      completed: studyItems.filter(item => item.isCompleted).length,
      total: studyItems.length
    };
  }

  // retorna todas as stats
  async getStats(): Promise<StatsData> {
    return { ...this.cachedStats };
  }

  // listener p/ mudanças
  addListener(callback: (stats: StatsData) => void): () => void {
    this.listeners.push(callback);
    
    // avisa imediatamente com os dados atuais
    callback({ ...this.cachedStats });
    
    // retorna função p/ remover o listener
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // avisa todos os listeners sobre mudanças
  private notifyListeners(): void {
    const stats = { ...this.cachedStats };
    this.listeners.forEach(callback => callback(stats));
  }

  // método p/ popular dados de teste (só p/ desenvolvimento)
  async populateTestData(): Promise<void> {
    console.log('Populando dados de teste...');
    
    // limpa os dados que já tem
    this.cachedStats = { ...defaultStats };
    
    // gera sessões de estudo dos últimos 30 dias
    const today = new Date();
    const sessions: StudySession[] = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      // simula 1-3 sessões por dia com 70% de chance
      if (Math.random() > 0.3) {
        const numSessions = Math.floor(Math.random() * 3) + 1;
        
        for (let j = 0; j < numSessions; j++) {
          const startTime = new Date(date);
          startTime.setHours(8 + Math.floor(Math.random() * 12)); // entre 8h e 20h
          startTime.setMinutes(Math.floor(Math.random() * 60));
          
          const duration = Math.floor(Math.random() * 45) + 15; // 15-60 minutos
          const endTime = new Date(startTime.getTime() + duration * 60000);
          
          const sessionTypes = ['pomodoro', 'stopwatch', 'deep-focus'];
          const type = sessionTypes[Math.floor(Math.random() * sessionTypes.length)];
          
          const session: StudySession = {
            id: crypto.randomUUID(),
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            duration,
            completed: Math.random() > 0.1, // 90% de conclusão
            type,
            audioUsed: Math.random() > 0.5 ? 'Chuva' : undefined,
            activities: ['Estudo focado', 'Revisão de conteúdo']
          };
          
          sessions.push(session);
        }
      }
    }
    
    // adiciona as sessões
    this.cachedStats.studySessions = sessions;
    
    // calcula as stats baseado nas sessões
    const completedSessions = sessions.filter(s => s.completed);
    this.cachedStats.sessionsCompleted = completedSessions.length;
    this.cachedStats.totalStudyTime = completedSessions.reduce((total, session) => total + session.duration, 0);
    
    // calcula o streak certinho
    this.calculateStudyStreak();
    
    // adiciona dados de áudio
    this.cachedStats.audioUsage = {
      'rain': {
        soundId: 'rain',
        soundName: 'Chuva',
        totalTime: 3600, // 1 hora
        sessionsUsed: 15,
        lastUsed: new Date().toISOString()
      },
      'forest': {
        soundId: 'forest',
        soundName: 'Floresta',
        totalTime: 2400, // 40 minutos
        sessionsUsed: 8,
        lastUsed: new Date(Date.now() - 86400000).toISOString() // ontem
      },
      'ocean': {
        soundId: 'ocean',
        soundName: 'Oceano',
        totalTime: 1800, // 30 minutos
        sessionsUsed: 5,
        lastUsed: new Date(Date.now() - 172800000).toISOString() // 2 dias atrás
      }
    };
    
    this.cachedStats.totalAudioTime = 7800; // total de áudio usado
    
    // adiciona atividades recentes
    this.cachedStats.activitiesLog = [
      {
        timestamp: new Date().toISOString(),
        activity: 'Sessão de estudo iniciada',
        sessionId: sessions[sessions.length - 1]?.id
      },
      {
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        activity: 'Pomodoro completado',
        sessionId: sessions[sessions.length - 2]?.id
      },
      {
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        activity: 'Cronômetro pausado',
        sessionId: sessions[sessions.length - 3]?.id
      }
    ];
    
    await this.saveStats();
    this.notifyListeners();
    
    console.log('Dados de teste populados com sucesso!');
    console.log(`- ${this.cachedStats.sessionsCompleted} sessões completadas`);
    console.log(`- ${Math.floor(this.cachedStats.totalStudyTime / 60)}h ${this.cachedStats.totalStudyTime % 60}min de estudo`);
    console.log(`- Sequência de ${this.cachedStats.studyStreak} dias`);
  }

  // calcula o streak de estudo corretamente
  private calculateStudyStreak(): void {
    if (this.cachedStats.studySessions.length === 0) {
      this.cachedStats.studyStreak = 0;
      this.cachedStats.lastStudyDate = null;
      return;
    }

    // ordena as sessões por data
    const completedSessions = this.cachedStats.studySessions
      .filter(session => session.completed)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    if (completedSessions.length === 0) {
      this.cachedStats.studyStreak = 0;
      this.cachedStats.lastStudyDate = null;
      return;
    }

    // pega a sessão mais recente
    const mostRecentSession = completedSessions[0];
    this.cachedStats.lastStudyDate = mostRecentSession.startTime;

    // agrupa as sessões por dia
    const sessionsByDay = new Map<string, boolean>();
    completedSessions.forEach(session => {
      const date = new Date(session.startTime).toISOString().split('T')[0];
      sessionsByDay.set(date, true);
    });

    // calcula o streak a partir do dia mais recente
    const today = new Date().toISOString().split('T')[0];
    const mostRecentDate = new Date(mostRecentSession.startTime).toISOString().split('T')[0];
    
    let streak = 0;
    let currentDate = new Date();
    
    // se a sessão mais recente não foi hoje, verifica se foi ontem
    if (mostRecentDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (mostRecentDate !== yesterdayStr) {
        // se não foi nem hoje nem ontem, streak é 0
        this.cachedStats.studyStreak = 0;
        return;
      }
      
      // se foi ontem, começa a contar a partir de ontem
      currentDate = yesterday;
    }

    // conta dias seguidos com sessões
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      if (sessionsByDay.has(dateStr)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    this.cachedStats.studyStreak = streak;
  }

  // método p/ limpar todos os dados (útil p/ testes)
  async clearAllData(): Promise<void> {
    this.cachedStats = { ...defaultStats };
    await this.saveStats();
    this.notifyListeners();
    console.log('Todos os dados foram limpos.');
  }
}

export const statsService = new StatsService(); 