import React, { useState } from 'react';
import { Mic, MicOff, Play, Pause, Search, Plus, Edit, Trash2, Tag, Clock, BookOpen } from 'lucide-react';
import { useVoiceNotes } from '../context/VoiceNotesContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const VoiceNotesPage: React.FC = () => {
  const {
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
    searchVoiceNotes
  } = useVoiceNotes();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [saveFormData, setSaveFormData] = useState({
    title: '',
    subject: '',
    tags: ''
  });

  const filteredNotes = searchQuery 
    ? searchVoiceNotes(searchQuery)
    : voiceNotes;

  const handleStartRecording = async () => {
    await startRecording();
  };

  const handleStopRecording = async () => {
    const blob = await stopRecording();
    if (blob) {
      setRecordedBlob(blob);
      setShowSaveForm(true);
    }
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recordedBlob) return;

    const tags = saveFormData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    await saveVoiceNote(
      recordedBlob,
      saveFormData.title,
      saveFormData.subject,
      tags
    );

    // Reset form
    setSaveFormData({ title: '', subject: '', tags: '' });
    setRecordedBlob(null);
    setShowSaveForm(false);
  };

  const handleDeleteNote = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta nota de voz?')) {
      await deleteVoiceNote(id);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-neutral-800">
            Notas de Voz
          </h1>
          <p className="text-neutral-600 mt-1">
            Grave e organize suas anotações em áudio
          </p>
        </div>
      </div>

      {/* gravador */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            {isRecording ? (
              <div className="p-4 bg-red-100 rounded-full animate-pulse">
                <MicOff size={32} className="text-red-600" />
              </div>
            ) : (
              <div className="p-4 bg-primary-100 rounded-full">
                <Mic size={32} className="text-primary-600" />
              </div>
            )}
          </div>

          <h3 className="text-lg font-semibold text-neutral-800 mb-2">
            {isRecording ? 'Gravando...' : 'Gravador de Voz'}
          </h3>

          <p className="text-sm text-neutral-600 mb-4">
            {isRecording 
              ? 'Clique para parar a gravação'
              : 'Clique para iniciar uma nova gravação'
            }
          </p>

          <button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-primary-600 hover:bg-primary-700 text-white'
            }`}
          >
            {isRecording ? 'Parar Gravação' : 'Iniciar Gravação'}
          </button>
        </div>
      </div>

      {/* formulário de salvamento */}
      {showSaveForm && (
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4">
            Salvar Nota de Voz
          </h3>
          
          <form onSubmit={handleSaveNote} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Título *
              </label>
              <input
                type="text"
                required
                value={saveFormData.title}
                onChange={(e) => setSaveFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ex: Resumo da aula de matemática"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Disciplina *
              </label>
              <input
                type="text"
                required
                value={saveFormData.subject}
                onChange={(e) => setSaveFormData(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ex: Matemática, História, Física..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Tags (separadas por vírgula)
              </label>
              <input
                type="text"
                value={saveFormData.tags}
                onChange={(e) => setSaveFormData(prev => ({ ...prev, tags: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ex: prova, resumo, importante"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowSaveForm(false);
                  setRecordedBlob(null);
                  setSaveFormData({ title: '', subject: '', tags: '' });
                }}
                className="flex-1 py-2 px-4 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                Salvar Nota
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Busca */}
      <div className="relative">
        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          placeholder="Buscar notas de voz..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {/* lista de notas */}
      <div className="space-y-4">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <Mic size={48} className="mx-auto text-neutral-400 mb-4" />
            <h3 className="text-lg font-medium text-neutral-600 mb-2">
              {searchQuery ? 'Nenhuma nota encontrada' : 'Nenhuma nota de voz'}
            </h3>
            <p className="text-neutral-500 mb-4">
              {searchQuery 
                ? 'Tente buscar com outros termos'
                : 'Grave sua primeira nota de voz para começar'
              }
            </p>
            {!searchQuery && (
              <button
                onClick={handleStartRecording}
                className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Mic size={20} />
                <span>Gravar Primeira Nota</span>
              </button>
            )}
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div key={note.id} className="bg-white rounded-xl shadow-soft p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-neutral-800">
                      {note.title}
                    </h3>
                    {currentPlayingId === note.id && isPlaying && (
                      <div className="flex items-center space-x-1 text-primary-600">
                        <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse"></div>
                        <span className="text-xs">Tocando</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-neutral-500 mb-3">
                    <div className="flex items-center space-x-1">
                      <BookOpen size={16} />
                      <span>{note.subject}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Clock size={16} />
                      <span>{formatDuration(note.duration)}</span>
                    </div>
                    
                    <span>{formatDate(note.createdAt)}</span>
                  </div>

                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
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
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => {
                      if (currentPlayingId === note.id && isPlaying) {
                        pauseVoiceNote();
                      } else {
                        playVoiceNote(note.id);
                      }
                    }}
                    className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title={currentPlayingId === note.id && isPlaying ? 'Pausar' : 'Reproduzir'}
                  >
                    {currentPlayingId === note.id && isPlaying ? (
                      <Pause size={20} />
                    ) : (
                      <Play size={20} />
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}; 