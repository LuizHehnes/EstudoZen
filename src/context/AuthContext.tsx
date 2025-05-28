import React, { createContext, useContext, useState, useEffect } from 'react';
import localforage from 'localforage';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
  lastLogin: Date;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    language: string;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  deleteAccount: (password: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

// Simulação de hash de senha (em produção, use bcrypt ou similar)
const hashPassword = (password: string): string => {
  return btoa(password + 'salt_estudozen_2024');
};

const verifyPassword = (password: string, hash: string): boolean => {
  return hashPassword(password) === hash;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      
      // Criar usuário de demonstração se não existir
      await createDemoUserIfNotExists();
      
      const currentUserId = await localforage.getItem<string>('currentUserId');
      
      if (currentUserId) {
        const userData = await localforage.getItem<User>(`user_${currentUserId}`);
        if (userData) {
          setUser({
            ...userData,
            createdAt: new Date(userData.createdAt),
            lastLogin: new Date(userData.lastLogin)
          });
        }
      }
    } catch (error) {
      console.error('Erro ao verificar status de autenticação:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createDemoUserIfNotExists = async () => {
    try {
      const users = await localforage.getItem<Record<string, any>>('users') || {};
      const demoUserExists = Object.values(users).some((userData: any) => userData.email === 'demo@estudozen.com');
      
      if (!demoUserExists) {
        const demoUserId = 'demo_user_123';
        const now = new Date();
        
        const demoUser: User = {
          id: demoUserId,
          name: 'Usuário Demonstração',
          email: 'demo@estudozen.com',
          createdAt: now,
          lastLogin: now,
          preferences: {
            theme: 'system',
            notifications: true,
            language: 'pt-BR'
          }
        };

        const demoUserWithPassword = {
          ...demoUser,
          passwordHash: hashPassword('demo123')
        };

        await localforage.setItem(`user_${demoUserId}`, demoUser);
        await localforage.setItem('users', { ...users, [demoUserId]: demoUserWithPassword });
      }
    } catch (error) {
      console.error('Erro ao criar usuário de demonstração:', error);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Buscar usuário por email
      const users = await localforage.getItem<Record<string, any>>('users') || {};
      const userEntry = Object.entries(users).find(([_, userData]) => userData.email === email);
      
      if (!userEntry) {
        return { success: false, error: 'Email não encontrado' };
      }

      const [userId, userData] = userEntry;
      
      // Verificar senha
      if (!verifyPassword(password, userData.passwordHash)) {
        return { success: false, error: 'Senha incorreta' };
      }

      // Atualizar último login
      const updatedUser: User = {
        ...userData,
        lastLogin: new Date(),
        createdAt: new Date(userData.createdAt)
      };

      // Salvar usuário atualizado
      await localforage.setItem(`user_${userId}`, updatedUser);
      await localforage.setItem('users', { ...users, [userId]: updatedUser });
      await localforage.setItem('currentUserId', userId);

      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, error: 'Erro interno do sistema' };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Verificar se email já existe
      const users = await localforage.getItem<Record<string, any>>('users') || {};
      const emailExists = Object.values(users).some((userData: any) => userData.email === email);
      
      if (emailExists) {
        return { success: false, error: 'Este email já está em uso' };
      }

      // Criar novo usuário
      const userId = Date.now().toString();
      const now = new Date();
      
      const newUser: User = {
        id: userId,
        name,
        email,
        createdAt: now,
        lastLogin: now,
        preferences: {
          theme: 'system',
          notifications: true,
          language: 'pt-BR'
        }
      };

      const userWithPassword = {
        ...newUser,
        passwordHash: hashPassword(password)
      };

      // Salvar usuário
      await localforage.setItem(`user_${userId}`, newUser);
      await localforage.setItem('users', { ...users, [userId]: userWithPassword });
      await localforage.setItem('currentUserId', userId);

      setUser(newUser);
      return { success: true };
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return { success: false, error: 'Erro interno do sistema' };
    }
  };

  const logout = async () => {
    try {
      await localforage.removeItem('currentUserId');
      setUser(null);
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;

    try {
      const updatedUser = { ...user, ...updates };
      
      // Atualizar dados do usuário
      await localforage.setItem(`user_${user.id}`, updatedUser);
      
      // Atualizar na lista de usuários também
      const users = await localforage.getItem<Record<string, any>>('users') || {};
      const userWithPassword = users[user.id];
      if (userWithPassword) {
        await localforage.setItem('users', { 
          ...users, 
          [user.id]: { ...userWithPassword, ...updates } 
        });
      }

      setUser(updatedUser);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };

    try {
      const users = await localforage.getItem<Record<string, any>>('users') || {};
      const userData = users[user.id];
      
      if (!userData || !verifyPassword(currentPassword, userData.passwordHash)) {
        return { success: false, error: 'Senha atual incorreta' };
      }

      // Atualizar senha
      const updatedUserData = {
        ...userData,
        passwordHash: hashPassword(newPassword)
      };

      await localforage.setItem('users', { ...users, [user.id]: updatedUserData });
      return { success: true };
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      return { success: false, error: 'Erro interno do sistema' };
    }
  };

  const deleteAccount = async (password: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };

    try {
      const users = await localforage.getItem<Record<string, any>>('users') || {};
      const userData = users[user.id];
      
      if (!userData || !verifyPassword(password, userData.passwordHash)) {
        return { success: false, error: 'Senha incorreta' };
      }

      // Remover todos os dados do usuário
      const userDataKeys = [
        `user_${user.id}`,
        `textNotes_${user.id}`,
        `voiceNotes_${user.id}`,
        `schedule_${user.id}`,
        `contacts_${user.id}`,
        `timerStats_${user.id}`,
        'currentUserId'
      ];

      for (const key of userDataKeys) {
        await localforage.removeItem(key);
      }

      // Remover da lista de usuários
      const { [user.id]: removed, ...remainingUsers } = users;
      await localforage.setItem('users', remainingUsers);

      setUser(null);
      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar conta:', error);
      return { success: false, error: 'Erro interno do sistema' };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      updateProfile,
      changePassword,
      deleteAccount
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 