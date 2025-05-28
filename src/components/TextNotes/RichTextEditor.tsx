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
      color: style.color || '#000000',
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
          ? 'bg-primary-100 text-primary-600 border border-primary-200'
          : 'hover:bg-gray-100 text-gray-600'
      }`}
    >
      <Icon size={16} />
    </button>
  );

  if (!isEditing) {
    return (
      <div
        onClick={() => setIsEditing(true)}
        className="group relative p-3 rounded-lg border border-transparent hover:border-gray-200 hover:bg-gray-50 cursor-text min-h-[40px] transition-all"
      >
        <div style={getTextStyles()}>
          {content || 'Clique para editar...'}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 text-red-500 transition-opacity"
          title="Excluir bloco"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="border border-gray-300 rounded-lg p-3 bg-white shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 mb-3 p-2 bg-gray-50 rounded-lg">
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

        <div className="w-px bg-gray-300 mx-1"></div>

        {/* Cor do texto */}
        <div className="relative" ref={colorPickerRef}>
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="p-2 rounded hover:bg-gray-100 text-gray-600 flex items-center gap-1"
            title="Cor do texto"
          >
            <Palette size={16} />
            <div
              className="w-4 h-4 rounded border border-gray-300"
              style={{ backgroundColor: style.color || '#000000' }}
            ></div>
          </button>
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-white border rounded-lg shadow-lg z-10">
              <div className="grid grid-cols-4 gap-1">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      handleStyleToggle('color', color);
                      setShowColorPicker(false);
                    }}
                    className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
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
            className="p-2 rounded hover:bg-gray-100 text-gray-600 flex items-center gap-1"
            title="Cor de fundo"
          >
            <div
              className="w-4 h-4 rounded border border-gray-300"
              style={{ backgroundColor: style.backgroundColor || 'transparent' }}
            ></div>
          </button>
          {showBgColorPicker && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-white border rounded-lg shadow-lg z-10">
              <div className="grid grid-cols-4 gap-1">
                {backgroundColorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      handleStyleToggle('backgroundColor', color === 'transparent' ? undefined : color);
                      setShowBgColorPicker(false);
                    }}
                    className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                    style={{ 
                      backgroundColor: color === 'transparent' ? '#ffffff' : color,
                      backgroundImage: color === 'transparent' ? 'repeating-linear-gradient(45deg, transparent, transparent 2px, #ccc 2px, #ccc 4px)' : 'none'
                    }}
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
            className="p-2 rounded hover:bg-gray-100 text-gray-600 flex items-center gap-1"
            title="Tamanho da fonte"
          >
            <Type size={16} />
            <span className="text-xs">{style.fontSize || 14}</span>
          </button>
          {showFontSizePicker && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-white border rounded-lg shadow-lg z-10 min-w-[120px]">
              {fontSizeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    handleStyleToggle('fontSize', option.value);
                    setShowFontSizePicker(false);
                  }}
                  className="block w-full text-left px-2 py-1 rounded hover:bg-gray-100 text-sm"
                  style={{ fontSize: `${option.value}px` }}
                >
                  {option.label} ({option.value}px)
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px bg-gray-300 mx-1"></div>

        {/* Tipo de bloco */}
        <select
          value={block.type}
          onChange={(e) => onUpdate({ type: e.target.value as any })}
          className="px-2 py-1 text-sm border border-gray-300 rounded"
        >
          <option value="text">Texto</option>
          <option value="heading">Título</option>
          <option value="bullet">Lista</option>
          <option value="number">Lista Numerada</option>
        </select>
      </div>

      {/* Editor de texto */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={getTextStyles()}
        placeholder="Digite seu texto aqui..."
        className="w-full min-h-[100px] p-2 border border-gray-200 rounded resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.ctrlKey) {
            handleSave();
          }
          if (e.key === 'Escape') {
            handleCancel();
          }
        }}
      />

      {/* Botões de ação */}
      <div className="flex justify-between items-center mt-3">
        <div className="text-xs text-gray-500">
          Ctrl+Enter para salvar • Esc para cancelar
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors flex items-center gap-1"
          >
            <Save size={14} />
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}; 