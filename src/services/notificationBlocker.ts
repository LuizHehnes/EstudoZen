export type NotificationState = {
  permission: NotificationPermission
  isBlocked: boolean
  isSessionActive: boolean
}

class NotificationBlockerService {
  private state: NotificationState = {
    permission: 'default',
    isBlocked: false,
    isSessionActive: false
  }

  private listeners: ((state: NotificationState) => void)[] = []
  private originalNotification: typeof Notification | null = null

  constructor() {
    this.checkPermission()
    this.notifyListeners()
  }

  private checkPermission(): void {
    if ('Notification' in window) {
      this.state.permission = Notification.permission
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Este navegador não suporta notificações')
    }

    if (this.state.permission === 'default') {
      const permission = await Notification.requestPermission()
      this.state.permission = permission
      this.notifyListeners()
      return permission
    }

    return this.state.permission
  }

  blockNotifications(): void {
    if (!this.state.isBlocked && 'Notification' in window) {
      this.originalNotification = window.Notification

      ;(window as any).Notification = class {
        constructor() {
          return {}
        }
        static get permission() {
          return 'denied'
        }
        static requestPermission() {
          return Promise.resolve('denied')
        }
      }

      this.state.isBlocked = true
      this.notifyListeners()
    }
  }

  unblockNotifications(): void {
    if (this.state.isBlocked && this.originalNotification) {
      window.Notification = this.originalNotification
      this.originalNotification = null
      this.state.isBlocked = false
      this.notifyListeners()
    }
  }

  startStudySession(): void {
    this.state.isSessionActive = true
    this.blockNotifications()
    this.notifyListeners()
  }

  endStudySession(): void {
    this.state.isSessionActive = false
    this.unblockNotifications()
    this.notifyListeners()
  }

  addListener(callback: (state: NotificationState) => void): () => void {
    this.listeners.push(callback)
    callback({ ...this.state })
    return () => {
      const index = this.listeners.indexOf(callback)
      if (index > -1) this.listeners.splice(index, 1)
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(cb => cb({ ...this.state }))
  }

  get permission(): NotificationPermission {
    return this.state.permission
  }

  get isBlocked(): boolean {
    return this.state.isBlocked
  }

  get isSessionActive(): boolean {
    return this.state.isSessionActive
  }

  get currentState(): NotificationState {
    return { ...this.state }
  }
}

export const notificationBlocker = new NotificationBlockerService()
