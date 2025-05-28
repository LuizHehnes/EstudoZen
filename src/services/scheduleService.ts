import localForage from 'localforage';
import { notificationBlocker } from './notificationBlocker';

// config do localForage
localForage.config({
  name: 'EstudoZen',
  storeName: 'schedules',
  description: 'Armazenamento de agendamentos do EstudoZen'
});

interface ScheduleItem {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  isCompleted: boolean;
  type: 'study' | 'task';
  reminder?: boolean;
  reminderTime?: string;
}

class ScheduleService {
  private listeners: ((items: ScheduleItem[]) => void)[] = [];
  private cachedItems: ScheduleItem[] = [];
  private scheduledReminders: Map<string, number> = new Map();

  constructor() {
    this.loadItems();
    this.setupReminderChecks();
  }

  // carrega todos os itens do banco local
  private async loadItems(): Promise<void> {
    try {
      const items = await localForage.getItem<ScheduleItem[]>('scheduleItems');
      this.cachedItems = items || [];
      this.notifyListeners();
      this.setupReminders();
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      this.cachedItems = [];
    }
  }

  // salva os itens no banco local
  private async saveItems(): Promise<void> {
    try {
      await localForage.setItem('scheduleItems', this.cachedItems);
      this.setupReminders();
    } catch (error) {
      console.error('Erro ao salvar agendamentos:', error);
    }
  }

  // configura os lembretes p/ todos os itens
  private setupReminders(): void {
    // limpa todos os timers que tavam rolando
    this.scheduledReminders.forEach((timerId) => {
      window.clearTimeout(timerId);
    });
    this.scheduledReminders.clear();

    // configura lembretes novos só p/ itens que têm reminder ligado
    const now = new Date();
    this.cachedItems.forEach((item) => {
      if (item.reminder && item.reminderTime && !item.isCompleted) {
        const reminderDate = new Date(item.reminderTime);
        
        if (reminderDate > now) {
          const timeUntilReminder = reminderDate.getTime() - now.getTime();
          const timerId = window.setTimeout(() => {
            this.triggerReminder(item);
          }, timeUntilReminder);
          
          this.scheduledReminders.set(item.id, timerId);
        }
      }
    });
  }

  // fica checando se tem lembretes novos
  private setupReminderChecks(): void {
    // checa a cada minuto se tem lembretes novos p/ configurar
    setInterval(() => {
      this.setupReminders();
    }, 60000); // 60 segundos
  }

  // manda uma notificação de lembrete
  private triggerReminder(item: ScheduleItem): void {
    // checa se as notificações tão permitidas
    if (notificationBlocker.permission === 'granted' && !notificationBlocker.isBlocked) {
      const title = `Lembrete: ${item.title}`;
      const options = {
        body: item.description || `Horário: ${new Date(item.startTime).toLocaleTimeString()}`,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      };
      
      new Notification(title, options);
    }
  }

  // adiciona um item novo no cronograma
  async addItem(item: Omit<ScheduleItem, 'id'>): Promise<ScheduleItem> {
    const newItem: ScheduleItem = {
      ...item,
      id: crypto.randomUUID()
    };
    
    this.cachedItems.push(newItem);
    await this.saveItems();
    this.notifyListeners();
    
    return newItem;
  }

  // atualiza um item que já existe
  async updateItem(id: string, updates: Partial<Omit<ScheduleItem, 'id'>>): Promise<ScheduleItem | null> {
    const index = this.cachedItems.findIndex(item => item.id === id);
    
    if (index === -1) {
      return null;
    }
    
    // remove o lembrete antigo se tiver
    if (this.scheduledReminders.has(id)) {
      window.clearTimeout(this.scheduledReminders.get(id));
      this.scheduledReminders.delete(id);
    }
    
    const updatedItem = {
      ...this.cachedItems[index],
      ...updates
    };
    
    this.cachedItems[index] = updatedItem;
    await this.saveItems();
    this.notifyListeners();
    
    return updatedItem;
  }

  // remove um item
  async removeItem(id: string): Promise<boolean> {
    const initialLength = this.cachedItems.length;
    this.cachedItems = this.cachedItems.filter(item => item.id !== id);
    
    // remove o lembrete se tiver
    if (this.scheduledReminders.has(id)) {
      window.clearTimeout(this.scheduledReminders.get(id));
      this.scheduledReminders.delete(id);
    }
    
    if (initialLength !== this.cachedItems.length) {
      await this.saveItems();
      this.notifyListeners();
      return true;
    }
    
    return false;
  }

  // pega todos os itens
  async getItems(): Promise<ScheduleItem[]> {
    return [...this.cachedItems];
  }

  // pega um item específico pelo ID
  async getItemById(id: string): Promise<ScheduleItem | null> {
    const item = this.cachedItems.find(item => item.id === id);
    return item || null;
  }

  // filtra itens por data
  async getItemsByDate(date: Date): Promise<ScheduleItem[]> {
    const dateString = date.toISOString().split('T')[0];
    
    return this.cachedItems.filter(item => {
      const itemStartDate = new Date(item.startTime).toISOString().split('T')[0];
      return itemStartDate === dateString;
    });
  }

  // adiciona listener p/ mudanças
  addListener(callback: (items: ScheduleItem[]) => void): () => void {
    this.listeners.push(callback);
    
    // avisa imediatamente com os itens atuais
    callback([...this.cachedItems]);
    
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
    const items = [...this.cachedItems];
    this.listeners.forEach(callback => callback(items));
  }
}
export const scheduleService = new ScheduleService();

export type { ScheduleItem }; 