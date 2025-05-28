import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Star,
  BookOpen,
  Tag,
  Upload,
  FileText,
  SortAsc,
  SortDesc,
  RefreshCw
} from 'lucide-react';
import { useTextNotes } from '../context/TextNotesContext';
import { TextNoteCard } from '../components/TextNotes/TextNoteCard';

type ViewMode = 'grid' | 'list';
type SortBy = 'title' | 'date' | 'subject' | 'priority';
type FilterBy = 'all' | 'favorites' | 'recent' | 'category' | 'priority';

export const TextNotesPage: React.FC = () => {
  const {
    textNotes,
    isLoading,
    createTextNote,
    deleteTextNote,
    duplicateTextNote,
    toggleFavorite,
    exportNote,
    importNote,
    searchTextNotes,
    getFavoriteTextNotes
  } = useTextNotes();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterBy, setFilterBy] = useState<FilterBy>('all');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // vars p/ nova nota
  const [newNoteData, setNewNoteData] = useState({
    title: '',
    subject: '',
    category: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    tags: '',
    color: '#3B82F6'
  });

  // vars p/ importação
  const [importData, setImportData] = useState({
    content: '',
    format: 'txt' as 'txt' | 'html' | 'md',
    title: '',
    subject: ''
  });

  useEffect(() => {
    // carrega as preferências salvas
    const savedViewMode = localStorage.getItem('textNotes-viewMode') as ViewMode;
    const savedSortBy = localStorage.getItem('textNotes-sortBy') as SortBy;
    const savedSortOrder = localStorage.getItem('textNotes-sortOrder') as 'asc' | 'desc';

    if (savedViewMode) setViewMode(savedViewMode);
    if (savedSortBy) setSortBy(savedSortBy);
    if (savedSortOrder) setSortOrder(savedSortOrder);
  }, []);

  useEffect(() => {
    // salva as preferências
    localStorage.setItem('textNotes-viewMode', viewMode);
    localStorage.setItem('textNotes-sortBy', sortBy);
    localStorage.setItem('textNotes-sortOrder', sortOrder);
  }, [viewMode, sortBy, sortOrder]);

  const getFilteredNotes = () => {
    let filtered = textNotes;

    // aplica a busca
    if (searchQuery) {
      filtered = searchTextNotes(searchQuery);
    }

    // aplica os filtros
    switch (filterBy) {
      case 'favorites':
        filtered = filtered.filter(note => note.isFavorite);
        break;
      case 'recent':
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        filtered = filtered.filter(note => note.updatedAt > threeDaysAgo);
        break;
      case 'category':
        if (selectedCategory) {
          filtered = filtered.filter(note => note.category === selectedCategory);
        }
        break;
      case 'priority':
        if (selectedPriority) {
          filtered = filtered.filter(note => note.priority === selectedPriority);
        }
        break;
    }

    // aplica a ordenação
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'date':
          comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
          break;
        case 'subject':
          comparison = a.subject.localeCompare(b.subject);
          break;
        case 'priority':
          const priorityOrder = { low: 1, medium: 2, high: 3 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };

  const getCategories = () => {
    const categories = Array.from(new Set(textNotes.map(note => note.category)));
    return categories.filter(Boolean);
  };

  const handleCreateNote = async () => {
    const tags = newNoteData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const newNote = {
      title: newNoteData.title,
      subject: newNoteData.subject,
      category: newNoteData.category || 'Geral',
      priority: newNoteData.priority,
      tags,
      color: newNoteData.color,
      blocks: [],
      isFavorite: false
    };

    await createTextNote(newNote);
    setShowNewNoteModal(false);
    setNewNoteData({
      title: '',
      subject: '',
      category: '',
      priority: 'medium',
      tags: '',
      color: '#3B82F6'
    });
  };

  const handleImport = async () => {
    await importNote(
      importData.content,
      importData.format,
      importData.title,
      importData.subject
    );
    setShowImportModal(false);
    setImportData({
      content: '',
      format: 'txt',
      title: '',
      subject: ''
    });
  };

  const handleExport = (id: string, format: 'txt' | 'html' | 'md') => {
    const content = exportNote(id, format);
    const note = textNotes.find(n => n.id === id);
    if (!note) return;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredNotes = getFilteredNotes();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin text-primary-600 dark:text-primary-400" size={32} />
        <span className="ml-2 text-light-text-muted dark:text-dark-text-muted">Carregando notas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-light-text-primary dark:text-dark-text-primary">
            Notas de Texto
          </h1>
          <p className="text-light-text-muted dark:text-dark-text-muted mt-1">
            Crie e organize suas anotações com formatação rica
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center space-x-2 px-4 py-2 border border-light-border dark:border-dark-border rounded-lg hover:bg-light-surface dark:hover:bg-dark-surface transition-colors"
          >
            <Upload size={20} />
            <span>Importar</span>
          </button>
          
          <button
            onClick={() => setShowNewNoteModal(true)}
            className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            <span>Nova Nota</span>
          </button>
        </div>
      </div>

      {/* Filtros e Controles */}
      <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-soft dark:shadow-dark-soft border border-light-border dark:border-dark-border p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Busca */}
          <div className="relative flex-1 min-w-[300px]">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-text-muted dark:text-dark-text-muted" />
            <input
              type="text"
              placeholder="Buscar notas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
            />
          </div>

          {/* Filtros */}
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-light-text-muted dark:text-dark-text-muted" />
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as FilterBy)}
              className="px-3 py-2 border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
            >
              <option value="all">Todas</option>
              <option value="favorites">Favoritas</option>
              <option value="recent">Recentes</option>
              <option value="category">Por Categoria</option>
              <option value="priority">Por Prioridade</option>
            </select>

            {filterBy === 'category' && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
              >
                <option value="">Todas as Categorias</option>
                {getCategories().map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            )}

            {filterBy === 'priority' && (
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-3 py-2 border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
              >
                <option value="">Todas as Prioridades</option>
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            )}
          </div>

          {/* Ordenação */}
          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="px-3 py-2 border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
            >
              <option value="date">Data</option>
              <option value="title">Título</option>
              <option value="subject">Disciplina</option>
              <option value="priority">Prioridade</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-light-border dark:border-dark-border rounded-lg hover:bg-light-surface dark:hover:bg-dark-surface transition-colors"
              title={`Ordenar ${sortOrder === 'asc' ? 'decrescente' : 'crescente'}`}
            >
              {sortOrder === 'asc' ? <SortAsc size={20} /> : <SortDesc size={20} />}
            </button>
          </div>

          {/* Modo de Visualização */}
          <div className="flex items-center border border-light-border dark:border-dark-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${
                viewMode === 'grid' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'hover:bg-light-surface dark:hover:bg-dark-surface'
              }`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${
                viewMode === 'list' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'hover:bg-light-surface dark:hover:bg-dark-surface'
              }`}
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-light-card dark:bg-dark-card rounded-lg p-4 border border-light-border dark:border-dark-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-light-text-muted dark:text-dark-text-muted">Total de Notas</p>
              <p className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">{textNotes.length}</p>
            </div>
            <FileText className="text-blue-500 dark:text-blue-400" size={24} />
          </div>
        </div>

        <div className="bg-light-card dark:bg-dark-card rounded-lg p-4 border border-light-border dark:border-dark-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-light-text-muted dark:text-dark-text-muted">Favoritas</p>
              <p className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">{getFavoriteTextNotes().length}</p>
            </div>
            <Star className="text-yellow-500 dark:text-yellow-400" size={24} />
          </div>
        </div>

        <div className="bg-light-card dark:bg-dark-card rounded-lg p-4 border border-light-border dark:border-dark-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-light-text-muted dark:text-dark-text-muted">Categorias</p>
              <p className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">{getCategories().length}</p>
            </div>
            <Tag className="text-green-500 dark:text-green-400" size={24} />
          </div>
        </div>

        <div className="bg-light-card dark:bg-dark-card rounded-lg p-4 border border-light-border dark:border-dark-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-light-text-muted dark:text-dark-text-muted">Disciplinas</p>
              <p className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
                {new Set(textNotes.map(note => note.subject)).size}
              </p>
            </div>
            <BookOpen className="text-purple-500 dark:text-purple-400" size={24} />
          </div>
        </div>
      </div>

      {/* Lista de Notas */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-12 bg-light-card dark:bg-dark-card rounded-xl shadow-soft dark:shadow-dark-soft border border-light-border dark:border-dark-border">
          <FileText size={64} className="mx-auto text-light-text-muted dark:text-dark-text-muted mb-4" />
          <h3 className="text-xl font-semibold text-light-text-muted dark:text-dark-text-muted mb-2">
            {searchQuery ? 'Nenhuma nota encontrada' : 'Nenhuma nota criada'}
          </h3>
          <p className="text-light-text-muted dark:text-dark-text-muted mb-6">
            {searchQuery 
              ? 'Tente buscar com outros termos ou ajustar os filtros'
              : 'Crie sua primeira nota de texto para começar'
            }
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowNewNoteModal(true)}
              className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <Plus size={20} />
              <span>Criar Primeira Nota</span>
            </button>
          )}
        </div>
      ) : (
        <div className={`${
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }`}>
          {filteredNotes.map((note) => (
            <TextNoteCard
              key={note.id}
              note={note}
              compact={viewMode === 'list'}
              onDelete={deleteTextNote}
              onDuplicate={duplicateTextNote}
              onToggleFavorite={toggleFavorite}
              onExport={handleExport}
            />
          ))}
        </div>
      )}

      {/* Modal Nova Nota */}
      {showNewNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-light-card dark:bg-dark-card rounded-lg max-w-md w-full p-6 border border-light-border dark:border-dark-border">
            <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">Nova Nota de Texto</h3>
            
            <form onSubmit={(e) => { e.preventDefault(); handleCreateNote(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  required
                  value={newNoteData.title}
                  onChange={(e) => setNewNoteData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
                  placeholder="Ex: Resumo da aula de matemática"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
                  Disciplina *
                </label>
                <input
                  type="text"
                  required
                  value={newNoteData.subject}
                  onChange={(e) => setNewNoteData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
                  placeholder="Ex: Matemática, História, Física..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
                  Categoria
                </label>
                <input
                  type="text"
                  value={newNoteData.category}
                  onChange={(e) => setNewNoteData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
                  placeholder="Ex: Resumo, Exercício, Projeto..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
                  Prioridade
                </label>
                <select
                  value={newNoteData.priority}
                  onChange={(e) => setNewNoteData(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
                  Tags (separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={newNoteData.tags}
                  onChange={(e) => setNewNoteData(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
                  placeholder="Ex: prova, resumo, importante"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
                  Cor da Nota
                </label>
                <div className="flex space-x-2">
                  {['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewNoteData(prev => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        newNoteData.color === color ? 'border-light-text-primary dark:border-dark-text-primary scale-110' : 'border-light-border dark:border-dark-border'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewNoteModal(false)}
                  className="flex-1 py-2 px-4 border border-light-border dark:border-dark-border text-light-text-secondary dark:text-dark-text-secondary rounded-lg hover:bg-light-surface dark:hover:bg-dark-surface transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700 text-white rounded-lg transition-colors"
                >
                  Criar Nota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Importar */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-light-card dark:bg-dark-card rounded-lg max-w-2xl w-full p-6 border border-light-border dark:border-dark-border">
            <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">Importar Nota</h3>
            
            <form onSubmit={(e) => { e.preventDefault(); handleImport(); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
                    Título *
                  </label>
                  <input
                    type="text"
                    required
                    value={importData.title}
                    onChange={(e) => setImportData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
                    placeholder="Título da nota"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
                    Disciplina *
                  </label>
                  <input
                    type="text"
                    required
                    value={importData.subject}
                    onChange={(e) => setImportData(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
                    placeholder="Disciplina"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
                  Formato
                </label>
                <select
                  value={importData.format}
                  onChange={(e) => setImportData(prev => ({ ...prev, format: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
                >
                  <option value="txt">Texto (.txt)</option>
                  <option value="md">Markdown (.md)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
                  Conteúdo *
                </label>
                <textarea
                  required
                  value={importData.content}
                  onChange={(e) => setImportData(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 h-40 resize-none bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
                  placeholder="Cole o conteúdo aqui..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="flex-1 py-2 px-4 border border-light-border dark:border-dark-border text-light-text-secondary dark:text-dark-text-secondary rounded-lg hover:bg-light-surface dark:hover:bg-dark-surface transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700 text-white rounded-lg transition-colors"
                >
                  Importar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}; 