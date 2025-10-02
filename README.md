# 🎨 AppMari 2.0 - Sistema de Gestão para Social Media

Sistema completo de gestão para profissionais de Social Media, desenvolvido com React + Vite + Tailwind CSS.

## ✨ Funcionalidades

### 🏠 Dashboard
- Visão geral de posts pendentes, aprovados e clientes ativos
- Lista de tarefas interativa
- Eventos do dia (posts agendados e eventos pessoais)

### 👥 Clientes
- Cadastro completo de clientes
- Gestão de contratos e mensalidades
- Upload de fotos de perfil e documentos
- Sistema de pagamentos integrado

### 💰 Gestão de Pagamentos
- Controle mensal de pagamentos por cliente
- Upload de notas fiscais e recibos
- Status: Recebido, Pendente, Atrasado
- Histórico completo

### 📅 Calendário de Posts
- Visualização semanal
- Dias da semana corretos (começa no Domingo)
- Criação e edição de posts
- Upload de imagens e vídeos

### 📋 Kanban
- 6 colunas de workflow:
  - 📝 Pendente
  - ✏️ Em Criação
  - ⏳ Aguardando Aprovação
  - ✅ Aprovado
  - 📅 Agendado
  - 🚀 Postado
- Movimentação de posts entre colunas (← →)
- Contagem por coluna

### 💡 Banco de Ideias
- Armazenamento de ideias de conteúdo
- Associação com clientes
- Tags para organização

### 💖 Área Pessoal
- Calendário mensal
- Eventos pessoais
- Lembretes de medicação

### ✅ Sistema de Aprovação
- Links únicos para clientes aprovarem posts
- Possibilidade de rejeitar com motivo
- Solicitar turbinamento (boost)
- Notificação por email

## 🚀 Como Rodar

### Instalação
\`\`\`bash
npm install
\`\`\`

### Desenvolvimento
\`\`\`bash
npm run dev
\`\`\`

Acesse: http://localhost:5173

### Build para Produção
\`\`\`bash
npm run build
\`\`\`

### 🌐 Deploy na Vercel
O projeto está configurado para deploy automático na Vercel:

1. **Fork/Clone** o repositório
2. Conecte com a **Vercel**
3. A Vercel detectará automaticamente as configurações do `vercel.json`
4. Deploy automático a cada push!

Configurações necessárias no `vercel.json`:
- Framework: **Vite**
- Build Command: `npm run build`
- Output Directory: `dist`

## 🎨 Tecnologias

- **React 18** - Framework JavaScript
- **Vite** - Build tool ultra-rápido
- **Tailwind CSS** - Framework CSS utility-first
- **Radix UI** - Componentes acessíveis
- **Lucide React** - Ícones modernos
- **Framer Motion** - Animações
- **date-fns** - Manipulação de datas
- **React Router** - Roteamento

## 📁 Estrutura do Projeto

\`\`\`
AppMari2.0/
├── src/
│   ├── main.jsx          # Entry point
│   ├── App.jsx           # Rotas principais
│   └── index.css         # Estilos globais
├── Pages/                # Páginas da aplicação
│   ├── Dashboard.jsx
│   ├── Clients.jsx
│   ├── ClientProfile.jsx
│   ├── PostCalendar.jsx
│   ├── Kanban.jsx
│   ├── Ideas.jsx
│   ├── Personal.jsx
│   └── Approval.jsx
├── Components/           # Componentes reutilizáveis
│   ├── ui/              # Componentes UI base
│   ├── dashboard/       # Componentes do dashboard
│   ├── posts/          # Componentes de posts
│   └── clients/        # Componentes de clientes
├── entities/            # Entidades e lógica de dados
├── integrations/        # Integrações (upload, email)
├── utils/              # Utilitários
└── Layout.jsx          # Layout principal com sidebar

\`\`\`

## 🎯 Páginas e Rotas

- `/` - Dashboard
- `/clients` - Lista de clientes
- `/client-profile` - Perfil do cliente
- `/post-calendar` - Calendário de posts
- `/kanban` - Board Kanban
- `/ideas` - Banco de ideias
- `/personal` - Área pessoal
- `/approval` - Aprovação de posts (sem sidebar)

## 🔧 Configurações

### Alias de Importação
O projeto usa `@` como alias para a raiz:
\`\`\`javascript
import { Button } from "@/components/ui/button"
\`\`\`

### Tailwind CSS
Configurado com tema customizado e animações.

## 📝 Observações

- Sistema usa dados mock em desenvolvimento (entities/all.js)
- Para produção, conectar com backend real
- Upload de arquivos simulado (integrations/Core.js)
- Emails simulados em desenvolvimento

## 👨‍💻 Desenvolvido por

Pedro Mucelin
Data: Outubro 2024

---

Made with ❤️ and ☕ 