import React, { createContext, useContext, useState, useEffect } from 'react';
import localforage from 'localforage';
import { useAuth } from './AuthContext';

export interface TextStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  color?: string;
  backgroundColor?: string;
  fontSize?: number;
  fontFamily?: string;
}

export interface TextBlock {
  id: string;
  content: string;
  style: TextStyle;
  type: 'text' | 'heading' | 'bullet' | 'number';
  order: number;
}

export interface TextNote {
  id: string;
  title: string;
  subject: string;
  blocks: TextBlock[];
  tags: string[];
  category: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
  isFavorite: boolean;
  color: string;
}

interface TextNotesContextType {
  textNotes: TextNote[];
  isLoading: boolean;
  createTextNote: (note: Omit<TextNote, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTextNote: (id: string, updates: Partial<TextNote>) => Promise<void>;
  deleteTextNote: (id: string) => Promise<void>;
  duplicateTextNote: (id: string) => Promise<void>;
  addBlock: (noteId: string, block: Omit<TextBlock, 'id' | 'order'>) => Promise<void>;
  updateBlock: (noteId: string, blockId: string, updates: Partial<TextBlock>) => Promise<void>;
  deleteBlock: (noteId: string, blockId: string) => Promise<void>;
  reorderBlocks: (noteId: string, blockIds: string[]) => Promise<void>;
  searchTextNotes: (query: string) => TextNote[];
  getTextNotesByCategory: (category: string) => TextNote[];
  getTextNotesBySubject: (subject: string) => TextNote[];
  getFavoriteTextNotes: () => TextNote[];
  toggleFavorite: (id: string) => Promise<void>;
  exportNote: (id: string, format: 'txt' | 'html' | 'md') => string;
  importNote: (content: string, format: 'txt' | 'html' | 'md', title: string, subject: string) => Promise<void>;
}

const TextNotesContext = createContext<TextNotesContextType | undefined>(undefined);

export const useTextNotes = () => {
  const context = useContext(TextNotesContext);
  if (!context) {
    throw new Error('useTextNotes deve ser usado dentro de um TextNotesProvider');
  }
  return context;
};

interface TextNotesProviderProps {
  children: React.ReactNode;
}

export const TextNotesProvider: React.FC<TextNotesProviderProps> = ({ children }) => {
  const [textNotes, setTextNotes] = useState<TextNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadTextNotes();
    } else {
      setTextNotes([]);
      setIsLoading(false);
    }
  }, [user]);

  const getStorageKey = () => `textNotes_${user?.id}`;

  const loadTextNotes = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const savedNotes = await localforage.getItem<TextNote[]>(getStorageKey());
      if (savedNotes) {
        const parsedNotes = savedNotes.map(note => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt)
        }));
        setTextNotes(parsedNotes);
      } else {
        // Criar notas de exemplo se não houver notas salvas
        const exampleNotes: TextNote[] = [
          {
            id: 'example_1',
            title: 'Resumo de Física - Mecânica',
            subject: 'Física',
            category: 'Resumo',
            priority: 'high',
            tags: ['mecânica', 'força', 'movimento'],
            color: '#3B82F6',
            isFavorite: true,
            createdAt: new Date(Date.now() - 86400000), // 1 dia atrás
            updatedAt: new Date(Date.now() - 3600000), // 1 hora atrás
            blocks: [
              {
                id: 'example_1_block_1',
                content: 'Leis de Newton',
                style: { bold: true, fontSize: 18 },
                type: 'heading',
                order: 0
              },
              {
                id: 'example_1_block_2',
                content: 'Primeira Lei (Inércia): Um corpo em repouso tende a permanecer em repouso, e um corpo em movimento tende a permanecer em movimento, a menos que uma força externa atue sobre ele.',
                style: {},
                type: 'text',
                order: 1
              },
              {
                id: 'example_1_block_3',
                content: 'Segunda Lei (F = ma): A força resultante sobre um objeto é igual ao produto de sua massa pela aceleração.',
                style: { color: '#EF4444' },
                type: 'text',
                order: 2
              },
              {
                id: 'example_1_block_4',
                content: 'Terceira Lei (Ação e Reação): Para toda ação há uma reação igual e oposta.',
                style: { italic: true },
                type: 'text',
                order: 3
              }
            ]
          },
        ];
        
        setTextNotes(exampleNotes);
        await localforage.setItem(getStorageKey(), exampleNotes);
      }
    } catch (error) {
      console.error('Erro ao carregar notas de texto:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTextNotes = async (newNotes: TextNote[]) => {
    if (!user) return;
    
    try {
      await localforage.setItem(getStorageKey(), newNotes);
      setTextNotes(newNotes);
    } catch (error) {
      console.error('Erro ao salvar notas de texto:', error);
    }
  };

  const createTextNote = async (noteData: Omit<TextNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = Date.now().toString();
    const now = new Date();
    
    const newNote: TextNote = {
      ...noteData,
      id,
      createdAt: now,
      updatedAt: now
    };

    const newNotes = [...textNotes, newNote];
    await saveTextNotes(newNotes);
  };

  const updateTextNote = async (id: string, updates: Partial<TextNote>) => {
    const newNotes = textNotes.map(note =>
      note.id === id 
        ? { ...note, ...updates, updatedAt: new Date() }
        : note
    );
    await saveTextNotes(newNotes);
  };

  const deleteTextNote = async (id: string) => {
    const newNotes = textNotes.filter(note => note.id !== id);
    await saveTextNotes(newNotes);
  };

  const duplicateTextNote = async (id: string) => {
    const noteToClone = textNotes.find(note => note.id === id);
    if (!noteToClone) return;

    const newId = Date.now().toString();
    const now = new Date();

    const duplicatedNote: TextNote = {
      ...noteToClone,
      id: newId,
      title: `${noteToClone.title} (Cópia)`,
      createdAt: now,
      updatedAt: now,
      blocks: noteToClone.blocks.map(block => ({
        ...block,
        id: `${newId}_${block.id}`
      }))
    };

    const newNotes = [...textNotes, duplicatedNote];
    await saveTextNotes(newNotes);
  };

  const addBlock = async (noteId: string, blockData: Omit<TextBlock, 'id' | 'order'>) => {
    const note = textNotes.find(n => n.id === noteId);
    if (!note) return;

    const blockId = `${noteId}_${Date.now()}`;
    const order = note.blocks.length;

    const newBlock: TextBlock = {
      ...blockData,
      id: blockId,
      order
    };

    const updatedBlocks = [...note.blocks, newBlock];
    await updateTextNote(noteId, { blocks: updatedBlocks });
  };

  const updateBlock = async (noteId: string, blockId: string, updates: Partial<TextBlock>) => {
    const note = textNotes.find(n => n.id === noteId);
    if (!note) return;

    const updatedBlocks = note.blocks.map(block =>
      block.id === blockId ? { ...block, ...updates } : block
    );

    await updateTextNote(noteId, { blocks: updatedBlocks });
  };

  const deleteBlock = async (noteId: string, blockId: string) => {
    const note = textNotes.find(n => n.id === noteId);
    if (!note) return;

    const updatedBlocks = note.blocks
      .filter(block => block.id !== blockId)
      .map((block, index) => ({ ...block, order: index }));

    await updateTextNote(noteId, { blocks: updatedBlocks });
  };

  const reorderBlocks = async (noteId: string, blockIds: string[]) => {
    const note = textNotes.find(n => n.id === noteId);
    if (!note) return;

    const updatedBlocks = blockIds
      .map(blockId => note.blocks.find(block => block.id === blockId))
      .filter((block): block is TextBlock => block !== undefined)
      .map((block, index) => ({ ...block, order: index }));

    await updateTextNote(noteId, { blocks: updatedBlocks });
  };

  const searchTextNotes = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return textNotes.filter(note =>
      note.title.toLowerCase().includes(lowercaseQuery) ||
      note.subject.toLowerCase().includes(lowercaseQuery) ||
      note.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
      note.blocks.some(block => block.content.toLowerCase().includes(lowercaseQuery))
    );
  };

  const getTextNotesByCategory = (category: string) => {
    return textNotes.filter(note => 
      note.category.toLowerCase().includes(category.toLowerCase())
    );
  };

  const getTextNotesBySubject = (subject: string) => {
    return textNotes.filter(note => 
      note.subject.toLowerCase().includes(subject.toLowerCase())
    );
  };

  const getFavoriteTextNotes = () => {
    return textNotes.filter(note => note.isFavorite);
  };

  const toggleFavorite = async (id: string) => {
    const note = textNotes.find(n => n.id === id);
    if (!note) return;

    await updateTextNote(id, { isFavorite: !note.isFavorite });
  };

  const exportNote = (id: string, format: 'txt' | 'html' | 'md'): string => {
    const note = textNotes.find(n => n.id === id);
    if (!note) return '';

    switch (format) {
      case 'txt':
        return `${note.title}\n\n${note.blocks.map(block => block.content).join('\n\n')}`;
      
      case 'html':
        const htmlBlocks = note.blocks.map(block => {
          const styles = [];
          if (block.style.bold) styles.push('font-weight: bold');
          if (block.style.italic) styles.push('font-style: italic');
          if (block.style.underline) styles.push('text-decoration: underline');
          if (block.style.color) styles.push(`color: ${block.style.color}`);
          if (block.style.backgroundColor) styles.push(`background-color: ${block.style.backgroundColor}`);
          
          const styleAttr = styles.length > 0 ? ` style="${styles.join('; ')}"` : '';
          const tag = block.type === 'heading' ? 'h2' : 'p';
          
          return `<${tag}${styleAttr}>${block.content}</${tag}>`;
        }).join('\n');
        
        return `<h1>${note.title}</h1>\n${htmlBlocks}`;
      
      case 'md':
        const mdBlocks = note.blocks.map(block => {
          let content = block.content;
          if (block.style.bold) content = `**${content}**`;
          if (block.style.italic) content = `*${content}*`;
          if (block.type === 'heading') content = `## ${content}`;
          return content;
        }).join('\n\n');
        
        return `# ${note.title}\n\n${mdBlocks}`;
      
      default:
        return '';
    }
  };

  const importNote = async (content: string, format: 'txt' | 'html' | 'md', title: string, subject: string) => {
    const blocks: TextBlock[] = [];
    let blockOrder = 0;

    switch (format) {
      case 'txt':
        const txtLines = content.split('\n').filter(line => line.trim());
        txtLines.forEach(line => {
          blocks.push({
            id: `import_${Date.now()}_${blockOrder}`,
            content: line,
            style: {},
            type: 'text',
            order: blockOrder++
          });
        });
        break;
      
      case 'md':
        const mdLines = content.split('\n').filter(line => line.trim());
        mdLines.forEach(line => {
          let content = line;
          let style: TextStyle = {};
          let type: 'text' | 'heading' = 'text';

          if (line.startsWith('##')) {
            content = line.replace(/^##\s*/, '');
            type = 'heading';
          } else if (line.startsWith('#')) {
            content = line.replace(/^#\s*/, '');
            type = 'heading';
          }

          if (content.includes('**')) {
            content = content.replace(/\*\*(.*?)\*\*/g, '$1');
            style.bold = true;
          }

          if (content.includes('*')) {
            content = content.replace(/\*(.*?)\*/g, '$1');
            style.italic = true;
          }

          blocks.push({
            id: `import_${Date.now()}_${blockOrder}`,
            content,
            style,
            type,
            order: blockOrder++
          });
        });
        break;
    }

    const newNote: Omit<TextNote, 'id' | 'createdAt' | 'updatedAt'> = {
      title,
      subject,
      blocks,
      tags: [],
      category: 'Importada',
      priority: 'medium',
      isFavorite: false,
      color: '#3B82F6'
    };

    await createTextNote(newNote);
  };

  return (
    <TextNotesContext.Provider value={{
      textNotes,
      isLoading,
      createTextNote,
      updateTextNote,
      deleteTextNote,
      duplicateTextNote,
      addBlock,
      updateBlock,
      deleteBlock,
      reorderBlocks,
      searchTextNotes,
      getTextNotesByCategory,
      getTextNotesBySubject,
      getFavoriteTextNotes,
      toggleFavorite,
      exportNote,
      importNote
    }}>
      {children}
    </TextNotesContext.Provider>
  );
}; 