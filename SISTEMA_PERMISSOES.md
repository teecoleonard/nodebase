# 🔐 Sistema de Permissões e Roles

## ✅ Implementação Completa

Sistema de validação de permissões por usuário implementado com sucesso.

## 📋 O que foi implementado

### 1. **Schema Prisma**
- ✅ Enum `UserRole` criado (ADMIN, USER, VIEWER)
- ✅ Campo `role` adicionado ao modelo `User` com default `USER`
- ✅ Índice criado no campo `role` para performance
- ✅ Migration criada: `20251117162334_add_user_role`

### 2. **Sistema de Permissões**
- ✅ Arquivo `src/lib/permissions.ts` com:
  - Enum `UserRole` (ADMIN, USER, VIEWER)
  - Enum `Permission` com todas as permissões do sistema
  - Mapeamento de roles para permissões
  - Funções utilitárias de verificação

### 3. **Middleware de Permissões**
- ✅ Arquivo `src/lib/permission-middleware.ts` com:
  - `requirePermission()` - Verifica permissão específica
  - `requireAnyPermission()` - Verifica qualquer uma das permissões
  - `requireAdmin()` - Verifica se é admin
  - `requireCanEdit()` - Verifica se pode editar (USER ou ADMIN)

### 4. **Atualização do tRPC**
- ✅ `src/trpc/init.ts` atualizado com:
  - `protectedProcedure` - Inclui `userRole` no contexto
  - `adminProcedure` - Apenas admins
  - `editProcedure` - USER ou ADMIN
  - `createPermissionProcedure()` - Procedure com permissão específica
  - `createAnyPermissionProcedure()` - Procedure com múltiplas permissões

### 5. **Atualização dos Routers**
- ✅ `src/trpc/routers/clientes.router.ts` atualizado com permissões:
  - `list` - Requer `CLIENTES_VIEW`
  - `getById` - Requer `CLIENTES_VIEW`
  - `create` - Requer `CLIENTES_CREATE`
  - `update` - Requer `CLIENTES_UPDATE`
  - `delete` - Requer `CLIENTES_DELETE`
  - `buscarCEP` - Apenas autenticado
  - `stats` - Requer `CLIENTES_VIEW`

### 6. **Auth Utils**
- ✅ `src/lib/auth-utils.ts` atualizado com:
  - `getUserRole()` - Obtém role do usuário
  - `requireRole()` - Requer role específico
  - `requireAdmin()` - Requer admin
  - `requirePermission()` - Requer permissão específica

## 🎯 Roles e Permissões

### **ADMIN**
- ✅ Todas as permissões do sistema
- ✅ Pode criar, editar e deletar qualquer recurso
- ✅ Acesso total ao sistema

### **USER**
- ✅ Pode visualizar todos os recursos
- ✅ Pode criar e editar recursos
- ❌ Não pode deletar recursos
- ❌ Não pode acessar área administrativa

### **VIEWER**
- ✅ Pode apenas visualizar recursos
- ❌ Não pode criar, editar ou deletar
- ❌ Acesso somente leitura

## 📝 Permissões Disponíveis

### Clientes
- `CLIENTES_VIEW` - Visualizar clientes
- `CLIENTES_CREATE` - Criar clientes
- `CLIENTES_UPDATE` - Atualizar clientes
- `CLIENTES_DELETE` - Deletar clientes

### Equipamentos
- `EQUIPAMENTOS_VIEW` - Visualizar equipamentos
- `EQUIPAMENTOS_CREATE` - Criar equipamentos
- `EQUIPAMENTOS_UPDATE` - Atualizar equipamentos
- `EQUIPAMENTOS_DELETE` - Deletar equipamentos

### Contratos
- `CONTRATOS_VIEW` - Visualizar contratos
- `CONTRATOS_CREATE` - Criar contratos
- `CONTRATOS_UPDATE` - Atualizar contratos
- `CONTRATOS_DELETE` - Deletar contratos
- `CONTRATOS_ASSINAR` - Assinar contratos

### Devoluções
- `DEVOLUCOES_VIEW` - Visualizar devoluções
- `DEVOLUCOES_CREATE` - Criar devoluções
- `DEVOLUCOES_UPDATE` - Atualizar devoluções
- `DEVOLUCOES_CONFIRMAR` - Confirmar devoluções

### Faturas
- `FATURAS_VIEW` - Visualizar faturas
- `FATURAS_CREATE` - Criar faturas
- `FATURAS_UPDATE` - Atualizar faturas
- `FATURAS_PAGAR` - Registrar pagamentos
- `FATURAS_CANCELAR` - Cancelar faturas
- `FATURAS_GERAR_AUTOMATICAS` - Gerar faturas automáticas

### Dashboard
- `DASHBOARD_VIEW` - Visualizar dashboard

### Admin
- `ADMIN_VIEW` - Acessar área administrativa
- `ADMIN_MANAGE_USERS` - Gerenciar usuários
- `ADMIN_MANAGE_AUTOMACOES` - Gerenciar automações

## 🚀 Como Usar

### Em Routers tRPC

```typescript
import {
  router,
  createPermissionProcedure,
  Permission,
  adminProcedure,
  editProcedure,
} from "../router-helpers";

export const meuRouter = router({
  // Requer permissão específica
  list: createPermissionProcedure(Permission.CLIENTES_VIEW)
    .input(schema)
    .query(async ({ input }) => {
      // ...
    }),

  // Apenas admin
  delete: adminProcedure
    .input(schema)
    .mutation(async ({ input }) => {
      // ...
    }),

  // USER ou ADMIN
  update: editProcedure
    .input(schema)
    .mutation(async ({ input }) => {
      // ...
    }),
});
```

### Em Páginas Next.js

```typescript
import { requirePermission, requireAdmin } from "@/lib/auth-utils";
import { Permission } from "@/lib/permissions";

// Requer permissão específica
export default async function MinhaPage() {
  await requirePermission(Permission.CLIENTES_VIEW);
  // ...
}

// Requer admin
export default async function AdminPage() {
  await requireAdmin();
  // ...
}
```

## 📦 Próximos Passos

Para aplicar permissões nos outros routers, siga o mesmo padrão usado em `clientes.router.ts`:

1. Importar `createPermissionProcedure` e `Permission`
2. Substituir `publicProcedure` por `createPermissionProcedure(Permission.XXX)`
3. Aplicar permissões apropriadas para cada endpoint

## ⚠️ Importante

- Todos os usuários existentes terão role `USER` por padrão
- Apenas admins podem deletar recursos
- VIEWER tem acesso somente leitura
- Permissões são verificadas tanto no backend (tRPC) quanto no frontend (páginas)

## 🔄 Migration

Para aplicar a migration:

```bash
npx prisma migrate deploy
```

Ou em desenvolvimento:

```bash
npx prisma migrate dev
```

---

**Sistema de permissões implementado com sucesso! ✅**

