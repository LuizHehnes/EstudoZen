import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  StarOff,
  Edit,
  Trash2,
  Copy,
  Download,
  Tag,
  Clock,
  BookOpen,
  MoreVertical,
  FileText,
  AlertCircle
} from 'lucide-react';
import type { TextNote, TextBlock } from '../../context/TextNotesContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TextNoteCardProps {
  note: TextNote;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onExport: (id: string, format: 'txt' | 'html' | 'md') => void;
  compact?: boolean;
}

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

export const TextNoteCard: React.FC<TextNoteCardProps> = ({
  note,
  onDelete,
  onDuplicate,
  onToggleFavorite,
  onExport,
  compact = false
}) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const formatDate = (date: Date) => {
    return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
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

  const renderBlock = (block: TextBlock) => {
    const styles = getTextStyles(block);
    
    switch (block.type) {
      case 'heading':
        return (
          <h3 key={block.id} style={styles} className="font-semibold mb-2 text-light-text-primary dark:text-dark-text-primary">
            {block.content}
          </h3>
        );
      case 'bullet':
        return (
          <div key={block.id} className="flex items-start mb-1">
            <span className="mr-2 mt-1.5 w-1.5 h-1.5 bg-light-text-muted dark:bg-dark-text-muted rounded-full flex-shrink-0"></span>
            <span style={styles} className="text-light-text-secondary dark:text-dark-text-secondary">{block.content}</span>
          </div>
        );
      case 'number':
        return (
          <div key={block.id} className="flex items-start mb-1">
            <span className="mr-2 text-light-text-muted dark:text-dark-text-muted min-w-[20px]">{block.order + 1}.</span>
            <span style={styles} className="text-light-text-secondary dark:text-dark-text-secondary">{block.content}</span>
          </div>
        );
      default:
        return (
          <p key={block.id} style={styles} className="mb-2 text-light-text-secondary dark:text-dark-text-secondary">
            {block.content}
          </p>
        );
    }
  };

  const getPreviewText = () => {
    const textBlocks = note.blocks.filter(block => block.content.trim());
    if (textBlocks.length === 0) return 'Nota vazia...';
    
    const firstBlock = textBlocks[0];
    return firstBlock.content.length > 100 
      ? firstBlock.content.substring(0, 100) + '...'
      : firstBlock.content;
  };

  const handleExport = (format: 'txt' | 'html' | 'md') => {
    onExport(note.id, format);
    setShowExportMenu(false);
    setShowMenu(false);
  };

  const handleEdit = () => {
    navigate(`/text-notes/edit/${note.id}`);
  };

  if (compact) {
    return (
      <div
        className="bg-light-card dark:bg-dark-card rounded-lg border border-light-border dark:border-dark-border p-4 hover:shadow-soft dark:hover:shadow-dark-soft transition-shadow cursor-pointer animate-fade-in"
        onClick={handleEdit}
        style={{ borderLeftColor: note.color, borderLeftWidth: '4px' }}
      >
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-light-text-primary dark:text-dark-text-primary truncate flex-1 mr-2">
            {note.title}
          </h3>
          {note.isFavorite && (
            <Star size={16} className="text-yellow-500 fill-current flex-shrink-0" />
          )}
        </div>
        
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2 line-clamp-2">
          {getPreviewText()}
        </p>
        
        <div className="flex items-center justify-between text-xs text-light-text-muted dark:text-dark-text-muted">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <BookOpen size={12} />
              <span>{note.subject}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock size={12} />
              <span>{format(note.updatedAt, 'dd/MM', { locale: ptBR })}</span>
            </div>
          </div>
          
          <div className={`px-2 py-1 rounded-full text-xs ${priorityColors[note.priority]}`}>
            {priorityLabels[note.priority]}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-light-card dark:bg-dark-card rounded-lg border border-light-border dark:border-dark-border shadow-soft dark:shadow-dark-soft hover:shadow-medium dark:hover:shadow-dark-medium transition-shadow animate-fade-in"
      style={{ borderLeftColor: note.color, borderLeftWidth: '4px' }}
    >
      {/* Header */}
      <div className="p-4 border-b border-light-border dark:border-dark-border">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
                {note.title}
              </h3>
              {note.isFavorite && (
                <Star size={18} className="text-yellow-500 fill-current" />
              )}
              <div className={`px-2 py-1 rounded-full text-xs ${priorityColors[note.priority]}`}>
                {priorityLabels[note.priority]}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-light-text-muted dark:text-dark-text-muted">
              <div className="flex items-center space-x-1">
                <BookOpen size={14} />
                <span>{note.subject}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <FileText size={14} />
                <span>{note.category}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Clock size={14} />
                <span>Atualizada {formatDate(note.updatedAt)}</span>
              </div>
              
              {note.blocks.length > 0 && (
                <div className="flex items-center space-x-1">
                  <AlertCircle size={14} />
                  <span>{note.blocks.length} bloco{note.blocks.length !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-light-surface dark:hover:bg-dark-surface rounded transition-colors"
            >
              <MoreVertical size={20} className="text-light-text-muted dark:text-dark-text-muted" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg shadow-medium dark:shadow-dark-medium z-10">
                <button
                  onClick={() => {
                    handleEdit();
                    setShowMenu(false);
                  }}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-left hover:bg-light-surface dark:hover:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
                >
                  <Edit size={16} />
                  <span>Editar</span>
                </button>
                
                <button
                  onClick={() => {
                    onToggleFavorite(note.id);
                    setShowMenu(false);
                  }}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-left hover:bg-light-surface dark:hover:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
                >
                  {note.isFavorite ? <StarOff size={16} /> : <Star size={16} />}
                  <span>{note.isFavorite ? 'Remover favorito' : 'Adicionar favorito'}</span>
                </button>
                
                <button
                  onClick={() => {
                    onDuplicate(note.id);
                    setShowMenu(false);
                  }}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-left hover:bg-light-surface dark:hover:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
                >
                  <Copy size={16} />
                  <span>Duplicar</span>
                </button>
                
                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-left hover:bg-light-surface dark:hover:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
                  >
                    <Download size={16} />
                    <span>Exportar</span>
                  </button>
                  
                  {showExportMenu && (
                    <div className="absolute left-full top-0 w-36 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg shadow-medium dark:shadow-dark-medium">
                      <button
                        onClick={() => handleExport('txt')}
                        className="flex items-center space-x-2 w-full px-3 py-2 text-left hover:bg-light-surface dark:hover:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
                      >
                        <span>Texto (.txt)</span>
                      </button>
                      <button
                        onClick={() => handleExport('html')}
                        className="flex items-center space-x-2 w-full px-3 py-2 text-left hover:bg-light-surface dark:hover:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
                      >
                        <span>HTML (.html)</span>
                      </button>
                      <button
                        onClick={() => handleExport('md')}
                        className="flex items-center space-x-2 w-full px-3 py-2 text-left hover:bg-light-surface dark:hover:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
                      >
                        <span>Markdown (.md)</span>
                      </button>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => {
                    onDelete(note.id);
                    setShowMenu(false);
                  }}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-left hover:bg-error-100 dark:hover:bg-error-900/20 text-error-600 dark:text-error-400"
                >
                  <Trash2 size={16} />
                  <span>Excluir</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
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
        
        <div className="space-y-2">
          {note.blocks.slice(0, 3).map(renderBlock)}
          
          {note.blocks.length > 3 && (
            <button
              onClick={handleEdit}
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              Ver mais...
            </button>
          )}
          
          {note.blocks.length === 0 && (
            <p className="text-light-text-muted dark:text-dark-text-muted italic text-sm">
              Sem conteúdo. Clique em editar para adicionar conteúdo.
            </p>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <div className="flex items-center justify-end p-3 border-t border-light-border dark:border-dark-border">
        <button
          onClick={handleEdit}
          className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
        >
          Editar nota
        </button>
      </div>
    </div>
  );
}; 