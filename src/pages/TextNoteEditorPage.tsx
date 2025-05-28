import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Plus,
  Eye,
  EyeOff,
  Star,
  StarOff,
  Tag,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useTextNotes } from '../context/TextNotesContext';
import type { TextNote, TextBlock } from '../context/TextNotesContext';
import { RichTextEditor } from '../components/TextNotes/RichTextEditor';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const TextNoteEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const {
    textNotes,
    updateTextNote,
    addBlock,
    updateBlock,
    deleteBlock,
    toggleFavorite
  } = useTextNotes();

  const [note, setNote] = useState<TextNote | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [editingMetadata, setEditingMetadata] = useState(false);
  const [metadataForm, setMetadataForm] = useState({
    title: '',
    subject: '',
    category: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    tags: '',
    color: '#3B82F6'
  });

  useEffect(() => {
    if (id) {
      const foundNote = textNotes.find(n => n.id === id);
      if (foundNote) {
        setNote(foundNote);
        setMetadataForm({
          title: foundNote.title,
          subject: foundNote.subject,
          category: foundNote.category,
          priority: foundNote.priority,
          tags: foundNote.tags.join(', '),
          color: foundNote.color
        });
      } else {
        navigate('/text-notes');
      }
    } else {
      navigate('/text-notes');
    }
  }, [id, textNotes, navigate]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleSave = async () => {
    if (!note) return;

    setIsSaving(true);
    try {
      await updateTextNote(note.id, {
        title: metadataForm.title,
        subject: metadataForm.subject,
        category: metadataForm.category,
        priority: metadataForm.priority,
        tags: metadataForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        color: metadataForm.color,
        blocks: note.blocks
      });
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Erro ao salvar nota:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddBlock = async (type: 'text' | 'heading' | 'bullet' | 'number' = 'text') => {
    if (!note) return;

    await addBlock(note.id, {
      content: '',
      style: {},
      type
    });

    // Recarregar a nota
    const updatedNote = textNotes.find(n => n.id === note.id);
    if (updatedNote) {
      setNote(updatedNote);
    }
    setHasUnsavedChanges(true);
  };

  const handleUpdateBlock = async (blockId: string, updates: Partial<TextBlock>) => {
    if (!note) return;

    await updateBlock(note.id, blockId, updates);

    // Atualizar estado local
    setNote(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        blocks: prev.blocks.map(block =>
          block.id === blockId ? { ...block, ...updates } : block
        )
      };
    });
    setHasUnsavedChanges(true);
  };

  const handleDeleteBlock = async (blockId: string) => {
    if (!note) return;

    await deleteBlock(note.id, blockId);

    // Atualizar estado local
    setNote(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        blocks: prev.blocks.filter(block => block.id !== blockId)
      };
    });
    setHasUnsavedChanges(true);
  };

  const handleBlockSave = () => {
    setHasUnsavedChanges(true);
  };

  const getTextStyles = (block: TextBlock) => {
    const style = block.style;
    const styles: React.CSSProperties = {
      fontWeight: style.bold ? 'bold' : 'normal',
      fontStyle: style.italic ? 'italic' : 'normal',
      textDecoration: [
        style.underline ? 'underline' : '',
        style.strikethrough ? 'line-through' : ''
      ].filter(Boolean).join(' ') || 'none',
      color: style.color || '#000000',
      backgroundColor: style.backgroundColor || 'transparent',
      fontSize: style.fontSize ? `${style.fontSize}px` : '14px',
      fontFamily: style.fontFamily || 'inherit'
    };
    return styles;
  };

  const renderPreviewBlock = (block: TextBlock) => {
    const styles = getTextStyles(block);
    
    switch (block.type) {
      case 'heading':
        return (
          <h2 key={block.id} style={styles} className="text-xl font-semibold mb-3">
            {block.content}
          </h2>
        );
      case 'bullet':
        return (
          <div key={block.id} className="flex items-start mb-2">
            <span className="mr-3 mt-1.5 w-2 h-2 bg-gray-400 rounded-full flex-shrink-0"></span>
            <span style={styles}>{block.content}</span>
          </div>
        );
      case 'number':
        return (
          <div key={block.id} className="flex items-start mb-2">
            <span className="mr-3 text-gray-600 min-w-[24px] font-medium">{block.order + 1}.</span>
            <span style={styles}>{block.content}</span>
          </div>
        );
      default:
        return (
          <p key={block.id} style={styles} className="mb-3 leading-relaxed">
            {block.content}
          </p>
        );
    }
  };

  if (!note) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText size={48} className="mx-auto text-light-text-muted dark:text-dark-text-muted mb-4" />
          <p className="text-light-text-muted dark:text-dark-text-muted">Carregando nota...</p>
        </div>
      </div>
    );
  }

  const sortedBlocks = [...note.blocks].sort((a, b) => a.order - b.order);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-soft dark:shadow-dark-soft border border-light-border dark:border-dark-border p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/text-notes')}
            className="flex items-center space-x-2 text-light-text-muted dark:text-dark-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Voltar às Notas</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isPreviewMode
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                  : 'border border-light-border dark:border-dark-border hover:bg-light-surface dark:hover:bg-dark-surface'
              }`}
            >
              {isPreviewMode ? <EyeOff size={20} /> : <Eye size={20} />}
              <span>{isPreviewMode ? 'Editar' : 'Visualizar'}</span>
            </button>

            <button
              onClick={() => toggleFavorite(note.id)}
              className={`p-2 rounded-lg transition-colors ${
                note.isFavorite
                  ? 'text-yellow-500 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/30'
                  : 'text-light-text-muted dark:text-dark-text-muted hover:bg-light-surface dark:hover:bg-dark-surface'
              }`}
              title={note.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              {note.isFavorite ? <Star size={20} className="fill-current" /> : <StarOff size={20} />}
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving || !hasUnsavedChanges}
              className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700 disabled:bg-light-text-muted dark:disabled:bg-dark-text-muted text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Save size={20} />
              <span>{isSaving ? 'Salvando...' : 'Salvar'}</span>
            </button>
          </div>
        </div>

        {/* Metadados */}
        {editingMetadata ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
                  Título
                </label>
                <input
                  type="text"
                  value={metadataForm.title}
                  onChange={(e) => setMetadataForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
                  Disciplina
                </label>
                <input
                  type="text"
                  value={metadataForm.subject}
                  onChange={(e) => setMetadataForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
                  Categoria
                </label>
                <input
                  type="text"
                  value={metadataForm.category}
                  onChange={(e) => setMetadataForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
                  Prioridade
                </label>
                <select
                  value={metadataForm.priority}
                  onChange={(e) => setMetadataForm(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
                Tags (separadas por vírgula)
              </label>
              <input
                type="text"
                value={metadataForm.tags}
                onChange={(e) => setMetadataForm(prev => ({ ...prev, tags: e.target.value }))}
                className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
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
                    onClick={() => setMetadataForm(prev => ({ ...prev, color }))}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      metadataForm.color === color ? 'border-light-text-primary dark:border-dark-text-primary scale-110' : 'border-light-border dark:border-dark-border'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setEditingMetadata(false)}
                className="px-4 py-2 border border-light-border dark:border-dark-border text-light-text-secondary dark:text-dark-text-secondary rounded-lg hover:bg-light-surface dark:hover:bg-dark-surface transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingMetadata(false);
                  setHasUnsavedChanges(true);
                }}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                Salvar Metadados
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">{note.title}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-light-text-muted dark:text-dark-text-muted">
                  <span>{note.subject}</span>
                  <span>•</span>
                  <span>{note.category}</span>
                  <span>•</span>
                  <span>Atualizada {format(note.updatedAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                </div>
              </div>
              <button
                onClick={() => setEditingMetadata(true)}
                className="flex items-center space-x-1 text-light-text-muted dark:text-dark-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors"
              >
                <Tag size={16} />
                <span>Editar</span>
              </button>
            </div>

            {note.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {note.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center space-x-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs"
                  >
                    <Tag size={10} />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {hasUnsavedChanges && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-center space-x-2">
            <AlertCircle size={16} className="text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm text-yellow-800 dark:text-yellow-200">Você tem alterações não salvas</span>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-soft dark:shadow-dark-soft border border-light-border dark:border-dark-border">
        {isPreviewMode ? (
          <div className="p-8">
            <div className="prose max-w-none">
              {sortedBlocks.length === 0 ? (
                <div className="text-center py-12 text-light-text-muted dark:text-dark-text-muted">
                  <FileText size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Esta nota ainda não possui conteúdo</p>
                  <button
                    onClick={() => setIsPreviewMode(false)}
                    className="mt-4 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline"
                  >
                    Adicionar conteúdo
                  </button>
                </div>
              ) : (
                sortedBlocks.map(block => renderPreviewBlock(block))
              )}
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">Conteúdo da Nota</h2>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleAddBlock('text')}
                  className="flex items-center space-x-1 px-3 py-2 text-sm bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700 text-white rounded-lg transition-colors"
                >
                  <Plus size={16} />
                  <span>Texto</span>
                </button>
                <button
                  onClick={() => handleAddBlock('heading')}
                  className="flex items-center space-x-1 px-3 py-2 text-sm border border-light-border dark:border-dark-border hover:bg-light-surface dark:hover:bg-dark-surface rounded-lg transition-colors"
                >
                  <Plus size={16} />
                  <span>Título</span>
                </button>
                <button
                  onClick={() => handleAddBlock('bullet')}
                  className="flex items-center space-x-1 px-3 py-2 text-sm border border-light-border dark:border-dark-border hover:bg-light-surface dark:hover:bg-dark-surface rounded-lg transition-colors"
                >
                  <Plus size={16} />
                  <span>Lista</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {sortedBlocks.length === 0 ? (
                <div className="text-center py-12 bg-light-surface dark:bg-dark-surface rounded-lg border border-light-border dark:border-dark-border">
                  <FileText size={48} className="mx-auto text-light-text-muted dark:text-dark-text-muted mb-4" />
                  <h3 className="text-lg font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">Nota vazia</h3>
                  <p className="text-light-text-muted dark:text-dark-text-muted mb-4">Adicione seu primeiro bloco de conteúdo</p>
                  <button
                    onClick={() => handleAddBlock('text')}
                    className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Plus size={20} />
                    <span>Adicionar Bloco</span>
                  </button>
                </div>
              ) : (
                sortedBlocks.map((block, index) => (
                  <div key={block.id} className="relative group">
                    <RichTextEditor
                      block={block}
                      onUpdate={(updates) => handleUpdateBlock(block.id, updates)}
                      onDelete={() => handleDeleteBlock(block.id)}
                      onSave={handleBlockSave}
                      autoFocus={index === sortedBlocks.length - 1 && !block.content}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 