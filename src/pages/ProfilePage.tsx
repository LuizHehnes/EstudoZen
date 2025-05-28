import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, changePassword, deleteAccount, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  if (!user) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await updateProfile(editForm);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao atualizar perfil' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'Senhas não coincidem' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      if (result.success) {
        setShowPasswordForm(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Erro ao alterar senha' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro interno do sistema' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await deleteAccount(deletePassword);
      if (result.success) {
        // Conta deletada com sucesso, usuário será redirecionado automaticamente
      } else {
        setMessage({ type: 'error', text: result.error || 'Erro ao deletar conta' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro interno do sistema' });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading font-bold text-light-text-primary dark:text-dark-text-primary">
          Meu Perfil
        </h1>
        <button
          onClick={() => logout()}
          className="px-4 py-2 text-sm font-medium text-error-600 dark:text-error-400 hover:text-error-700 dark:hover:text-error-300 transition-colors duration-200"
        >
          Sair da conta
        </button>
      </div>

      {/* Mensagens */}
      {message.text && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800 text-success-800 dark:text-success-200'
            : 'bg-error-50 dark:bg-error-900/20 border-error-200 dark:border-error-800 text-error-800 dark:text-error-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Informações do perfil */}
      <div className="bg-light-card dark:bg-dark-card shadow-soft dark:shadow-dark-soft rounded-2xl p-6 border border-light-border dark:border-dark-border">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-heading font-semibold text-light-text-primary dark:text-dark-text-primary">
            Informações Pessoais
          </h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-200"
          >
            {isEditing ? 'Cancelar' : 'Editar'}
          </button>
        </div>

        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-xl">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-medium text-light-text-primary dark:text-dark-text-primary">
              {user.name}
            </h3>
            <p className="text-light-text-muted dark:text-dark-text-muted">{user.email}</p>
            <p className="text-sm text-light-text-muted dark:text-dark-text-muted">
              Membro desde {formatDate(user.createdAt)}
            </p>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                Nome
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-4 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-bg dark:bg-dark-bg text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                Email
              </label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full px-4 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-bg dark:bg-dark-bg text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                required
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-light-border dark:border-dark-border text-light-text-primary dark:text-dark-text-primary rounded-lg font-medium hover:bg-light-bg dark:hover:bg-dark-bg transition-colors duration-200"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-light-text-muted dark:text-dark-text-muted">Nome</p>
              <p className="font-medium text-light-text-primary dark:text-dark-text-primary">{user.name}</p>
            </div>
            <div>
              <p className="text-sm text-light-text-muted dark:text-dark-text-muted">Email</p>
              <p className="font-medium text-light-text-primary dark:text-dark-text-primary">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-light-text-muted dark:text-dark-text-muted">Último acesso</p>
              <p className="font-medium text-light-text-primary dark:text-dark-text-primary">
                {formatDate(user.lastLogin)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Preferências */}
      <div className="bg-light-card dark:bg-dark-card shadow-soft dark:shadow-dark-soft rounded-2xl p-6 border border-light-border dark:border-dark-border">
        <h2 className="text-xl font-heading font-semibold text-light-text-primary dark:text-dark-text-primary mb-6">
          Preferências
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-light-text-primary dark:text-dark-text-primary">Tema</p>
              <p className="text-sm text-light-text-muted dark:text-dark-text-muted">Escolha a aparência do sistema</p>
            </div>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
              className="px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-bg dark:bg-dark-bg text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
            >
              <option value="light">☀️ Claro</option>
              <option value="dark">🌙 Escuro</option>
              <option value="system">🖥️ Sistema</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-light-text-primary dark:text-dark-text-primary">Notificações</p>
              <p className="text-sm text-light-text-muted dark:text-dark-text-muted">Receber lembretes e alertas</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={user.preferences.notifications}
                onChange={(e) => updateProfile({ 
                  preferences: { ...user.preferences, notifications: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Segurança */}
      <div className="bg-light-card dark:bg-dark-card shadow-soft dark:shadow-dark-soft rounded-2xl p-6 border border-light-border dark:border-dark-border">
        <h2 className="text-xl font-heading font-semibold text-light-text-primary dark:text-dark-text-primary mb-6">
          Segurança
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-light-text-primary dark:text-dark-text-primary">Senha</p>
              <p className="text-sm text-light-text-muted dark:text-dark-text-muted">Alterar sua senha de acesso</p>
            </div>
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-200"
            >
              Alterar senha
            </button>
          </div>

          {showPasswordForm && (
            <form onSubmit={handleChangePassword} className="space-y-4 p-4 bg-light-bg dark:bg-dark-bg rounded-lg border border-light-border dark:border-dark-border">
              <div>
                <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                  Senha atual
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                  Nova senha
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                  Confirmar nova senha
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                >
                  {loading ? 'Alterando...' : 'Alterar senha'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(false)}
                  className="px-4 py-2 border border-light-border dark:border-dark-border text-light-text-primary dark:text-dark-text-primary rounded-lg font-medium hover:bg-light-bg dark:hover:bg-dark-bg transition-colors duration-200"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          <div className="border-t border-light-border dark:border-dark-border pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-error-600 dark:text-error-400">Excluir conta</p>
                <p className="text-sm text-light-text-muted dark:text-dark-text-muted">
                  Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente removidos.
                </p>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 text-sm font-medium text-error-600 dark:text-error-400 hover:text-error-700 dark:hover:text-error-300 transition-colors duration-200"
              >
                Excluir conta
              </button>
            </div>

            {showDeleteConfirm && (
              <div className="mt-4 p-4 bg-error-50 dark:bg-error-900/20 rounded-lg border border-error-200 dark:border-error-800">
                <p className="text-error-800 dark:text-error-200 font-medium mb-3">
                  Tem certeza que deseja excluir sua conta?
                </p>
                <p className="text-sm text-error-700 dark:text-error-300 mb-4">
                  Digite sua senha para confirmar:
                </p>
                <div className="space-y-3">
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Sua senha"
                    className="w-full px-4 py-2 border border-error-300 dark:border-error-700 rounded-lg bg-white dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-error-500 dark:focus:ring-error-400"
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={loading || !deletePassword}
                      className="px-4 py-2 bg-error-600 hover:bg-error-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                    >
                      {loading ? 'Excluindo...' : 'Confirmar exclusão'}
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeletePassword('');
                      }}
                      className="px-4 py-2 border border-light-border dark:border-dark-border text-light-text-primary dark:text-dark-text-primary rounded-lg font-medium hover:bg-light-bg dark:hover:bg-dark-bg transition-colors duration-200"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 