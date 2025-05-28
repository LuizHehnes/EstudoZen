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
  - Principais arquivos: `AmbientSounds.tsx`, `SoundList.tsx`, `SoundItem.tsx`, `StopAllAudioButton.tsx`, `PersistentAudioControl.tsx`
  - Suporte a múltiplos sons ambientes simultaneamente com controle de volume individual
  - Sistema de favoritos para sons ambiente mais utilizados

- **`/Focus`**: 
  - Implementação do modo foco para minimizar distrações
  - Integra com a Notification API para bloquear alertas
  - Sistema de tela cheia imersivo com botão de escape
  - Bloqueador visual de notificações com feedback visual
  - Principais arquivos: `NotificationBlocker.tsx`, `FocusMode.tsx`, `FocusSettings.tsx`

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
- **`NotificationContext.tsx`**: Controla permissões e bloqueio de notificações
- **`StudyModeContext.tsx`**: Gerencia o modo de estudo imersivo
- **`TextNotesContext.tsx`**: Gerencia notas de texto e marcações
- **`StudySessionContext.tsx`**: Controla sessões de estudo e estatísticas
- **`AudioContext.tsx`**: Gerencia a reprodução de sons ambientes e configurações de áudio

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

### Fullscreen API
Para o modo de estudo imersivo:

```tsx
// Entrar em modo de tela cheia
function enterFullscreen() {
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen();
  } else if (document.documentElement.mozRequestFullScreen) { // Firefox
    document.documentElement.mozRequestFullScreen();
  } else if (document.documentElement.webkitRequestFullscreen) { // Chrome, Safari e Opera
    document.documentElement.webkitRequestFullscreen();
  } else if (document.documentElement.msRequestFullscreen) { // IE/Edge
    document.documentElement.msRequestFullscreen();
  }
}

// Sair do modo de tela cheia
function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) { // Firefox
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) { // Chrome, Safari e Opera
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) { // IE/Edge
    document.msExitFullscreen();
  }
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
- **TypeScript 5.8**: Tipagem estática
- **Tailwind CSS 3.4**: Framework de estilização
- **React Router 7**: Navegação
- **LocalForage**: Abstração de armazenamento local
- **Lucide React**: Ícones
- **Chart.js e react-chartjs-2**: Visualização de dados e estatísticas
- **date-fns v4**: Manipulação de datas

## 🚀 Scripts de Desenvolvimento

- **`npm run dev`**: Inicia o servidor de desenvolvimento
- **`npm run build`**: Compila o projeto para produção
- **`npm run preview`**: Visualiza a build de produção localmente
- **`npm run lint`**: Executa verificação de código
- **`npm run lint:fix`**: Corrige problemas de linting automaticamente
- **`npm run format`**: Formata o código seguindo o estilo definido
- **`npm run format:check`**: Verifica se o código está formatado corretamente
- **`npm run deploy`**: Implanta o projeto na Vercel

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
    "source.fixAll.eslint": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  }
}
```

### Configuração do ESLint
Arquivo `eslint.config.js` com regras modernas para React 19:

```js
import { FlatCompat } from '@eslint/eslintrc';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactRefresh from 'eslint-plugin-react-refresh';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

const compat = new FlatCompat();

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...compat.extends('plugin:prettier/recommended'),
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    plugins: {
      'react-refresh': reactRefresh,
      'react-hooks': reactHooks
    },
    rules: {
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true }
      ],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn'
    }
  }
];
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

## 🎵 Sistema de Áudio Ambiente

O EstudoZen implementa um sistema avançado de sons ambiente para melhorar a concentração:

### Componentes Principais

```tsx
// AmbientSounds.tsx - Componente principal de gerenciamento de sons
export const AmbientSounds: React.FC<AmbientSoundsProps> = ({ className = '' }) => {
  const { activeSounds, allSounds, toggleSound, setVolume, favorites, toggleFavorite } = useAudio();
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');
  
  const soundsToDisplay = activeTab === 'all' ? allSounds : allSounds.filter(sound => favorites.includes(sound.id));
  
  return (
    <div className={`bg-light-card dark:bg-dark-card rounded-xl shadow-soft dark:shadow-dark-soft p-6 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary">
          Sons Ambiente
        </h3>
        
        <StopAllAudioButton />
      </div>
      
      <div className="mb-4">
        <div className="flex bg-light-background-secondary dark:bg-dark-background-secondary rounded-lg p-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-primary text-white'
                : 'text-light-text-muted dark:text-dark-text-muted hover:bg-light-background-tertiary dark:hover:bg-dark-background-tertiary'
            }`}
          >
            Todos os Sons
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'favorites'
                ? 'bg-primary text-white'
                : 'text-light-text-muted dark:text-dark-text-muted hover:bg-light-background-tertiary dark:hover:bg-dark-background-tertiary'
            }`}
          >
            Favoritos
          </button>
        </div>
      </div>

      {soundsToDisplay.length === 0 && activeTab === 'favorites' ? (
        <div className="text-center py-6">
          <p className="text-light-text-muted dark:text-dark-text-muted">
            Nenhum som favorito ainda. Marque seus sons preferidos com ⭐
          </p>
        </div>
      ) : (
        <SoundList
          sounds={soundsToDisplay}
          activeSounds={activeSounds}
          toggleSound={toggleSound}
          setVolume={setVolume}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
        />
      )}
    </div>
  );
};
```

### Sistema de Favoritos
Permite marcar sons preferidos para acesso rápido:

```tsx
// AudioContext.tsx (trecho)
export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  // ... outros estados
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // Carrega favoritos do localStorage
  useEffect(() => {
    const storedFavorites = localStorage.getItem('audioFavorites');
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);
  
  // Persiste favoritos no localStorage quando alterados
  useEffect(() => {
    localStorage.setItem('audioFavorites', JSON.stringify(favorites));
  }, [favorites]);
  
  const toggleFavorite = useCallback((soundId: string) => {
    setFavorites(prev => {
      if (prev.includes(soundId)) {
        return prev.filter(id => id !== soundId);
      } else {
        return [...prev, soundId];
      }
    });
  }, []);
  
  // ... resto do componente
};
```

### Controle Persistente de Áudio
Mantém o controle de áudio acessível em todas as telas:

```tsx
// PersistentAudioControl.tsx
export const PersistentAudioControl: React.FC = () => {
  const { activeSounds, toggleSound, setVolume } = useAudio();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Se não houver sons ativos, não renderiza nada
  if (activeSounds.length === 0) return null;
  
  return (
    <div className="fixed bottom-16 right-4 z-30">
      <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg transition-all duration-300 overflow-hidden ${
        isExpanded ? 'max-h-96 w-72' : 'max-h-12 w-12'
      }`}>
        {isExpanded ? (
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">Sons Ativos</h4>
              <button 
                onClick={() => setIsExpanded(false)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-3">
              {activeSounds.map(sound => (
                <div key={sound.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <button
                      onClick={() => toggleSound(sound.id)}
                      className="p-2 rounded-full bg-primary/10 text-primary mr-2"
                    >
                      <Volume2 size={16} />
                    </button>
                    <span className="text-sm">{sound.name}</span>
                  </div>
                  
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sound.volume * 100}
                    onChange={(e) => setVolume(sound.id, parseInt(e.target.value) / 100)}
                    className="w-20 accent-primary"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setIsExpanded(true)}
            className="w-12 h-12 flex items-center justify-center text-primary"
          >
            <Volume2 size={24} />
          </button>
        )}
      </div>
    </div>
  );
};
```

## 📝 Sistema de Notas de Texto

O EstudoZen implementa um sistema completo de anotações de texto:

### Editor Avançado

```tsx
// TextNoteEditor.tsx
export const TextNoteEditor: React.FC<TextNoteEditorProps> = ({ note, onSave, onCancel }) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [currentTag, setCurrentTag] = useState('');

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('Por favor, adicione um título para a nota');
      return;
    }

    onSave({
      id: note?.id || generateId(),
      title: title.trim(),
      content,
      tags,
      createdAt: note?.createdAt || new Date(),
      updatedAt: new Date()
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título da nota"
          className="w-full px-4 py-2 text-lg font-medium border-b border-light-border dark:border-dark-border bg-transparent focus:outline-none focus:border-primary dark:focus:border-primary text-light-text-primary dark:text-dark-text-primary"
        />
      </div>

      <div className="min-h-[200px]">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Conteúdo da nota..."
          className="w-full h-full min-h-[200px] p-4 rounded-lg border border-light-border dark:border-dark-border bg-light-background-secondary dark:bg-dark-background-secondary text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:border-primary dark:focus:border-primary resize-y"
        />
      </div>

      <div>
        <div className="flex items-center space-x-2 mb-2">
          <input
            type="text"
            value={currentTag}
            onChange={(e) => setCurrentTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
            placeholder="Adicionar tag..."
            className="flex-1 px-3 py-1.5 rounded-lg border border-light-border dark:border-dark-border bg-light-background-secondary dark:bg-dark-background-secondary text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:border-primary dark:focus:border-primary"
          />
          <button
            onClick={handleAddTag}
            className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-dark text-white"
          >
            Adicionar
          </button>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <div 
                key={tag} 
                className="flex items-center bg-light-background-tertiary dark:bg-dark-background-tertiary text-light-text-secondary dark:text-dark-text-secondary rounded-full px-3 py-1"
              >
                <span className="text-sm">#{tag}</span>
                <button 
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-2 text-light-text-muted dark:text-dark-text-muted hover:text-red-500 dark:hover:text-red-400"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <button 
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-light-border dark:border-dark-border text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-background-secondary dark:hover:bg-dark-background-secondary"
        >
          Cancelar
        </button>
        <button 
          onClick={handleSave}
          className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white"
        >
          Salvar
        </button>
      </div>
    </div>
  );
};
```

### Busca e Filtragem

```tsx
// TextNotesList.tsx (trecho)
export const TextNotesList: React.FC<TextNotesListProps> = ({ onSelectNote }) => {
  const { notes, deleteNote } = useTextNotes();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Extrai todos os tags únicos de todas as notas
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    notes.forEach(note => {
      note.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, [notes]);

  // Filtra notas com base na busca e tag selecionado
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesSearch = searchTerm === '' || 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTag = selectedTag === null || note.tags.includes(selectedTag);
      
      return matchesSearch && matchesTag;
    });
  }, [notes, searchTerm, selectedTag]);

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar notas..."
          className="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-background-secondary dark:bg-dark-background-secondary text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:border-primary dark:focus:border-primary"
        />
      </div>

      {allTags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedTag === null
                ? 'bg-primary text-white'
                : 'bg-light-background-tertiary dark:bg-dark-background-tertiary text-light-text-secondary dark:text-dark-text-secondary'
            }`}
          >
            Todos
          </button>
          
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`px-3 py-1 rounded-full text-sm ${
                tag === selectedTag
                  ? 'bg-primary text-white'
                  : 'bg-light-background-tertiary dark:bg-dark-background-tertiary text-light-text-secondary dark:text-dark-text-secondary'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}
      
      // ... resto do componente com a lista de notas
    </div>
  );
};
```

## ⏱️ Sistema de Sessões de Estudo

O EstudoZen implementa um sistema de rastreamento de sessões de estudo:

### Registro de Sessões

```tsx
// StudySessionContext.tsx (trecho)
export const StudySessionProvider: React.FC<StudySessionProviderProps> = ({ children }) => {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [currentSession, setCurrentSession] = useState<ActiveSession | null>(null);
  
  // Carrega sessões anteriores
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const storedSessions = await localforage.getItem<StudySession[]>('studySessions');
        if (storedSessions) {
          setSessions(storedSessions);
        }
      } catch (error) {
        console.error('Erro ao carregar sessões de estudo:', error);
      }
    };
    
    loadSessions();
  }, []);
  
  // Persiste sessões quando atualizadas
  useEffect(() => {
    if (sessions.length > 0) {
      localforage.setItem('studySessions', sessions);
    }
  }, [sessions]);
  
  // Inicia uma nova sessão de estudo
  const startSession = useCallback((subject: string, goal?: string) => {
    if (currentSession) {
      // Já existe uma sessão ativa
      return false;
    }
    
    setCurrentSession({
      startTime: new Date(),
      subject,
      goal,
      pauses: [],
      pauseStartTime: null
    });
    
    return true;
  }, [currentSession]);
  
  // Pausa a sessão atual
  const pauseSession = useCallback(() => {
    if (!currentSession || currentSession.pauseStartTime) {
      // Não há sessão ativa ou já está pausada
      return false;
    }
    
    setCurrentSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        pauseStartTime: new Date()
      };
    });
    
    return true;
  }, [currentSession]);
  
  // Retoma a sessão pausada
  const resumeSession = useCallback(() => {
    if (!currentSession || !currentSession.pauseStartTime) {
      // Não há sessão ativa ou não está pausada
      return false;
    }
    
    setCurrentSession(prev => {
      if (!prev || !prev.pauseStartTime) return prev;
      
      return {
        ...prev,
        pauses: [
          ...prev.pauses,
          {
            start: prev.pauseStartTime,
            end: new Date()
          }
        ],
        pauseStartTime: null
      };
    });
    
    return true;
  }, [currentSession]);
  
  // Finaliza a sessão atual
  const endSession = useCallback((notes?: string) => {
    if (!currentSession) {
      // Não há sessão ativa
      return false;
    }
    
    const now = new Date();
    let finalPauses = [...currentSession.pauses];
    
    // Se terminou durante uma pausa, adiciona a pausa final
    if (currentSession.pauseStartTime) {
      finalPauses.push({
        start: currentSession.pauseStartTime,
        end: now
      });
    }
    
    // Calcula a duração total (excluindo pausas)
    const totalPauseDuration = finalPauses.reduce((total, pause) => {
      return total + (pause.end.getTime() - pause.start.getTime());
    }, 0);
    
    const totalDuration = now.getTime() - currentSession.startTime.getTime();
    const activeDuration = totalDuration - totalPauseDuration;
    
    // Cria o objeto de sessão completa
    const completedSession: StudySession = {
      id: generateId(),
      subject: currentSession.subject,
      goal: currentSession.goal,
      startTime: currentSession.startTime,
      endTime: now,
      duration: Math.round(activeDuration / 1000), // em segundos
      pauses: finalPauses,
      notes
    };
    
    // Adiciona à lista de sessões
    setSessions(prev => [...prev, completedSession]);
    
    // Limpa a sessão atual
    setCurrentSession(null);
    
    return true;
  }, [currentSession]);
  
  // ... outras funções e valores de contexto
  
  return (
    <StudySessionContext.Provider value={{
      sessions,
      currentSession,
      startSession,
      pauseSession,
      resumeSession,
      endSession,
      // ... outros valores
    }}>
      {children}
    </StudySessionContext.Provider>
  );
};
```

### Visualização de Estatísticas

```tsx
// StudyStats.tsx (trecho)
export const StudyStats: React.FC = () => {
  const { sessions } = useStudySession();
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('week');
  
  // Filtra sessões com base no intervalo de tempo selecionado
  const filteredSessions = useMemo(() => {
    const now = new Date();
    let cutoffDate: Date;
    
    switch (timeRange) {
      case 'day':
        cutoffDate = subDays(now, 1);
        break;
      case 'week':
        cutoffDate = subDays(now, 7);
        break;
      case 'month':
        cutoffDate = subMonths(now, 1);
        break;
      case 'year':
        cutoffDate = subYears(now, 1);
        break;
    }
    
    return sessions.filter(session => isAfter(new Date(session.endTime), cutoffDate));
  }, [sessions, timeRange]);
  
  // Calcula estatísticas
  const stats = useMemo(() => {
    if (filteredSessions.length === 0) {
      return {
        totalSessions: 0,
        totalDuration: 0,
        averageDuration: 0,
        longestSession: 0,
        subjectBreakdown: {}
      };
    }
    
    const totalDuration = filteredSessions.reduce((total, session) => total + session.duration, 0);
    const averageDuration = totalDuration / filteredSessions.length;
    const longestSession = Math.max(...filteredSessions.map(session => session.duration));
    
    // Agrupamento por assunto
    const subjectBreakdown = filteredSessions.reduce((acc, session) => {
      const subject = session.subject || 'Sem assunto';
      
      if (!acc[subject]) {
        acc[subject] = {
          totalDuration: 0,
          count: 0
        };
      }
      
      acc[subject].totalDuration += session.duration;
      acc[subject].count++;
      
      return acc;
    }, {} as Record<string, { totalDuration: number, count: number }>);
    
    return {
      totalSessions: filteredSessions.length,
      totalDuration,
      averageDuration,
      longestSession,
      subjectBreakdown
    };
  }, [filteredSessions]);
  
  // Formatação do tempo em horas e minutos
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    } else {
      return `${minutes}min`;
    }
  };
  
  // ... restante do componente
};
```

## 🔐 Sistema de Autenticação

O EstudoZen implementa um sistema de autenticação local baseado em LocalForage:

### Contexto de Autenticação

```tsx
// AuthContext.tsx (trecho)
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verifica status de autenticação na inicialização
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      
      // Criar usuário de demonstração se não existir
      await createDemoUserIfNotExists();
      
      const currentUserId = await localforage.getItem<string>('currentUserId');
      
      if (currentUserId) {
        const userData = await localforage.getItem<User>(`user_${currentUserId}`);
        if (userData) {
          setUser({
            ...userData,
            createdAt: new Date(userData.createdAt),
            lastLogin: new Date(userData.lastLogin)
          });
        }
      }
    } catch (error) {
      console.error('Erro ao verificar status de autenticação:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Simula hash de senha (em produção usaria bcrypt)
  const hashPassword = (password: string): string => {
    return btoa(password + 'salt_estudozen_2024');
  };

  const verifyPassword = (password: string, hash: string): boolean => {
    return hashPassword(password) === hash;
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Buscar usuário por email
      const users = await localforage.getItem<Record<string, any>>('users') || {};
      const userEntry = Object.entries(users).find(([_, userData]) => userData.email === email);
      
      if (!userEntry) {
        return { success: false, error: 'Email não encontrado' };
      }

      const [userId, userData] = userEntry;
      
      // Verificar senha
      if (!verifyPassword(password, userData.passwordHash)) {
        return { success: false, error: 'Senha incorreta' };
      }

      // Atualizar último login
      const updatedUser: User = {
        ...userData,
        lastLogin: new Date(),
        createdAt: new Date(userData.createdAt)
      };

      // Salvar usuário atualizado
      await localforage.setItem(`user_${userId}`, updatedUser);
      await localforage.setItem('users', { ...users, [userId]: updatedUser });
      await localforage.setItem('currentUserId', userId);

      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, error: 'Erro interno do sistema' };
    }
  };

  // ... outros métodos de autenticação
};
```

### Usuário de Demonstração

```tsx
// Cria um usuário demo para facilitar testes
const createDemoUserIfNotExists = async () => {
  try {
    const users = await localforage.getItem<Record<string, any>>('users') || {};
    const demoUserExists = Object.values(users).some((userData: any) => userData.email === 'grupo5@estudozen.com');
    
    if (!demoUserExists) {
      const demoUserId = 'demo_user_123';
      const now = new Date();
      
      const demoUser: User = {
        id: demoUserId,
        name: 'Usuário Demonstração',
        email: 'grupo5@estudozen.com',
        createdAt: now,
        lastLogin: now,
        preferences: {
          theme: 'system',
          notifications: true,
          language: 'pt-BR'
        }
      };

      const demoUserWithPassword = {
        ...demoUser,
        passwordHash: hashPassword('123456')
      };

      await localforage.setItem(`user_${demoUserId}`, demoUser);
      await localforage.setItem('users', { ...users, [demoUserId]: demoUserWithPassword });
    }
  } catch (error) {
    console.error('Erro ao criar usuário de demonstração:', error);
  }
};
```

### Proteção de Rotas

```tsx
// routes.tsx (trecho)
// Componente para proteger rotas que requerem autenticação
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    // Redireciona para login, guardando a URL atual para redirecionamento após login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export function AppRoutes() {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      
      {/* Rotas protegidas */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<HomePage />} />
        <Route path="/study" element={<StudyPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      
      {/* Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
```

