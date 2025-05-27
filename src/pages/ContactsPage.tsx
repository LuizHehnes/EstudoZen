import React, { useState } from 'react';
import { Plus, Search, User, Mail, Phone, BookOpen, Edit, Trash2 } from 'lucide-react';
import { useContacts, type Contact } from '../context/ContactsContext';

export const ContactsPage: React.FC = () => {
  const { contacts, addContact, updateContact, deleteContact, searchContacts } = useContacts();
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    role: 'professor' as 'professor' | 'monitor' | 'coordenador',
    notes: ''
  });

  const filteredContacts = searchQuery 
    ? searchContacts(searchQuery)
    : contacts;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingContact) {
      await updateContact(editingContact.id, formData);
    } else {
      await addContact(formData);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      role: 'professor',
      notes: ''
    });
    setShowForm(false);
    setEditingContact(null);
  };

  const handleEdit = (contact: Contact) => {
    setFormData({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      subject: contact.subject,
      role: contact.role,
      notes: contact.notes
    });
    setEditingContact(contact);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este contato?')) {
      await deleteContact(id);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'professor':
        return 'bg-blue-100 text-blue-800';
      case 'monitor':
        return 'bg-green-100 text-green-800';
      case 'coordenador':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'professor':
        return 'Professor';
      case 'monitor':
        return 'Monitor';
      case 'coordenador':
        return 'Coordenador';
      default:
        return role;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-neutral-800">
            Contatos
          </h1>
          <p className="text-neutral-600 mt-1">
            Gerencie contatos de professores e disciplinas
          </p>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          <span>Novo Contato</span>
        </button>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          placeholder="Buscar contatos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4">
            {editingContact ? 'Editar Contato' : 'Novo Contato'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Função
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="professor">Professor</option>
                  <option value="monitor">Monitor</option>
                  <option value="coordenador">Coordenador</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Disciplina *
              </label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ex: Matemática, História, Física..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Observações
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Informações adicionais..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 py-2 px-4 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                {editingContact ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* lista contatos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <User size={48} className="mx-auto text-neutral-400 mb-4" />
            <h3 className="text-lg font-medium text-neutral-600 mb-2">
              {searchQuery ? 'Nenhum contato encontrado' : 'Nenhum contato cadastrado'}
            </h3>
            <p className="text-neutral-500 mb-4">
              {searchQuery 
                ? 'Tente buscar com outros termos'
                : 'Adicione seu primeiro contato para começar'
              }
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus size={20} />
                <span>Adicionar Contato</span>
              </button>
            )}
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <div key={contact.id} className="bg-white rounded-xl shadow-soft p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-neutral-800 mb-1">
                    {contact.name}
                  </h3>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(contact.role)}`}>
                    {getRoleLabel(contact.role)}
                  </span>
                </div>
                
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(contact)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2 text-neutral-600">
                  <BookOpen size={16} />
                  <span>{contact.subject}</span>
                </div>
                
                {contact.email && (
                  <div className="flex items-center space-x-2 text-neutral-600">
                    <Mail size={16} />
                    <a 
                      href={`mailto:${contact.email}`}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      {contact.email}
                    </a>
                  </div>
                )}
                
                {contact.phone && (
                  <div className="flex items-center space-x-2 text-neutral-600">
                    <Phone size={16} />
                    <a 
                      href={`tel:${contact.phone}`}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      {contact.phone}
                    </a>
                  </div>
                )}
              </div>

              {contact.notes && (
                <div className="mt-3 pt-3 border-t border-neutral-200">
                  <p className="text-sm text-neutral-600">{contact.notes}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}; 