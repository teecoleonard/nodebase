# 🚀 GUIA DE DEPLOYMENT - ALG GESTÃO

---

## 📋 PRÉ-REQUISITOS

- [ ] Conta no Vercel (ou outra plataforma)
- [ ] PostgreSQL em produção (Vercel Postgres, Supabase, Railway, etc.)
- [ ] Conta no Inngest Cloud (para automações)
- [ ] Domínio personalizado (opcional)

---

## 🔧 CHECKLIST ANTES DO DEPLOY

### 1. Variáveis de Ambiente

Certifique-se de ter todas as variáveis configuradas:

```env
# Database
DATABASE_URL="postgresql://..."

# Better Auth
BETTER_AUTH_SECRET="[GERAR CHAVE FORTE]"
BETTER_AUTH_URL="https://seu-dominio.com"

# Inngest
INNGEST_EVENT_KEY="[CHAVE DO INNGEST CLOUD]"
INNGEST_SIGNING_KEY="[CHAVE DE ASSINATURA]"

# Next.js
NEXT_PUBLIC_APP_URL="https://seu-dominio.com"
NODE_ENV="production"
```

**⚠️ IMPORTANTE:** Gerar chaves secretas fortes:
```bash
# Gerar BETTER_AUTH_SECRET
openssl rand -base64 32

# Ou usando Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 2. Banco de Dados

#### Opção 1: Vercel Postgres (Recomendado)

1. No dashboard do Vercel, vá em "Storage"
2. Clique em "Create Database"
3. Selecione "Postgres"
4. A `DATABASE_URL` será gerada automaticamente

#### Opção 2: Supabase

1. Crie um projeto em https://supabase.com
2. Vá em "Project Settings" → "Database"
3. Copie a "Connection string"

#### Opção 3: Railway

1. Crie um projeto em https://railway.app
2. Adicione PostgreSQL
3. Copie a connection string

### 3. Executar Migrations

```bash
# Localmente, apontando para o DB de produção
DATABASE_URL="postgresql://..." npx prisma migrate deploy

# Ou no Vercel (após deploy inicial)
vercel env pull
npx prisma migrate deploy
```

### 4. Importar Dados (Opcional)

Se você tem dados para importar:

```bash
# Localmente, apontando para DB de produção
DATABASE_URL="postgresql://..." npm run db:import-complete
```

---

## 🌐 DEPLOY NO VERCEL (RECOMENDADO)

### Passo 1: Conectar Repositório

```bash
# 1. Inicializar Git (se ainda não estiver)
git init
git add .
git commit -m "Initial commit"

# 2. Criar repositório no GitHub/GitLab/Bitbucket
# 3. Push do código
git remote add origin https://github.com/seu-usuario/alg-gestao.git
git push -u origin main
```

### Passo 2: Importar no Vercel

1. Acesse https://vercel.com/new
2. Clique em "Import Git Repository"
3. Selecione seu repositório
4. Configure as variáveis de ambiente
5. Clique em "Deploy"

### Passo 3: Configurar Variáveis no Vercel

No dashboard do projeto:
1. Vá em "Settings" → "Environment Variables"
2. Adicione todas as variáveis necessárias
3. Redeploy o projeto

### Passo 4: Executar Migrations

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Pull das variáveis de ambiente
vercel env pull

# Executar migrations
npx prisma migrate deploy

# Ou executar via Vercel CLI
vercel exec -- npx prisma migrate deploy
```

---

## 🤖 CONFIGURAR INNGEST CLOUD

### 1. Criar Conta

1. Acesse https://www.inngest.com/
2. Crie uma conta
3. Crie um novo projeto

### 2. Obter Chaves

No dashboard do Inngest:
1. Vá em "Keys"
2. Copie o "Event Key" → `INNGEST_EVENT_KEY`
3. Copie o "Signing Key" → `INNGEST_SIGNING_KEY`

### 3. Configurar Webhook

1. No Inngest, vá em "Apps"
2. Clique em "Add App"
3. URL: `https://seu-dominio.com/api/inngest`
4. Salve

### 4. Testar Automações

No Vercel, acesse:
```
https://seu-dominio.com/admin/automacoes
```

Teste manualmente cada automação.

---

## 🔐 SEGURANÇA

### 1. Configurar CORS (se necessário)

Em `next.config.ts`:

```typescript
const config = {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "https://seu-dominio.com" },
        ],
      },
    ];
  },
};
```

### 2. Rate Limiting (Recomendado)

Instalar e configurar:

```bash
npm install @upstash/ratelimit @upstash/redis
```

### 3. HTTPS

✅ Vercel fornece HTTPS automaticamente

### 4. Monitoramento

Configurar Sentry (opcional):

```bash
npm install @sentry/nextjs

# Seguir wizard de configuração
npx @sentry/wizard@latest -i nextjs
```

---

## 📊 MONITORAMENTO PÓS-DEPLOY

### 1. Vercel Analytics

Já está ativo automaticamente no Vercel

### 2. Logs

```bash
# Ver logs em tempo real
vercel logs --follow

# Ou no dashboard do Vercel
# Project → Deployments → [Selecionar] → Logs
```

### 3. Performance

Acessar:
```
https://vercel.com/[seu-usuario]/[projeto]/analytics
```

---

## 🔄 WORKFLOW DE DEPLOY

### Development → Staging → Production

```bash
# 1. Development (local)
npm run dev

# 2. Staging (branch preview no Vercel)
git checkout -b staging
git push origin staging

# Vercel cria automaticamente uma preview URL

# 3. Production (branch main)
git checkout main
git merge staging
git push origin main

# Vercel faz deploy automático para produção
```

---

## 🐛 TROUBLESHOOTING

### Erro: "Module not found" após deploy

**Solução:**
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
git commit -am "Fix dependencies"
git push
```

### Erro: Prisma Client não encontrado

**Solução:**
```bash
# Adicionar em package.json → scripts
"postinstall": "prisma generate"

# Ou no vercel.json
{
  "buildCommand": "prisma generate && next build"
}
```

### Erro: Cannot connect to database

**Verificar:**
1. `DATABASE_URL` está correta
2. Database aceita conexões externas
3. IP do Vercel está na whitelist (se necessário)

### Inngest não está executando

**Verificar:**
1. Webhook configurado corretamente
2. `INNGEST_EVENT_KEY` e `INNGEST_SIGNING_KEY` corretos
3. Endpoint `/api/inngest` acessível
4. Logs do Inngest para erros

---

## ✅ CHECKLIST FINAL

Após o deploy, verificar:

- [ ] Site está acessível
- [ ] Login funciona
- [ ] Dashboard carrega corretamente
- [ ] CRUD de clientes funciona
- [ ] CRUD de equipamentos funciona
- [ ] Criação de contratos funciona
- [ ] Assinatura digital funciona
- [ ] Geração de PDFs funciona
- [ ] Faturamento funciona
- [ ] Notificações funcionam
- [ ] Inngest está executando (verificar no dashboard do Inngest)
- [ ] Não há erros no console do navegador
- [ ] Performance está boa (Lighthouse > 80)

---

## 📱 DOMÍNIO PERSONALIZADO (OPCIONAL)

### No Vercel:

1. Vá em "Settings" → "Domains"
2. Clique em "Add Domain"
3. Digite seu domínio
4. Siga as instruções para configurar DNS

**Configuração DNS típica:**

```
Tipo: CNAME
Nome: @ (ou www)
Valor: cname.vercel-dns.com
```

Aguarde propagação DNS (até 48h, geralmente 15min-2h)

---

## 🔄 BACKUP AUTOMÁTICO

### Opção 1: Vercel Postgres (Automático)

Vercel Postgres faz backup automático

### Opção 2: Script Manual

Criar script em `scripts/backup.sh`:

```bash
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backup_$TIMESTAMP.sql
# Upload para S3, Google Cloud Storage, etc.
```

Agendar com cron job ou GitHub Actions

### Opção 3: Supabase (Automático)

Supabase faz backups automáticos no plano pago

---

## 📞 SUPORTE

Em caso de problemas:

1. Verificar logs no Vercel
2. Verificar console do navegador
3. Verificar logs do Inngest
4. Abrir issue no GitHub (se aplicável)

---

**Última atualização:** Novembro 2025  
**Versão:** 1.0.0

---

🎉 **Boa sorte com o deploy!**

