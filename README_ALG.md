# 🚀 ALG Gestão - Sistema de Locação de Equipamentos

Sistema completo de gerenciamento de locação de equipamentos desenvolvido com Next.js 15, TypeScript, tRPC e Prisma.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![tRPC](https://img.shields.io/badge/tRPC-11-blue)
![Prisma](https://img.shields.io/badge/Prisma-6-green)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📋 Índice

- [Sobre](#-sobre)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#️-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#️-configuração)
- [Executando o Projeto](#-executando-o-projeto)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Estrutura de Diretórios](#-estrutura-de-diretórios)
- [API (tRPC Routers)](#-api-trpc-routers)
- [Banco de Dados](#️-banco-de-dados)
- [Automações](#-automações)
- [Deploy](#-deploy)
- [Contribuindo](#-contribuindo)

---

## 📖 Sobre

O **ALG Gestão** é um sistema completo para empresas de locação de equipamentos que oferece:

- Gestão completa de clientes (PF e PJ)
- Catálogo de equipamentos com controle de estoque
- Contratos de locação com assinatura digital
- Sistema de devoluções
- Faturamento automático mensal
- Dashboard com gráficos e métricas
- Relatórios personalizados
- Notificações em tempo real
- Automações com Inngest

---

## ✨ Funcionalidades

### 🏢 Gestão de Clientes
- ✅ CRUD completo de clientes (PF e PJ)
- ✅ Validação automática de CPF/CNPJ
- ✅ Integração com ViaCEP para busca de endereço
- ✅ Filtros avançados e busca
- ✅ Estatísticas por cliente
- ✅ Exportação de dados (CSV/Excel/JSON)

### 📦 Gestão de Equipamentos
- ✅ CRUD completo de equipamentos
- ✅ Controle de estoque automático
- ✅ Preços diferenciados (diária, semanal, quinzenal, mensal)
- ✅ Verificação de disponibilidade em tempo real
- ✅ Histórico de uso
- ✅ Filtros e exportação

### 📝 Gestão de Contratos
- ✅ Criação de contratos com múltiplos equipamentos
- ✅ Numeração automática por cliente
- ✅ Workflow de status (Pendente → Assinado → Em Andamento → Finalizado)
- ✅ Assinatura digital com canvas
- ✅ Geração de PDF
- ✅ Arquivamento de contratos antigos
- ✅ Validação de estoque antes de criar contrato

### 🔄 Gestão de Devoluções
- ✅ Criação automática ao gerar contrato
- ✅ Devoluções parciais ou totais
- ✅ Atualização automática de estoque
- ✅ Assinatura digital
- ✅ Alertas de devoluções atrasadas

### 💰 Faturamento
- ✅ Criação manual e automática de faturas
- ✅ Faturamento automático mensal (Inngest)
- ✅ Vinculação de múltiplos contratos
- ✅ Registro de pagamentos (parcial ou total)
- ✅ Múltiplos métodos de pagamento
- ✅ Status automático (Pendente/Paga/Vencida/Cancelada)
- ✅ Geração de PDF

### 📊 Dashboard e Relatórios
- ✅ Cards de resumo geral
- ✅ Gráficos de receita mensal
- ✅ Equipamentos mais alugados
- ✅ Top clientes
- ✅ Relatórios personalizados

### 🔔 Notificações
- ✅ Sistema de notificações no header
- ✅ Alertas de contratos vencendo
- ✅ Alertas de devoluções atrasadas
- ✅ Alertas de faturas vencidas
- ✅ Alertas de estoque baixo

### 🤖 Automações
- ✅ Faturamento automático mensal
- ✅ Alertas diários de contratos e devoluções
- ✅ Painel de controle de automações
- ✅ Acionamento manual via interface

---

## 🛠️ Tecnologias

### Frontend
- **Next.js 15** - Framework React com App Router
- **React 19** - Biblioteca UI
- **TypeScript** - Linguagem tipada
- **Tailwind CSS** - Framework CSS
- **Shadcn/ui** - Componentes UI
- **Radix UI** - Primitivos acessíveis
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas
- **Recharts** - Gráficos
- **@react-pdf/renderer** - Geração de PDFs

### Backend
- **tRPC 11** - Type-safe API
- **Prisma** - ORM para PostgreSQL
- **Better Auth** - Autenticação
- **Inngest** - Automações e background jobs

### Desenvolvimento
- **Biome** - Linter e formatter
- **TSX** - Executor TypeScript
- **Mprocs** - Gerenciador de processos

---

## 📋 Pré-requisitos

- **Node.js** 20+ (recomendado: 20.x LTS)
- **PostgreSQL** 14+
- **npm** ou **pnpm** ou **yarn**
- **Git**

---

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/alg-gestao.git
cd alg-gestao
```

### 2. Instale as dependências

```bash
npm install
# ou
pnpm install
# ou
yarn install
```

---

## ⚙️ Configuração

### 1. Crie o arquivo `.env`

Copie o arquivo `.env.example` e preencha as variáveis:

```bash
cp .env.example .env
```

**Variáveis necessárias:**

```env
# Database
DATABASE_URL="postgresql://usuario:senha@localhost:5432/alg_gestao?schema=public"

# Better Auth
BETTER_AUTH_SECRET="sua_chave_secreta_forte"
BETTER_AUTH_URL="http://localhost:3000"

# Inngest
INNGEST_EVENT_KEY="sua_chave_inngest"

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. Configure o banco de dados

```bash
# Gerar Prisma Client
npx prisma generate

# Executar migrations
npx prisma migrate dev

# (Opcional) Popular com dados de exemplo
npm run db:seed
```

### 3. (Opcional) Importar dados existentes

Se você tem dados SQL para importar:

```bash
# Importar todos os dados
npm run db:import-complete

# Importar apenas devoluções
npm run db:import-devolucoes
```

---

## 🏃 Executando o Projeto

### Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Ou iniciar com Inngest (automações)
npm run dev:all
```

Acesse: **http://localhost:3000**

### Produção

```bash
# Build
npm run build

# Start
npm run start
```

### Inngest Dev Server

Para testar automações localmente:

```bash
npm run inngest:dev
```

---

## 📜 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Build para produção |
| `npm run start` | Inicia servidor de produção |
| `npm run lint` | Executa linter (Biome) |
| `npm run format` | Formata código (Biome) |
| `npm run dev:all` | Inicia dev + Inngest (mprocs) |
| `npm run inngest:dev` | Inngest dev server |
| `npm run db:seed` | Popula banco com dados exemplo |
| `npm run db:import-complete` | Importa dados SQL completos |
| `npm run db:import-devolucoes` | Importa devoluções SQL |

---

## 📁 Estrutura de Diretórios

```
alg-gestao/
├── prisma/
│   ├── schema.prisma          # Schema do banco de dados
│   └── migrations/            # Migrations do Prisma
├── scripts/
│   ├── import-complete-sql-data.ts
│   ├── import-devolucoes.ts
│   └── seed-initial-data.ts
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/           # Rotas de autenticação
│   │   ├── admin/            # Painel admin
│   │   ├── api/              # API routes
│   │   ├── clientes/         # Páginas de clientes
│   │   ├── contratos/        # Páginas de contratos
│   │   ├── devolucoes/       # Páginas de devoluções
│   │   ├── equipamentos/     # Páginas de equipamentos
│   │   ├── faturas/          # Páginas de faturas
│   │   ├── perfil/           # Perfil do usuário
│   │   ├── relatorios/       # Relatórios
│   │   └── page.tsx          # Dashboard
│   ├── components/
│   │   ├── ui/               # Componentes Shadcn
│   │   ├── app-layout.tsx    # Layout principal
│   │   ├── export/           # Componentes de exportação
│   │   └── filtros/          # Componentes de filtros
│   ├── features/             # Feature modules
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── clientes/
│   │   ├── contratos/
│   │   ├── dashboard/
│   │   ├── devolucoes/
│   │   ├── equipamentos/
│   │   └── faturas/
│   ├── hooks/                # Custom hooks
│   ├── inngest/              # Inngest functions
│   │   ├── client.ts
│   │   └── functions/
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── db.ts
│   │   └── utils/
│   └── trpc/
│       ├── routers/          # tRPC routers
│       │   ├── admin.router.ts
│       │   ├── clientes.router.ts
│       │   ├── contratos.router.ts
│       │   ├── dashboard.router.ts
│       │   ├── devolucoes.router.ts
│       │   ├── equipamentos.router.ts
│       │   └── faturas.router.ts
│       ├── client.tsx
│       └── server.tsx
├── .env                       # Variáveis de ambiente (não commitado)
├── .env.example              # Exemplo de variáveis
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔌 API (tRPC Routers)

### Dashboard Router
- `resumo` - Resumo geral do sistema
- `receitaMensal` - Gráfico de receita
- `topClientes` - Top clientes
- `topEquipamentos` - Top equipamentos
- `alertas` - Sistema de notificações

### Clientes Router
- `list` - Listar clientes
- `getById` - Buscar por ID
- `create` - Criar cliente
- `update` - Atualizar cliente
- `delete` - Deletar cliente
- `buscarCEP` - Integração ViaCEP
- `stats` - Estatísticas

### Equipamentos Router
- `list` - Listar equipamentos
- `getById` - Buscar por ID
- `create` - Criar equipamento
- `update` - Atualizar equipamento
- `delete` - Deletar equipamento
- `atualizarEstoque` - Gerenciar estoque
- `verificarDisponibilidade` - Verificar disponibilidade

### Contratos Router
- `list` - Listar contratos
- `getById` - Buscar por ID
- `create` - Criar contrato
- `update` - Atualizar contrato
- `delete` - Deletar contrato
- `assinar` - Assinar contrato
- `atualizarStatus` - Atualizar status
- `arquivar` - Arquivar contrato

### Devoluções Router
- `list` - Listar devoluções
- `getById` - Buscar por ID
- `registrar` - Registrar devolução
- `confirmar` - Confirmar recebimento
- `assinar` - Assinar devolução

### Faturas Router
- `list` - Listar faturas
- `getById` - Buscar por ID
- `create` - Criar fatura
- `update` - Atualizar fatura
- `registrarPagamento` - Registrar pagamento
- `cancelar` - Cancelar fatura
- `gerarAutomaticas` - Gerar faturas mensais
- `dashboard` - Métricas financeiras

### Admin Router
- `triggerFaturamentoAutomatico` - Acionar faturamento manual
- `triggerAlertasContratos` - Acionar alertas de contratos
- `triggerAlertasDevolucoes` - Acionar alertas de devoluções

---

## 🗄️ Banco de Dados

### Models Principais

- **Cliente** - Dados de clientes (PF/PJ)
- **Equipamento** - Catálogo de equipamentos
- **Contrato** - Contratos de locação
- **EquipamentoContrato** - Relacionamento N:N
- **Assinatura** - Assinaturas digitais de contratos
- **Devolucao** - Devoluções de equipamentos
- **AssinaturaDevolucao** - Assinaturas de devoluções
- **Fatura** - Faturas e cobranças
- **FaturaContrato** - Relacionamento N:N
- **AssinaturaFatura** - Assinaturas de faturas
- **TokenAssinatura** - Tokens para assinatura por link

### Enums

- **StatusAssinatura**: PENDENTE, ASSINADO
- **StatusContrato**: PENDENTE, ASSINADO, EM_ANDAMENTO, FINALIZADO, CANCELADO
- **PeriodoContrato**: DIARIA, SEMANAL, QUINZENAL, MENSAL
- **StatusItemDevolucao**: PENDENTE, PARCIAL, DEVOLVIDO
- **StatusFatura**: PENDENTE, PAGA, VENCIDA, CANCELADA

---

## 🤖 Automações

### Inngest Functions

1. **Faturamento Automático Mensal**
   - Executa: Todo dia 1º do mês às 00:00
   - Ação: Gera faturas para contratos finalizados no mês anterior

2. **Alertas de Contratos Vencendo**
   - Executa: Diariamente às 08:00
   - Ação: Notifica contratos que vencem em 3 dias

3. **Alertas de Devoluções Atrasadas**
   - Executa: Diariamente às 08:00
   - Ação: Notifica devoluções atrasadas

---

## 🚀 Deploy

### Vercel (Recomendado para Next.js)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy para produção
vercel --prod
```

**Configurações necessárias:**
- Adicionar variáveis de ambiente no Vercel
- Configurar DATABASE_URL para PostgreSQL de produção
- Configurar domínio personalizado

### Docker (Opcional)

```dockerfile
# Dockerfile exemplo
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

---

## 🧪 Testes

⚠️ **Testes ainda não foram implementados**

Sugestão de stack:
- **Jest** ou **Vitest** para testes unitários
- **Playwright** para testes E2E
- **React Testing Library** para testes de componentes

---

## 📝 Licença

Este projeto está sob a licença **MIT**.

---

## 👥 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📞 Suporte

Para suporte, entre em contato através de:
- Email: [seu-email@exemplo.com]
- Issues: [GitHub Issues](https://github.com/seu-usuario/alg-gestao/issues)

---

## 🙏 Agradecimentos

Desenvolvido com ❤️ utilizando as melhores tecnologias do ecossistema JavaScript/TypeScript.

- Next.js Team
- Vercel
- Prisma
- tRPC
- Shadcn
- E toda a comunidade open source!

---

**Versão:** 1.0.0  
**Última atualização:** Novembro 2025

