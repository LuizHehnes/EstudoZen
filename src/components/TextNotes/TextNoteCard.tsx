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
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-600',
  high: 'bg-red-100 text-red-600'
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
      color: style.color || '#000000',
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
          <h3 key={block.id} style={styles} className="font-semibold mb-2">
            {block.content}
          </h3>
        );
      case 'bullet':
        return (
          <div key={block.id} className="flex items-start mb-1">
            <span className="mr-2 mt-1.5 w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0"></span>
            <span style={styles}>{block.content}</span>
          </div>
        );
      case 'number':
        return (
          <div key={block.id} className="flex items-start mb-1">
            <span className="mr-2 text-gray-600 min-w-[20px]">{block.order + 1}.</span>
            <span style={styles}>{block.content}</span>
          </div>
        );
      default:
        return (
          <p key={block.id} style={styles} className="mb-2">
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
        className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
        onClick={handleEdit}
        style={{ borderLeftColor: note.color, borderLeftWidth: '4px' }}
      >
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-800 truncate flex-1 mr-2">
            {note.title}
          </h3>
          {note.isFavorite && (
            <Star size={16} className="text-yellow-500 fill-current flex-shrink-0" />
          )}
        </div>
        
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
          {getPreviewText()}
        </p>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
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
      className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
      style={{ borderLeftColor: note.color, borderLeftWidth: '4px' }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-800">
                {note.title}
              </h3>
              {note.isFavorite && (
                <Star size={18} className="text-yellow-500 fill-current" />
              )}
              <div className={`px-2 py-1 rounded-full text-xs ${priorityColors[note.priority]}`}>
                {priorityLabels[note.priority]}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
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
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <MoreVertical size={20} className="text-gray-500" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border rounded-lg shadow-lg z-10">
                <button
                  onClick={() => {
                    handleEdit();
                    setShowMenu(false);
                  }}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-left hover:bg-gray-50"
                >
                  <Edit size={16} />
                  <span>Editar</span>
                </button>
                
                <button
                  onClick={() => {
                    onToggleFavorite(note.id);
                    setShowMenu(false);
                  }}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-left hover:bg-gray-50"
                >
                  {note.isFavorite ? <StarOff size={16} /> : <Star size={16} />}
                  <span>{note.isFavorite ? 'Remover favorito' : 'Adicionar favorito'}</span>
                </button>
                
                <button
                  onClick={() => {
                    onDuplicate(note.id);
                    setShowMenu(false);
                  }}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-left hover:bg-gray-50"
                >
                  <Copy size={16} />
                  <span>Duplicar</span>
                </button>
                
                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-left hover:bg-gray-50"
                  >
                    <Download size={16} />
                    <span>Exportar</span>
                  </button>
                  
                  {showExportMenu && (
                    <div className="absolute left-full top-0 ml-1 w-32 bg-white border rounded-lg shadow-lg">
                      <button
                        onClick={() => handleExport('txt')}
                        className="block w-full px-3 py-2 text-left hover:bg-gray-50 text-sm"
                      >
                        Texto (.txt)
                      </button>
                      <button
                        onClick={() => handleExport('md')}
                        className="block w-full px-3 py-2 text-left hover:bg-gray-50 text-sm"
                      >
                        Markdown (.md)
                      </button>
                      <button
                        onClick={() => handleExport('html')}
                        className="block w-full px-3 py-2 text-left hover:bg-gray-50 text-sm"
                      >
                        HTML (.html)
                      </button>
                    </div>
                  )}
                </div>
                
                <hr className="my-1" />
                
                <button
                  onClick={() => {
                    if (window.confirm('Tem certeza que deseja excluir esta nota?')) {
                      onDelete(note.id);
                    }
                    setShowMenu(false);
                  }}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-left hover:bg-red-50 text-red-600"
                >
                  <Trash2 size={16} />
                  <span>Excluir</span>
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Tags */}
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {note.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center space-x-1 px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs"
              >
                <Tag size={12} />
                <span>{tag}</span>
              </span>
            ))}
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        {note.blocks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText size={48} className="mx-auto mb-2 opacity-50" />
            <p>Esta nota ainda não possui conteúdo</p>
            <button
              onClick={handleEdit}
              className="mt-2 text-primary-600 hover:text-primary-700 text-sm underline"
            >
              Clique para adicionar conteúdo
            </button>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {note.blocks
              .sort((a, b) => a.order - b.order)
              .map(block => renderBlock(block))
            }
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div>
            Criada em {formatDate(note.createdAt)}
          </div>
          <button
            onClick={handleEdit}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Editar nota
          </button>
        </div>
      </div>
    </div>
  );
}; 