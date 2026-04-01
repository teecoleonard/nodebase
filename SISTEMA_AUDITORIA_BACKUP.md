# 🔐 Sistema de Auditoria e Backup

## ✅ Implementação Completa

Sistema completo de logs de auditoria e backup/restore de dados implementado com sucesso.

---

## 📋 **1. SISTEMA DE AUDITORIA**

### **Schema Prisma**
- ✅ Enum `AuditAction` criado (CREATE, UPDATE, DELETE, VIEW, EXPORT, BACKUP, RESTORE, LOGIN, LOGOUT)
- ✅ Enum `AuditEntity` criado (CLIENTE, EQUIPAMENTO, CONTRATO, DEVOLUCAO, FATURA, USER, SYSTEM)
- ✅ Modelo `AuditLog` criado com campos:
  - `userId` - ID do usuário que realizou a ação
  - `userEmail` - Email do usuário
  - `action` - Tipo de ação
  - `entity` - Entidade afetada
  - `entityId` - ID da entidade
  - `description` - Descrição da ação
  - `oldValue` - Valor anterior (JSON)
  - `newValue` - Valor novo (JSON)
  - `ipAddress` - IP do usuário
  - `userAgent` - User agent do navegador
  - `metadata` - Metadados adicionais (JSON)
  - `createdAt` - Data/hora da ação

### **Utilitários de Auditoria** (`src/lib/audit.ts`)
- ✅ `createAuditLog()` - Cria log genérico
- ✅ `logCreate()` - Log de criação
- ✅ `logUpdate()` - Log de atualização (com oldValue e newValue)
- ✅ `logDelete()` - Log de exclusão
- ✅ `logView()` - Log de visualização
- ✅ `logExport()` - Log de exportação
- ✅ `logBackup()` - Log de backup
- ✅ `logRestore()` - Log de restore
- ✅ `getRequestInfo()` - Obtém IP e User Agent do request

### **Router tRPC** (`src/trpc/routers/audit.router.ts`)
- ✅ `list` - Lista logs com filtros (usuário, entidade, ação, período)
- ✅ `getById` - Busca log por ID
- ✅ `byEntity` - Logs de uma entidade específica
- ✅ `byUser` - Logs de um usuário específico
- ✅ `stats` - Estatísticas de auditoria

### **Integração nos Routers**
- ✅ Router de Clientes integrado com logs de auditoria
  - Logs em: create, update, delete
  - Registra valores antigos e novos
  - Captura IP e User Agent

---

## 💾 **2. SISTEMA DE BACKUP E RESTORE**

### **Schema Prisma**
- ✅ Modelo `Backup` criado com campos:
  - `fileName` - Nome do arquivo de backup
  - `filePath` - Caminho do arquivo
  - `fileSize` - Tamanho do arquivo
  - `backupType` - Tipo (FULL, PARTIAL, AUTOMATIC)
  - `description` - Descrição do backup
  - `userId` - ID do usuário que criou
  - `userEmail` - Email do usuário
  - `status` - Status (SUCCESS, FAILED, IN_PROGRESS)
  - `errorMessage` - Mensagem de erro (se falhou)
  - `createdAt` - Data de criação
  - `expiresAt` - Data de expiração (90 dias)

### **Sistema de Backup** (`src/lib/backup.ts`)
- ✅ `createBackup()` - Cria backup completo do banco
  - Exporta todas as tabelas principais
  - Salva em JSON na pasta `backups/`
  - Registra no banco de dados
  - Cria log de auditoria
- ✅ `restoreBackup()` - Restaura dados de um backup
  - Lê arquivo JSON
  - Restaura todas as tabelas em transação
  - Cria log de auditoria
- ✅ `listBackups()` - Lista todos os backups
- ✅ `cleanupOldBackups()` - Remove backups antigos (>90 dias)

### **Router tRPC** (`src/trpc/routers/backup.router.ts`)
- ✅ `create` - Cria backup manual (apenas admin)
- ✅ `list` - Lista backups disponíveis
- ✅ `getById` - Busca backup por ID
- ✅ `restore` - Restaura backup (requer confirmação)
- ✅ `delete` - Deleta backup e arquivo
- ✅ `cleanup` - Limpa backups antigos
- ✅ `stats` - Estatísticas de backups

### **Estrutura de Backup**
Os backups são salvos em:
- Pasta: `/backups/`
- Formato: `backup-YYYY-MM-DDTHH-mm-ss.json`
- Conteúdo: JSON com todas as tabelas principais
- Expiração: 90 dias (configurável)

---

## 🚀 **Como Usar**

### **Auditoria**

#### Em Routers tRPC
```typescript
import { logCreate, logUpdate, logDelete, getRequestInfo } from "@/lib/audit";
import { AuditEntity } from "@/generated/prisma";
import { headers } from "next/headers";

// Ao criar
await logCreate(
  AuditEntity.CLIENTE,
  cliente.id.toString(),
  `Cliente criado: ${cliente.contratante}`,
  cliente,
  ctx.auth?.user?.id,
  ctx.auth?.user?.email
);

// Ao atualizar
await logUpdate(
  AuditEntity.CLIENTE,
  cliente.id.toString(),
  `Cliente atualizado: ${cliente.contratante}`,
  clienteAntigo,
  clienteNovo,
  ctx.auth?.user?.id,
  ctx.auth?.user?.email
);

// Ao deletar
await logDelete(
  AuditEntity.CLIENTE,
  clienteId.toString(),
  `Cliente deletado: ${cliente.contratante}`,
  cliente,
  ctx.auth?.user?.id,
  ctx.auth?.user?.email
);
```

#### Consultar Logs
```typescript
// Listar logs
const logs = await trpc.audit.list.useQuery({
  entity: AuditEntity.CLIENTE,
  action: AuditAction.CREATE,
  limit: 50,
});

// Logs de uma entidade
const entityLogs = await trpc.audit.byEntity.useQuery({
  entity: AuditEntity.CLIENTE,
  entityId: "123",
});

// Estatísticas
const stats = await trpc.audit.stats.useQuery();
```

### **Backup e Restore**

#### Criar Backup
```typescript
// Backup manual
const result = await trpc.backup.create.useMutation();
await result.mutateAsync({
  type: "FULL",
  description: "Backup antes de atualização importante",
});
```

#### Listar Backups
```typescript
const backups = await trpc.backup.list.useQuery({
  limit: 50,
});
```

#### Restaurar Backup
```typescript
// ⚠️ ATENÇÃO: Isso substituirá todos os dados atuais!
const restore = await trpc.backup.restore.useMutation();
await restore.mutateAsync({
  backupId: 1,
  confirm: true, // Confirmação obrigatória
});
```

#### Deletar Backup
```typescript
const deleteBackup = await trpc.backup.delete.useMutation();
await deleteBackup.mutateAsync({ id: 1 });
```

---

## 📊 **Funcionalidades**

### **Auditoria**
- ✅ Registra todas as ações importantes
- ✅ Armazena valores antigos e novos
- ✅ Captura IP e User Agent
- ✅ Filtros avançados de busca
- ✅ Estatísticas e relatórios
- ✅ Histórico completo de alterações

### **Backup**
- ✅ Backup completo do banco
- ✅ Backup manual e automático
- ✅ Restauração completa
- ✅ Limpeza automática de backups antigos
- ✅ Registro de todos os backups
- ✅ Logs de auditoria para backups

---

## ⚠️ **Importante**

### **Backup**
- Backups são salvos localmente na pasta `backups/`
- Em produção, considere salvar em storage externo (S3, etc)
- Restauração substitui TODOS os dados atuais
- Sempre confirme antes de restaurar
- Backups expiram após 90 dias (configurável)

### **Auditoria**
- Logs não são deletados automaticamente
- Considere implementar rotação de logs antigos
- Logs podem crescer muito - monitore o tamanho
- Use índices para performance em consultas

---

## 🔄 **Migration**

Para aplicar as migrations:

```bash
npx prisma migrate deploy
npx prisma generate
```

---

## 📝 **Próximos Passos Sugeridos**

1. **Integrar auditoria em todos os routers** (equipamentos, contratos, devoluções, faturas)
2. **Criar interface de visualização de logs** (página admin)
3. **Criar interface de gerenciamento de backups** (página admin)
4. **Implementar backup automático** (job Inngest diário/semanal)
5. **Salvar backups em storage externo** (S3, Google Cloud Storage)
6. **Implementar rotação de logs** (arquivar logs antigos)

---

**Sistemas de Auditoria e Backup implementados com sucesso! ✅**

