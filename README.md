# 🧘 EstudoZen — Plataforma Integrada para Estudos

EstudoZen é uma aplicação web moderna desenvolvida para auxiliar estudantes na organização, produtividade e foco, reunindo diversas ferramentas em um único ambiente.

## ✨ Funcionalidades Principais

### 🎯 **Área de Estudo**

* **Pomodoro Timer**: Técnica de produtividade com ciclos de 25 minutos de foco seguidos por 5 minutos de pausa.
* **Cronômetro de Sessões**: Controle de tempo para sessões livres, com opções de iniciar, pausar e reiniciar.
* **Sons Ambiente**: Biblioteca com opções como chuva, floresta, cafeteria, entre outros.
* **Modo Foco**: Bloqueia notificações para minimizar distrações.

### 📅 **Sistema de Agendamentos**

* **CRUD Completo**: Permite criar, editar, visualizar e remover agendamentos.
* **Alertas Personalizáveis**: Notificações programadas entre 5 minutos e 1 dia antes do compromisso.
* **Filtros Inteligentes**: Visualização por agendamentos futuros, passados ou concluídos.
* **Organização por Disciplina**: Associe agendamentos às matérias estudadas.

### 👥 **Gerenciamento de Contatos**

* **Cadastro de Professores e Monitores**: Inclusão de informações como função e disciplinas associadas.
* **Detalhes de Contato**: Email, telefone e área de atuação.
* **Busca Avançada**: Pesquisa por nome, email, disciplina ou função.
* **Ações Diretas**: Botões para chamada ou envio de email.

### 🎤 **Notas de Voz**

* **Gravação via Navegador**: Utiliza a API MediaRecorder.
* **Etiquetas Personalizadas**: Organização por tags para facilitar a busca.
* **Player Integrado**: Reprodução com controles básicos.
* **Busca por Conteúdo**: Localize notas por título, disciplina ou etiquetas.

### 📊 **Dashboard de Estatísticas**

* **Indicadores em Tempo Real**: Dados sobre agendamentos, contatos e notas.
* **Recomendações Inteligentes**: Sugestões com base no uso da plataforma.
* **Histórico de Atividades**: Registro das ações mais recentes.
* **Taxa de Conclusão**: Acompanhamento do desempenho individual.

### 📱 **Experiência Mobile-First**

* **Barra de Navegação Inferior**: Otimizada para dispositivos móveis.
* **Layout Responsivo**: Compatível com telas de diferentes tamanhos.
* **Gestos e Usabilidade**: Interface intuitiva e moderna.

## 🛠 Tecnologias Utilizadas

### **Frontend**

* **React 19** com **TypeScript**
* **Tailwind CSS** para estilização
* **React Router** para navegação
* **Lucide React** para ícones

### **Gerenciamento de Estado**

* **Context API** para controle global de dados
* **useReducer** para fluxos complexos
* **Custom Hooks** para lógica reutilizável

### **Armazenamento**

* **LocalForage** para dados persistentes
* **IndexedDB** para arquivos de áudio
* **LocalStorage** para preferências do usuário

### **APIs do Navegador**

* **MediaRecorder API** para gravações
* **Notification API** para alertas
* **Web Audio API** para sons ambiente

## 🚀 Como Utilizar

### **Instalação**

```bash
# Clone o repositório
git clone https://github.com/LuizHehnes/EstudoZen

# Instale as dependências
npm install

# Inicie o ambiente de desenvolvimento
npm run dev
```

### **Navegação pelas Páginas**

* `/` — Página inicial
* `/study` — Ferramentas de foco e cronômetro
* `/schedule` — Agendamento de tarefas
* `/dashboard` — Painel com estatísticas
* `/contacts` — Gerenciamento de contatos
* `/voice-notes` — Notas de voz gravadas

## 🎵 Sons Ambiente Disponíveis

* **🌧️ Chuva**
* **🌲 Floresta**
* **☕ Café**
* **🌊 Oceano**
* **🔥 Lareira**
* **📚 Biblioteca/LoFFi**

## 🔧 Configuração de Desenvolvimento



### **Interfaces de Dados**

#### Agendamentos

```ts
interface ScheduleItem {
  id: string
  title: string
  description: string
  date: Date
  time: string
  subject: string
  alertMinutes: number
  isCompleted: boolean
  createdAt: Date
}
```

#### Contatos

```ts
interface Contact {
  id: string
  name: string
  email: string
  phone: string
  subject: string
  role: 'professor' | 'monitor' | 'coordenador'
  notes: string
  createdAt: Date
}
```

#### Notas de Voz

```ts
interface VoiceNote {
  id: string
  title: string
  subject: string
  duration: number
  audioBlob: Blob
  audioUrl: string
  createdAt: Date
  tags: string[]
}
```

## 🎨 Sistema de Design

### **Cores**

* Primária: Azul `#3B82F6`
* Neutra: Cinza `#6B7280`
* Sucesso: Verde `#10B981`
* Alerta: Amarelo `#F59E0B`
* Erro: Vermelho `#EF4444`

### **Fontes**

* Títulos: **Inter Bold**
* Corpo: **Inter Regular**
* Códigos: **JetBrains Mono**

## 🔒 Segurança e Privacidade

* **Armazenamento Local**: Todos os dados são mantidos no dispositivo do usuário.
* **Sem Servidores Externos**: Nenhuma informação é enviada para a nuvem.
* **Criptografia**: Proteção aplicada a dados sensíveis.
* **Permissões Conscientes**: Apenas microfone e notificações são solicitados.

## 🙏 Agradecimentos

* À equipe 5 do projeto da matéria Low Code por sua contribuição

---

**EstudoZen foi desenvolvido com dedicação para tornar seus estudos mais produtivos e organizados.**