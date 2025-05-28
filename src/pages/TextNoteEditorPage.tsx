import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Eye,
  Star,
  StarOff,
  Tag,
  FileText,
  Type,
  ListOrdered,
  List,
  Heading,
  BookOpen,
  Edit
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
      color: style.color || 'currentColor',
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
          <h2 key={block.id} style={styles} className="text-xl font-semibold mb-3 text-light-text-primary dark:text-dark-text-primary">
            {block.content}
          </h2>
        );
      case 'bullet':
        return (
          <div key={block.id} className="flex items-start mb-2">
            <span className="mr-3 mt-1.5 w-2 h-2 bg-light-text-muted dark:bg-dark-text-muted rounded-full flex-shrink-0"></span>
            <span style={styles} className="text-light-text-secondary dark:text-dark-text-secondary">{block.content}</span>
          </div>
        );
      case 'number':
        return (
          <div key={block.id} className="flex items-start mb-2">
            <span className="mr-3 text-light-text-muted dark:text-dark-text-muted min-w-[24px] font-medium">{block.order + 1}.</span>
            <span style={styles} className="text-light-text-secondary dark:text-dark-text-secondary">{block.content}</span>
          </div>
        );
      default:
        return (
          <p key={block.id} style={styles} className="mb-3 leading-relaxed text-light-text-secondary dark:text-dark-text-secondary">
            {block.content}
          </p>
        );
    }
  };

  const priorityColors = {
    low: 'bg-success-100 dark:bg-success-900/30 text-success-600 dark:text-success-400',
    medium: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
    high: 'bg-error-100 dark:bg-error-900/30 text-error-600 dark:text-error-400'
  };

  const priorityLabels = {
    low: 'Baixa',
    medium: 'Média',
    high: 'Alta'
  };

  if (!note) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto pb-20 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/text-notes')}
            className="p-2 rounded-lg hover:bg-light-surface dark:hover:bg-dark-surface text-light-text-muted dark:text-dark-text-muted transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          
          {editingMetadata ? (
            <input
              type="text"
              value={metadataForm.title}
              onChange={(e) => {
                setMetadataForm(prev => ({ ...prev, title: e.target.value }));
                setHasUnsavedChanges(true);
              }}
              className="text-2xl font-semibold bg-transparent border-b-2 border-primary-500 dark:border-primary-400 focus:outline-none text-light-text-primary dark:text-dark-text-primary"
              placeholder="Título da nota"
              autoFocus
            />
          ) : (
            <h1 
              className="text-2xl font-semibold text-light-text-primary dark:text-dark-text-primary" 
              onClick={() => setEditingMetadata(true)}
            >
              {note.title}
            </h1>
          )}
          
          <div className={`px-2 py-1 rounded-full text-xs ${priorityColors[note.priority]}`}>
            {priorityLabels[note.priority]}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => toggleFavorite(note.id)}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-colors ${
              note.isFavorite
                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                : 'bg-light-surface dark:bg-dark-surface text-light-text-muted dark:text-dark-text-muted'
            }`}
            title={note.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            {note.isFavorite ? <StarOff size={16} /> : <Star size={16} />}
            <span className="text-sm">{note.isFavorite ? 'Desfavoritar' : 'Favoritar'}</span>
          </button>
          
          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-colors ${
              isPreviewMode
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                : 'bg-light-surface dark:bg-dark-surface text-light-text-muted dark:text-dark-text-muted'
            }`}
            title={isPreviewMode ? 'Modo de edição' : 'Modo de visualização'}
          >
            {isPreviewMode ? <Edit size={16} /> : <Eye size={16} />}
            <span className="text-sm">{isPreviewMode ? 'Editar' : 'Visualizar'}</span>
          </button>
          
          <button
            onClick={handleSave}
            disabled={isSaving || !hasUnsavedChanges}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-primary-600 dark:bg-primary-500 text-white transition-colors ${
              isSaving || !hasUnsavedChanges
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-primary-700 dark:hover:bg-primary-600'
            }`}
          >
            <Save size={16} />
            <span className="text-sm">{isSaving ? 'Salvando...' : 'Salvar'}</span>
          </button>
        </div>
      </div>

      {/* Metadados */}
      {editingMetadata ? (
        <div className="card mb-6">
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-light-text-muted dark:text-dark-text-muted mb-1">
                  Matéria
                </label>
                <input
                  type="text"
                  value={metadataForm.subject}
                  onChange={(e) => {
                    setMetadataForm(prev => ({ ...prev, subject: e.target.value }));
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full p-2 rounded-lg border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
                  placeholder="Ex: Matemática, História, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-light-text-muted dark:text-dark-text-muted mb-1">
                  Categoria
                </label>
                <input
                  type="text"
                  value={metadataForm.category}
                  onChange={(e) => {
                    setMetadataForm(prev => ({ ...prev, category: e.target.value }));
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full p-2 rounded-lg border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
                  placeholder="Ex: Resumo, Trabalho, Projeto, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-light-text-muted dark:text-dark-text-muted mb-1">
                  Prioridade
                </label>
                <select
                  value={metadataForm.priority}
                  onChange={(e) => {
                    setMetadataForm(prev => ({ ...prev, priority: e.target.value as any }));
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full p-2 rounded-lg border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-light-text-muted dark:text-dark-text-muted mb-1">
                Tags (separadas por vírgula)
              </label>
              <input
                type="text"
                value={metadataForm.tags}
                onChange={(e) => {
                  setMetadataForm(prev => ({ ...prev, tags: e.target.value }));
                  setHasUnsavedChanges(true);
                }}
                className="w-full p-2 rounded-lg border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
                placeholder="Ex: importante, revisão, prova, etc."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-light-text-muted dark:text-dark-text-muted mb-1">
                Cor da nota
              </label>
              <div className="flex gap-2">
                {['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6B7280'].map(color => (
                  <button
                    key={color}
                    onClick={() => {
                      setMetadataForm(prev => ({ ...prev, color }));
                      setHasUnsavedChanges(true);
                    }}
                    className={`w-8 h-8 rounded-full transition-transform ${
                      metadataForm.color === color 
                        ? 'ring-2 ring-offset-2 ring-primary-600 dark:ring-primary-400 scale-110' 
                        : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: color }}
                  ></button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setEditingMetadata(false)}
                className="px-4 py-2 bg-primary-600 dark:bg-primary-500 hover:bg-primary-700 dark:hover:bg-primary-600 text-white rounded-lg text-sm"
              >
                Concluir edição
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card mb-6 p-4 cursor-pointer hover:shadow-medium dark:hover:shadow-dark-medium transition-shadow" onClick={() => setEditingMetadata(true)}>
          <div className="flex flex-wrap gap-4 text-sm text-light-text-muted dark:text-dark-text-muted">
            <div className="flex items-center space-x-1">
              <FileText size={14} />
              <span className="font-medium text-light-text-secondary dark:text-dark-text-secondary">{note.category || 'Sem categoria'}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <BookOpen size={14} />
              <span className="font-medium text-light-text-secondary dark:text-dark-text-secondary">{note.subject || 'Sem matéria'}</span>
            </div>
          </div>
          
          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {note.tags.map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-1 px-2 py-1 bg-light-surface dark:bg-dark-surface rounded-full text-xs text-light-text-muted dark:text-dark-text-muted"
                >
                  <Tag size={12} />
                  <span>{tag}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Conteúdo */}
      <div className="card mb-6 p-4">
        {isPreviewMode ? (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {note.blocks.length === 0 ? (
              <div className="text-center py-12">
                <FileText size={48} className="mx-auto mb-4 text-light-text-muted dark:text-dark-text-muted opacity-40" />
                <p className="text-light-text-muted dark:text-dark-text-muted">Esta nota ainda não possui conteúdo</p>
                <button
                  onClick={() => setIsPreviewMode(false)}
                  className="mt-4 px-4 py-2 bg-primary-600 dark:bg-primary-500 hover:bg-primary-700 dark:hover:bg-primary-600 text-white rounded-lg text-sm"
                >
                  Adicionar conteúdo
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {note.blocks
                  .sort((a, b) => a.order - b.order)
                  .map(renderPreviewBlock)
                }
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {note.blocks.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-light-text-muted dark:text-dark-text-muted mb-4">Adicione blocos para começar a criar sua nota</p>
              </div>
            ) : (
              <div className="space-y-4">
                {note.blocks
                  .sort((a, b) => a.order - b.order)
                  .map(block => (
                    <RichTextEditor
                      key={block.id}
                      block={block}
                      onUpdate={(updates) => handleUpdateBlock(block.id, updates)}
                      onDelete={() => handleDeleteBlock(block.id)}
                      onSave={handleBlockSave}
                    />
                  ))
                }
              </div>
            )}
            
            {/* Adicionar blocos */}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-light-border dark:border-dark-border">
              <button
                onClick={() => handleAddBlock('text')}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-light-surface dark:bg-dark-surface hover:bg-light-border dark:hover:bg-dark-border text-light-text-secondary dark:text-dark-text-secondary transition-colors"
              >
                <Type size={16} />
                <span className="text-sm">Texto</span>
              </button>
              
              <button
                onClick={() => handleAddBlock('heading')}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-light-surface dark:bg-dark-surface hover:bg-light-border dark:hover:bg-dark-border text-light-text-secondary dark:text-dark-text-secondary transition-colors"
              >
                <Heading size={16} />
                <span className="text-sm">Título</span>
              </button>
              
              <button
                onClick={() => handleAddBlock('bullet')}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-light-surface dark:bg-dark-surface hover:bg-light-border dark:hover:bg-dark-border text-light-text-secondary dark:text-dark-text-secondary transition-colors"
              >
                <List size={16} />
                <span className="text-sm">Lista</span>
              </button>
              
              <button
                onClick={() => handleAddBlock('number')}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-light-surface dark:bg-dark-surface hover:bg-light-border dark:hover:bg-dark-border text-light-text-secondary dark:text-dark-text-secondary transition-colors"
              >
                <ListOrdered size={16} />
                <span className="text-sm">Lista Numerada</span>
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Informações da Nota */}
      <div className="flex flex-wrap justify-between items-center text-xs text-light-text-muted dark:text-dark-text-muted">
        <div>
          Criada em {format(note.createdAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
        </div>
        <div>
          Última atualização: {format(note.updatedAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
        </div>
      </div>
    </div>
  );
}; 