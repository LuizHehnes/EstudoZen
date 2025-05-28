import React, { createContext, useContext, useState, useEffect } from 'react';
import localforage from 'localforage';
import { useAuth } from './AuthContext';

export interface VoiceNote {
  id: string;
  title: string;
  subject: string;
  duration: number;
  audioBlob: Blob;
  audioUrl: string;
  createdAt: Date;
  tags: string[];
}

interface VoiceNotesContextType {
  voiceNotes: VoiceNote[];
  isRecording: boolean;
  isPlaying: boolean;
  currentPlayingId: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  saveVoiceNote: (audioBlob: Blob, title: string, subject: string, tags: string[]) => Promise<void>;
  playVoiceNote: (id: string) => void;
  pauseVoiceNote: () => void;
  deleteVoiceNote: (id: string) => Promise<void>;
  updateVoiceNote: (id: string, updates: Partial<Pick<VoiceNote, 'title' | 'subject' | 'tags'>>) => Promise<void>;
  searchVoiceNotes: (query: string) => VoiceNote[];
  getVoiceNotesBySubject: (subject: string) => VoiceNote[];
}

const VoiceNotesContext = createContext<VoiceNotesContextType | undefined>(undefined);

export const useVoiceNotes = () => {
  const context = useContext(VoiceNotesContext);
  if (!context) {
    throw new Error('useVoiceNotes deve ser usado dentro de um VoiceNotesProvider');
  }
  return context;
};

interface VoiceNotesProviderProps {
  children: React.ReactNode;
}

export const VoiceNotesProvider: React.FC<VoiceNotesProviderProps> = ({ children }) => {
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadVoiceNotes();
    } else {
      setVoiceNotes([]);
    }
  }, [user]);

  const getStorageKey = () => `voiceNotes_${user?.id}`;
  const getAudioKey = (noteId: string) => `audio_${user?.id}_${noteId}`;

  const loadVoiceNotes = async () => {
    if (!user) return;
    
    try {
      const savedNotes = await localforage.getItem<VoiceNote[]>(getStorageKey());
      if (savedNotes) {
        const parsedNotes = await Promise.all(
          savedNotes.map(async (note) => {
            const audioBlob = await localforage.getItem<Blob>(getAudioKey(note.id));
            return {
              ...note,
              createdAt: new Date(note.createdAt),
              audioBlob: audioBlob || new Blob(),
              audioUrl: audioBlob ? URL.createObjectURL(audioBlob) : ''
            };
          })
        );
        setVoiceNotes(parsedNotes);
      }
    } catch (error) {
      console.error('Erro ao carregar notas de voz:', error);
    }
  };

  const saveVoiceNotes = async (newNotes: VoiceNote[]) => {
    if (!user) return;
    
    try {
      // salvar metadados das notas (sem o blob)
      const notesMetadata = newNotes.map(({ audioBlob, audioUrl, ...note }) => note);
      await localforage.setItem(getStorageKey(), notesMetadata);
      
      // salvar blobs separadamente
      await Promise.all(
        newNotes.map(note => 
          localforage.setItem(getAudioKey(note.id), note.audioBlob)
        )
      );
      
      setVoiceNotes(newNotes);
    } catch (error) {
      console.error('Erro ao salvar notas de voz:', error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      setMediaRecorder(recorder);
      setIsRecording(true);
      
      recorder.start();
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      alert('Erro ao acessar o microfone. Verifique as permissões.');
    }
  };

  const stopRecording = (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorder) {
        resolve(null);
        return;
      }

      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        setIsRecording(false);
        setMediaRecorder(null);
        resolve(audioBlob);
      };

      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    });
  };

  const saveVoiceNote = async (audioBlob: Blob, title: string, subject: string, tags: string[]) => {
    const id = Date.now().toString();
    const audioUrl = URL.createObjectURL(audioBlob);
    
    // calcular duração aproximada ( segundos)
    const duration = Math.round(audioBlob.size / 16000);
    
    const newNote: VoiceNote = {
      id,
      title,
      subject,
      duration,
      audioBlob,
      audioUrl,
      createdAt: new Date(),
      tags
    };

    const newNotes = [...voiceNotes, newNote];
    await saveVoiceNotes(newNotes);
  };

  const playVoiceNote = (id: string) => {
    const note = voiceNotes.find(n => n.id === id);
    if (!note) {
      console.warn('Nota de voz não encontrada:', id);
      return;
    }

    // verifica se a url do áudio
    if (!note.audioUrl) {
      console.warn('URL do áudio não disponível para a nota:', id);
      return;
    }

    // parar áudio atual se estiver tocando
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    try {
      // usar Audio() ao invés de new HTMLAudioElement()
      const audio = new Audio();
      audio.src = note.audioUrl;
      
      audio.onplay = () => {
        setIsPlaying(true);
        setCurrentPlayingId(id);
      };
      
      audio.onpause = () => {
        setIsPlaying(false);
        setCurrentPlayingId(null);
      };
      
      audio.onended = () => {
        setIsPlaying(false);
        setCurrentPlayingId(null);
      };

      audio.onerror = (error) => {
        console.error('Erro ao reproduzir nota de voz:', error);
        setIsPlaying(false);
        setCurrentPlayingId(null);
        alert('Erro ao reproduzir a nota de voz. O arquivo pode estar corrompido.');
      };

      setCurrentAudio(audio);
      
      // tentar reproduzir o áudio
      audio.play().catch((error) => {
        console.error('Erro ao iniciar reprodução:', error);
        setIsPlaying(false);
        setCurrentPlayingId(null);
        alert('Não foi possível reproduzir a nota de voz.');
      });
    } catch (error) {
      console.error('Erro ao criar elemento de áudio:', error);
      alert('Erro ao inicializar o reprodutor de áudio.');
    }
  };

  const pauseVoiceNote = () => {
    try {
      if (currentAudio) {
        currentAudio.pause();
        setIsPlaying(false);
        setCurrentPlayingId(null);
      }
    } catch (error) {
      console.error('Erro ao pausar nota de voz:', error);
      setIsPlaying(false);
      setCurrentPlayingId(null);
    }
  };

  const deleteVoiceNote = async (id: string) => {
    if (!user) return;
    
    try {
      if (currentPlayingId === id && currentAudio) {
        try {
          currentAudio.pause();
          currentAudio.currentTime = 0;
        } catch (audioError) {
          console.warn('Erro ao parar áudio durante exclusão:', audioError);
        }
        setIsPlaying(false);
        setCurrentPlayingId(null);
        setCurrentAudio(null);
      }

      // remover o blob do storage
      await localforage.removeItem(getAudioKey(id));
      
      // remover da lista
      const newNotes = voiceNotes.filter(note => note.id !== id);
      await saveVoiceNotes(newNotes);
      
    } catch (error) {
      console.error('Erro ao deletar nota de voz:', error);
      alert('Erro ao excluir a nota de voz.');
    }
  };

  const updateVoiceNote = async (id: string, updates: Partial<Pick<VoiceNote, 'title' | 'subject' | 'tags'>>) => {
    const newNotes = voiceNotes.map(note =>
      note.id === id ? { ...note, ...updates } : note
    );
    await saveVoiceNotes(newNotes);
  };

  const searchVoiceNotes = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return voiceNotes.filter(note =>
      note.title.toLowerCase().includes(lowercaseQuery) ||
      note.subject.toLowerCase().includes(lowercaseQuery) ||
      note.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  };

  const getVoiceNotesBySubject = (subject: string) => {
    return voiceNotes.filter(note => 
      note.subject.toLowerCase().includes(subject.toLowerCase())
    );
  };

  return (
    <VoiceNotesContext.Provider value={{
      voiceNotes,
      isRecording,
      isPlaying,
      currentPlayingId,
      startRecording,
      stopRecording,
      saveVoiceNote,
      playVoiceNote,
      pauseVoiceNote,
      deleteVoiceNote,
      updateVoiceNote,
      searchVoiceNotes,
      getVoiceNotesBySubject
    }}>
      {children}
    </VoiceNotesContext.Provider>
  );
}; 