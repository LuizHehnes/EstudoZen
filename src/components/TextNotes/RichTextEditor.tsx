import React, { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Type,
  Palette,
  Save,
  X
} from 'lucide-react';
import type { TextStyle, TextBlock } from '../../context/TextNotesContext';

interface RichTextEditorProps {
  block: TextBlock;
  onUpdate: (updates: Partial<TextBlock>) => void;
  onDelete: () => void;
  onSave: () => void;
  autoFocus?: boolean;
}

const colorOptions = [
  '#000000', '#374151', '#6B7280', '#9CA3AF',
  '#EF4444', '#F97316', '#EAB308', '#22C55E',
  '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899'
];

const backgroundColorOptions = [
  'transparent', '#FEF3C7', '#DBEAFE', '#D1FAE5',
  '#FCE7F3', '#E5E7EB', '#FEE2E2', '#FECACA'
];

const fontSizeOptions = [
  { label: 'Pequeno', value: 12 },
  { label: 'Normal', value: 14 },
  { label: 'Médio', value: 16 },
  { label: 'Grande', value: 18 },
  { label: 'Muito Grande', value: 24 }
];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  block,
  onUpdate,
  onDelete,
  onSave,
  autoFocus = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(block.content);
  const [style, setStyle] = useState<TextStyle>(block.style);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [showFontSizePicker, setShowFontSizePicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const bgColorPickerRef = useRef<HTMLDivElement>(null);
  const fontSizePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocus) {
      setIsEditing(true);
    }
  }, [autoFocus]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(content.length, content.length);
    }
  }, [isEditing]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
      if (bgColorPickerRef.current && !bgColorPickerRef.current.contains(event.target as Node)) {
        setShowBgColorPicker(false);
      }
      if (fontSizePickerRef.current && !fontSizePickerRef.current.contains(event.target as Node)) {
        setShowFontSizePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStyleToggle = (styleProperty: keyof TextStyle, value?: any) => {
    const newStyle = {
      ...style,
      [styleProperty]: value !== undefined ? value : !style[styleProperty]
    };
    setStyle(newStyle);
  };

  const handleSave = () => {
    onUpdate({
      content,
      style,
      type: block.type
    });
    setIsEditing(false);
    onSave();
  };

  const handleCancel = () => {
    setContent(block.content);
    setStyle(block.style);
    setIsEditing(false);
  };

  const getTextStyles = () => {
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

  const ToolbarButton: React.FC<{
    icon: React.ComponentType<{ size?: number }>;
    isActive?: boolean;
    onClick: () => void;
    title?: string;
  }> = ({ icon: Icon, isActive, onClick, title }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded transition-colors ${
        isActive
          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800/50'
          : 'hover:bg-light-surface dark:hover:bg-dark-surface text-light-text-muted dark:text-dark-text-muted'
      }`}
    >
      <Icon size={16} />
    </button>
  );

  if (!isEditing) {
    return (
      <div
        onClick={() => setIsEditing(true)}
        className="group relative p-3 rounded-lg border border-transparent hover:border-light-border dark:hover:border-dark-border hover:bg-light-surface dark:hover:bg-dark-surface cursor-text min-h-[40px] transition-all"
      >
        <div style={getTextStyles()} className="text-light-text-primary dark:text-dark-text-primary">
          {content || <span className="text-light-text-muted dark:text-dark-text-muted italic">Clique para editar...</span>}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-error-100 dark:hover:bg-error-900/20 text-error-600 dark:text-error-400 transition-opacity"
          title="Excluir bloco"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="border border-light-border dark:border-dark-border rounded-lg p-3 bg-light-card dark:bg-dark-card shadow-soft dark:shadow-dark-soft">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 mb-3 p-2 bg-light-surface dark:bg-dark-surface rounded-lg">
        <ToolbarButton
          icon={Bold}
          isActive={style.bold}
          onClick={() => handleStyleToggle('bold')}
          title="Negrito"
        />
        <ToolbarButton
          icon={Italic}
          isActive={style.italic}
          onClick={() => handleStyleToggle('italic')}
          title="Itálico"
        />
        <ToolbarButton
          icon={Underline}
          isActive={style.underline}
          onClick={() => handleStyleToggle('underline')}
          title="Sublinhado"
        />
        <ToolbarButton
          icon={Strikethrough}
          isActive={style.strikethrough}
          onClick={() => handleStyleToggle('strikethrough')}
          title="Riscado"
        />

        <div className="w-px bg-light-border dark:bg-dark-border mx-1"></div>

        {/* Cor do texto */}
        <div className="relative" ref={colorPickerRef}>
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="p-2 rounded hover:bg-light-surface dark:hover:bg-dark-surface text-light-text-muted dark:text-dark-text-muted flex items-center gap-1"
            title="Cor do texto"
          >
            <Palette size={16} />
            <div
              className="w-4 h-4 rounded border border-light-border dark:border-dark-border"
              style={{ backgroundColor: style.color || '#000000' }}
            ></div>
          </button>
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg shadow-medium dark:shadow-dark-medium z-10">
              <div className="grid grid-cols-4 gap-1">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      handleStyleToggle('color', color);
                      setShowColorPicker(false);
                    }}
                    className="w-6 h-6 rounded border border-light-border dark:border-dark-border hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  ></button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Cor de fundo */}
        <div className="relative" ref={bgColorPickerRef}>
          <button
            type="button"
            onClick={() => setShowBgColorPicker(!showBgColorPicker)}
            className="p-2 rounded hover:bg-light-surface dark:hover:bg-dark-surface text-light-text-muted dark:text-dark-text-muted flex items-center gap-1"
            title="Cor de fundo"
          >
            <div
              className="w-4 h-4 rounded border border-light-border dark:border-dark-border"
              style={{ backgroundColor: style.backgroundColor || 'transparent' }}
            ></div>
          </button>
          {showBgColorPicker && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg shadow-medium dark:shadow-dark-medium z-10">
              <div className="grid grid-cols-4 gap-1">
                {backgroundColorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      handleStyleToggle('backgroundColor', color);
                      setShowBgColorPicker(false);
                    }}
                    className="w-6 h-6 rounded border border-light-border dark:border-dark-border hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  ></button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tamanho da fonte */}
        <div className="relative" ref={fontSizePickerRef}>
          <button
            type="button"
            onClick={() => setShowFontSizePicker(!showFontSizePicker)}
            className="p-2 rounded hover:bg-light-surface dark:hover:bg-dark-surface text-light-text-muted dark:text-dark-text-muted flex items-center gap-1"
            title="Tamanho da fonte"
          >
            <Type size={16} />
            <span className="text-xs">{style.fontSize || 14}px</span>
          </button>
          {showFontSizePicker && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg shadow-medium dark:shadow-dark-medium z-10 w-32">
              {fontSizeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    handleStyleToggle('fontSize', option.value);
                    setShowFontSizePicker(false);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded hover:bg-light-surface dark:hover:bg-dark-surface text-light-text-primary dark:text-dark-text-primary ${
                    style.fontSize === option.value ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : ''
                  }`}
                >
                  <span style={{ fontSize: `${option.value}px` }}>{option.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1"></div>

        {/* Ações */}
        <button
          type="button"
          onClick={handleCancel}
          className="p-2 rounded hover:bg-error-100 dark:hover:bg-error-900/20 text-error-600 dark:text-error-400"
          title="Cancelar"
        >
          <X size={16} />
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="p-2 rounded bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white"
          title="Salvar"
        >
          <Save size={16} />
        </button>
      </div>

      {/* Editor */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={getTextStyles()}
        className="w-full min-h-[80px] p-2 border border-light-border dark:border-dark-border rounded-lg bg-light-surface dark:bg-dark-surface focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:ring-opacity-50 transition-shadow text-light-text-primary dark:text-dark-text-primary"
        placeholder="Digite seu conteúdo aqui..."
      />
    </div>
  );
}; 