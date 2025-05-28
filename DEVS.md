# 📚 Documentação Técnica para Desenvolvedores - EstudoZen

Este documento fornece detalhes técnicos sobre a estrutura, padrões e tecnologias utilizadas no projeto EstudoZen, para auxiliar desenvolvedores que estejam trabalhando no código.

## 📁 Estrutura de Pastas

### `/src`
Diretório principal contendo todo o código-fonte da aplicação.

### `/src/components`
Componentes reutilizáveis organizados por funcionalidade:

- **`/Audio`**: 
  - Componentes relacionados à reprodução de sons ambiente
  - Utiliza a Web Audio API para manipulação de áudio
  - Principais arquivos: `AudioPlayer.tsx`, `SoundLibrary.tsx`

- **`/Focus`**: 
  - Implementação do modo foco para minimizar distrações
  - Integra com a Notification API para bloquear alertas
  - Principais arquivos: `FocusMode.tsx`, `FocusSettings.tsx`

- **`/Navigation`**: 
  - Componentes de navegação (barra superior, menu inferior)
  - Implementa layout responsivo para desktop e mobile
  - Principais arquivos: `BottomNav.tsx`, `Sidebar.tsx`, `Header.tsx`

- **`/Stats`**: 
  - Visualizações de dados e estatísticas de uso
  - Gráficos e indicadores de produtividade
  - Principais arquivos: `StudyStats.tsx`, `ProgressChart.tsx`

- **`/Timer`**: 
  - Implementações de Pomodoro e cronômetro
  - Gerencia ciclos de tempo e notificações
  - Principais arquivos: `PomodoroTimer.tsx`, `Countdown.tsx`

### `/src/context`
Gerenciadores de estado global usando Context API:

- **`ScheduleContext.tsx`**: Gerencia agendamentos
- **`ContactContext.tsx`**: Gerencia contatos
- **`VoiceNoteContext.tsx`**: Gerencia notas de voz
- **`ThemeContext.tsx`**: Gerencia preferências de tema
- **`SettingsContext.tsx`**: Configurações gerais da aplicação

### `/src/pages`
Páginas principais da aplicação:

- **`/Home`**: Página inicial com visão geral
- **`/Study`**: Página de ferramentas de estudo (Pomodoro, sons)
- **`/Schedule`**: Gerenciamento de agendamentos
- **`/Contacts`**: Lista e cadastro de contatos
- **`/VoiceNotes`**: Gravação e gestão de notas de voz
- **`/Dashboard`**: Painel de estatísticas e insights

### `/src/services`
Serviços e utilidades:

- **`/storage`**: Abstração para LocalForage e IndexedDB
- **`/notifications`**: Gerenciamento de notificações
- **`/audio`**: Serviços de gravação e reprodução de áudio
- **`/utils`**: Funções utilitárias gerais

## 🔄 Padrões de Importação

### Importações Absolutas
O projeto utiliza path mapping para importações mais limpas:

```tsx
// Em vez de:
import Button from '../../../components/Button';

// Usamos:
import Button from '@components/Button';
```

Os aliases configurados incluem:
- `@components/*` → `src/components/*`
- `@context/*` → `src/context/*`
- `@pages/*` → `src/pages/*`
- `@services/*` → `src/services/*`
- `@utils/*` → `src/utils/*`

### Importações de Estilo
Os estilos Tailwind são importados globalmente em `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 🧩 Componentes e Hooks Personalizados

### Componentes Compostos
Alguns componentes utilizam o padrão de composição para maior flexibilidade:

```tsx
// Exemplo de uso:
<Card>
  <Card.Header>Título</Card.Header>
  <Card.Body>Conteúdo</Card.Body>
  <Card.Footer>Rodapé</Card.Footer>
</Card>
```

### Hooks Personalizados
Hooks reutilizáveis para lógicas específicas:

- **`useLocalStorage<T>`**: Abstração para persistir dados no localStorage
- **`useIndexedDB<T>`**: Gerencia operações em IndexedDB com tipagem
- **`usePomodoro`**: Lógica do timer Pomodoro
- **`useMediaRecorder`**: Abstrai a API de gravação de áudio
- **`useNotification`**: Gerencia permissões e exibição de notificações

Exemplo de implementação:

```tsx
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}
```

## 🔄 Fluxo de Dados

### Gerenciamento de Estado Global
O fluxo de dados segue um padrão unidirecional:

1. **Estado**: Mantido em Context Providers
2. **Ações**: Despachadas via funções do contexto
3. **Reducers**: Processam as ações e atualizam o estado
4. **Componentes**: Consomem o estado atualizado

Exemplo com um contexto de agendamentos:

```tsx
// ScheduleContext.tsx
export const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export function ScheduleProvider({ children }: { children: React.ReactNode }) {
  const [schedules, dispatch] = useReducer(scheduleReducer, []);
  
  // Carrega os dados do storage ao iniciar
  useEffect(() => {
    const loadSchedules = async () => {
      const stored = await localforage.getItem<ScheduleItem[]>('schedules');
      if (stored) {
        dispatch({ type: 'LOAD', payload: stored });
      }
    };
    
    loadSchedules();
  }, []);
  
  // Persiste os dados quando mudam
  useEffect(() => {
    localforage.setItem('schedules', schedules);
  }, [schedules]);
  
  const addSchedule = (schedule: Omit<ScheduleItem, 'id' | 'createdAt'>) => {
    dispatch({
      type: 'ADD',
      payload: {
        ...schedule,
        id: generateId(),
        createdAt: new Date()
      }
    });
  };
  
  // Outras funções de manipulação...
  
  return (
    <ScheduleContext.Provider value={{ 
      schedules, 
      addSchedule,
      // Outras funções...
    }}>
      {children}
    </ScheduleContext.Provider>
  );
}
```

## 🔐 Armazenamento de Dados

### LocalForage
Usado para persistência de dados estruturados:

```tsx
// Configuração do LocalForage
localforage.config({
  name: 'estudozen',
  storeName: 'estudozen_data'
});

// Exemplo de uso
async function saveContact(contact: Contact) {
  try {
    // Obtém a lista atual
    const contacts = await localforage.getItem<Contact[]>('contacts') || [];
    
    // Adiciona o novo contato
    const updatedContacts = [...contacts, contact];
    
    // Salva a lista atualizada
    await localforage.setItem('contacts', updatedContacts);
    
    return true;
  } catch (error) {
    console.error('Erro ao salvar contato:', error);
    return false;
  }
}
```

### IndexedDB para Áudio
Utilizado para armazenar arquivos de áudio das notas de voz:

```tsx
// Exemplo simplificado de salvamento de áudio
async function saveVoiceNote(title: string, audioBlob: Blob) {
  const db = await openDB('voiceNotes', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('notes')) {
        db.createObjectStore('notes', { keyPath: 'id' });
      }
    }
  });
  
  const note: VoiceNote = {
    id: generateId(),
    title,
    audioBlob,
    duration: 0, // Calculado em outro lugar
    createdAt: new Date(),
    tags: []
  };
  
  await db.put('notes', note);
}
```

## 🌐 APIs do Navegador

### MediaRecorder
Para gravação de notas de voz:

```tsx
async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks: BlobPart[] = [];
    
    recorder.ondataavailable = (e) => {
      chunks.push(e.data);
    };
    
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      saveAudioBlob(blob);
      
      // Libera os recursos
      stream.getTracks().forEach(track => track.stop());
    };
    
    recorder.start();
    setRecorder(recorder);
  } catch (error) {
    console.error('Erro ao iniciar gravação:', error);
  }
}
```

### Web Audio API
Para reprodução de sons ambiente:

```tsx
function playAmbientSound(soundName: string) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  fetch(`/sounds/${soundName}.mp3`)
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
    .then(audioBuffer => {
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.loop = true;
      source.connect(audioContext.destination);
      source.start(0);
      
      // Guarda a referência para poder parar depois
      setAudioSource(source);
    })
    .catch(error => {
      console.error('Erro ao reproduzir som:', error);
    });
}
```

### Notification API
Para alertas e lembretes:

```tsx
async function scheduleNotification(title: string, body: string, delay: number) {
  // Verifica permissão
  if (Notification.permission !== 'granted') {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;
  }
  
  // Agenda notificação
  setTimeout(() => {
    new Notification(title, {
      body,
      icon: '/logo.png'
    });
  }, delay);
}
```

## 🧪 Testes

O projeto utiliza Jest e React Testing Library para testes:

- **Testes de Componentes**: Em arquivos `*.test.tsx` ao lado dos componentes
- **Testes de Hooks**: Em arquivos `*.test.ts` na pasta `/__tests__/hooks`
- **Testes de Integração**: Na pasta `/__tests__/integration`

Exemplo de teste de componente:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import PomodoroTimer from './PomodoroTimer';

describe('PomodoroTimer', () => {
  test('renderiza o timer com 25:00 inicialmente', () => {
    render(<PomodoroTimer />);
    expect(screen.getByText('25:00')).toBeInTheDocument();
  });
  
  test('inicia o timer quando o botão de iniciar é clicado', () => {
    render(<PomodoroTimer />);
    fireEvent.click(screen.getByText('Iniciar'));
    // Verifica se o estado mudou
    expect(screen.getByText('Pausar')).toBeInTheDocument();
  });
});
```

## 📦 Dependências Principais

- **React 19**: Biblioteca principal de UI
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Framework de estilização
- **React Router**: Navegação
- **LocalForage**: Abstração de armazenamento local
- **Lucide React**: Ícones
- **idb**: Wrapper para IndexedDB
- **date-fns**: Manipulação de datas

## 🚀 Scripts de Desenvolvimento

- **`npm run dev`**: Inicia o servidor de desenvolvimento
- **`npm run build`**: Compila o projeto para produção
- **`npm run preview`**: Visualiza a build de produção localmente
- **`npm run lint`**: Executa verificação de código
- **`npm run lint:fix`**: Corrige problemas de linting automaticamente
- **`npm run format`**: Formata o código seguindo o estilo definido
- **`npm run test`**: Executa os testes
- **`npm run test:watch`**: Executa os testes em modo de observação

## 🛠️ Configuração do Ambiente de Desenvolvimento

### Dependências Globais
- Node.js v18+
- npm v9+

### Extensões Recomendadas para VS Code
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript React code snippets

### Configuração do Editor
Arquivo `.vscode/settings.json` para configuração consistente entre desenvolvedores:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  }
}
```

## 🏗️ Arquitetura e Padrões de Projeto

### Padrão Flux
O EstudoZen utiliza um fluxo de dados unidirecional inspirado no padrão Flux:

1. **Views** (Componentes React) - Enviam ações
2. **Actions** (Funções nos contextos) - Descrevem mudanças
3. **Reducers** (useReducer) - Aplicam as mudanças
4. **Store** (Context) - Mantém e disponibiliza o estado

### Componentes Atômicos
Os componentes seguem uma organização inspirada no Design Atômico:

1. **Átomos**: Botões, inputs, ícones
2. **Moléculas**: Cards, formulários simples
3. **Organismos**: Seções complexas, como o timer com controles
4. **Templates**: Layouts reutilizáveis para páginas
5. **Páginas**: Combinação de organismos para formar telas completas

### Custom Hooks como Serviços
Os hooks personalizados funcionam como "serviços" que encapsulam lógicas complexas:

```tsx
// Exemplo: Hook que encapsula toda a lógica do sistema de agendamentos
function useSchedules() {
  // Estado local
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Acesso ao contexto global
  const { schedules, addSchedule, removeSchedule, updateSchedule } = useContext(ScheduleContext);

  // Lógica derivada
  const upcomingSchedules = useMemo(() => {
    return schedules
      .filter(s => new Date(s.date) > new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [schedules]);

  const overdueSchedules = useMemo(() => {
    return schedules
      .filter(s => new Date(s.date) < new Date() && !s.isCompleted)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [schedules]);

  // Funções avançadas
  const scheduleWithReminder = useCallback((schedule, minutesBefore) => {
    const result = addSchedule({
      ...schedule,
      alertMinutes: minutesBefore
    });
    
    // Configura notificação
    const alertTime = new Date(schedule.date);
    alertTime.setMinutes(alertTime.getMinutes() - minutesBefore);
    const delay = alertTime.getTime() - Date.now();
    
    if (delay > 0) {
      scheduleNotification(
        `Lembrete: ${schedule.title}`,
        schedule.description || 'Seu compromisso está chegando',
        delay
      );
    }
    
    return result;
  }, [addSchedule]);

  return {
    loading,
    error,
    schedules,
    upcomingSchedules,
    overdueSchedules,
    addSchedule,
    scheduleWithReminder,
    removeSchedule,
    updateSchedule
  };
}
```

## 🛡️ Segurança e Privacidade

### Armazenamento Local
O EstudoZen prioriza a privacidade do usuário:

- Todos os dados permanecem no dispositivo do usuário
- Nenhuma informação é enviada para servidores externos
- Dados sensíveis são criptografados antes do armazenamento

### Implementação de Criptografia
Para dados mais sensíveis, utilizamos a Web Crypto API:

```tsx
// Serviço de criptografia para dados sensíveis
const cryptoService = {
  // Gera uma chave de criptografia específica para o usuário
  async generateKey() {
    const key = await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256
      },
      true,
      ['encrypt', 'decrypt']
    );
    
    // Exporta a chave para armazenamento seguro
    const exportedKey = await window.crypto.subtle.exportKey('jwk', key);
    localStorage.setItem('crypto_key', JSON.stringify(exportedKey));
    
    return key;
  },
  
  // Obtém a chave armazenada ou gera uma nova
  async getKey() {
    const storedKey = localStorage.getItem('crypto_key');
    
    if (storedKey) {
      const keyData = JSON.parse(storedKey);
      return window.crypto.subtle.importKey(
        'jwk',
        keyData,
        {
          name: 'AES-GCM',
          length: 256
        },
        false,
        ['encrypt', 'decrypt']
      );
    }
    
    return this.generateKey();
  },
  
  // Criptografa dados
  async encrypt(data: string) {
    const key = await this.getKey();
    const encodedData = new TextEncoder().encode(data);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      encodedData
    );
    
    // Combina o IV e os dados criptografados para armazenamento
    const result = {
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encryptedData))
    };
    
    return JSON.stringify(result);
  },
  
  // Descriptografa dados
  async decrypt(encryptedData: string) {
    const key = await this.getKey();
    const { iv, data } = JSON.parse(encryptedData);
    
    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: new Uint8Array(iv)
      },
      key,
      new Uint8Array(data)
    );
    
    return new TextDecoder().decode(decryptedData);
  }
};
```

### Isolamento de Permissões
O aplicativo solicita apenas as permissões estritamente necessárias:

- **Microfone**: Apenas quando o usuário ativa a gravação de notas de voz
- **Notificações**: Para lembretes e alertas de agendamentos
- **Armazenamento**: Para persistência de dados no dispositivo

## 🚀 Otimização de Performance

### Code Splitting
Utilizamos React.lazy e Suspense para carregar componentes sob demanda:

```tsx
// Exemplo de code splitting por rota
const Home = lazy(() => import('./pages/Home'));
const Study = lazy(() => import('./pages/Study'));
const Schedule = lazy(() => import('./pages/Schedule'));
const Contacts = lazy(() => import('./pages/Contacts'));
const VoiceNotes = lazy(() => import('./pages/VoiceNotes'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/study" element={<Study />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/voice-notes" element={<VoiceNotes />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
```

### Memoização
Evitamos re-renderizações desnecessárias com React.memo, useMemo e useCallback:

```tsx
// Componente memoizado
const ScheduleItem = React.memo(({ schedule, onComplete, onDelete }) => {
  // Renderização otimizada
  return (
    <div className="schedule-item">
      <h3>{schedule.title}</h3>
      <p>{schedule.description}</p>
      <div className="actions">
        <button onClick={() => onComplete(schedule.id)}>Concluir</button>
        <button onClick={() => onDelete(schedule.id)}>Excluir</button>
      </div>
    </div>
  );
});

// No componente pai
function ScheduleList({ schedules }) {
  // Callbacks memoizados para evitar recriação
  const handleComplete = useCallback((id) => {
    // Lógica para marcar como concluído
  }, []);
  
  const handleDelete = useCallback((id) => {
    // Lógica para deletar
  }, []);
  
  return (
    <div>
      {schedules.map(schedule => (
        <ScheduleItem 
          key={schedule.id}
          schedule={schedule}
          onComplete={handleComplete}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
```

### Virtual List
Para listas longas, utilizamos técnicas de virtualização:

```tsx
import { FixedSizeList } from 'react-window';

function VirtualizedContactList({ contacts }) {
  const Row = ({ index, style }) => (
    <div style={style} className="contact-item">
      <h3>{contacts[index].name}</h3>
      <p>{contacts[index].email}</p>
    </div>
  );
  
  return (
    <FixedSizeList
      height={500}
      width="100%"
      itemCount={contacts.length}
      itemSize={80}
    >
      {Row}
    </FixedSizeList>
  );
}
```

### Web Workers
Para operações intensivas, utilizamos Web Workers:

```tsx
// Exemplo: Worker para processamento de áudio
// audioWorker.ts
self.onmessage = function(e) {
  const { audioData, operation } = e.data;
  
  if (operation === 'normalize') {
    // Processa o áudio para normalizar o volume
    const processedData = normalizeAudio(audioData);
    self.postMessage({ result: processedData });
  }
};

function normalizeAudio(audioData) {
  // Algoritmo de processamento de áudio
  // ...
  return processedData;
}

// No componente:
function AudioProcessor() {
  const [worker, setWorker] = useState(null);
  
  useEffect(() => {
    const audioWorker = new Worker('./audioWorker.ts');
    setWorker(audioWorker);
    
    return () => {
      audioWorker.terminate();
    };
  }, []);
  
  const processAudio = (audioData) => {
    return new Promise((resolve) => {
      worker.onmessage = (e) => {
        resolve(e.data.result);
      };
      
      worker.postMessage({
        audioData,
        operation: 'normalize'
      });
    });
  };
  
  // Resto do componente
}
```

## ♿ Acessibilidade

O EstudoZen implementa práticas de acessibilidade (a11y) em toda a aplicação:

### Contraste e Tema
- Sistema de cores com contraste adequado (WCAG AA)
- Modo escuro implementado via classes Tailwind
- Suporte a preferências de contraste do sistema

### Navegação por Teclado
- Todos os elementos interativos são acessíveis via teclado
- Ordem de tabulação lógica e consistente
- Indicadores visuais de foco proeminentes

```tsx
// Exemplo: Componente de botão acessível
function AccessibleButton({ onClick, children, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="focus:ring-2 focus:ring-blue-500 focus:outline-none"
      aria-disabled={disabled}
    >
      {children}
    </button>
  );
}
```

### ARIA e Semântica
- Uso apropriado de landmarks e roles ARIA
- Labels adequados para elementos de formulário
- Mensagens de erro acessíveis para leitores de tela

```tsx
// Exemplo: Campo de formulário acessível
function FormField({ id, label, error, ...inputProps }) {
  return (
    <div>
      <label htmlFor={id} className="block mb-2">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${id}-error` : undefined}
        className={error ? 'border-red-500' : 'border-gray-300'}
        {...inputProps}
      />
      {error && (
        <p id={`${id}-error`} className="text-red-500 mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
```

## 🌐 Internacionalização (i18n)

O EstudoZen foi projetado pensando em futuras localizações:

### Estrutura i18n
Utilizamos a biblioteca i18next para suporte multilíngue:

```tsx
// i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Recursos de tradução
const resources = {
  'pt-BR': {
    translation: {
      // Português do Brasil
      'app.title': 'EstudoZen',
      'pomodoro.start': 'Iniciar',
      'pomodoro.pause': 'Pausar',
      'pomodoro.reset': 'Reiniciar',
      // ...
    }
  },
  'en': {
    translation: {
      // Inglês
      'app.title': 'StudyZen',
      'pomodoro.start': 'Start',
      'pomodoro.pause': 'Pause',
      'pomodoro.reset': 'Reset',
      // ...
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'pt-BR', // Idioma padrão
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
```

### Uso nos Componentes
Os textos são acessados via hook useTranslation:

```tsx
import { useTranslation } from 'react-i18next';

function PomodoroTimer() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h2>{t('pomodoro.title')}</h2>
      <div className="controls">
        <button>{t('pomodoro.start')}</button>
        <button>{t('pomodoro.pause')}</button>
        <button>{t('pomodoro.reset')}</button>
      </div>
    </div>
  );
}
```

## 📱 PWA (Progressive Web App)

O EstudoZen implementa recursos de PWA para experiência nativa:

### Service Worker
Configurado para cache e funcionamento offline:

```tsx
// service-worker.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('estudozen-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/static/js/main.chunk.js',
        '/static/js/0.chunk.js',
        '/static/js/bundle.js',
        '/static/css/main.chunk.css',
        '/manifest.json',
        '/logo192.png',
        '/logo512.png',
        '/favicon.ico',
        '/sounds/rain.mp3',
        '/sounds/forest.mp3',
        '/sounds/cafe.mp3',
        '/sounds/ocean.mp3',
        '/sounds/fireplace.mp3',
        '/sounds/library.mp3'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

### Manifest
Configuração para instalação como aplicativo:

```json
{
  "short_name": "EstudoZen",
  "name": "EstudoZen - Plataforma de Estudos",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64",
      "type": "image/x-icon"
    },
    {
      "src": "logo192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "logo512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#3B82F6",
  "background_color": "#ffffff",
  "orientation": "portrait"
}
```

## 🔄 CI/CD e Deploy

### GitHub Actions
Pipeline de integração contínua:

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Lint
        run: npm run lint
      - name: Test
        run: npm test
      - name: Build
        run: npm run build
      - name: Deploy to GitHub Pages
        if: github.ref == 'refs/heads/main'
        uses: JamesIves/github-pages-deploy-action@4.1.4
        with:
          branch: gh-pages
          folder: build
```

## 📈 Roadmap de Desenvolvimento

### Funcionalidades Planejadas

#### Curto Prazo (próximas versões)
- **Sincronização em Nuvem**: Backup opcional de dados
- **Estatísticas Avançadas**: Análise de tendências de estudo
- **Integração com Calendário**: Importação/exportação de agendamentos

#### Médio Prazo
- **Modo Colaborativo**: Compartilhamento de notas e agendamentos
- **IA para Sugestões**: Recomendações personalizadas de estudo
- **Transcrição de Áudio**: Conversão de notas de voz para texto

#### Longo Prazo
- **Aplicativos Nativos**: Versões para Android e iOS
- **API para Extensões**: Ecossistema de plugins
- **Gamificação**: Sistema de recompensas e progresso
