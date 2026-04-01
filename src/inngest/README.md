# 🤖 Automações com Inngest

Este diretório contém todas as funções automatizadas do sistema usando [Inngest](https://www.inngest.com/).

## 📋 Funções Disponíveis

### 1. 💰 Faturamento Automático (`faturamento-automatico.ts`)

**Execução:** Todo dia 1 de cada mês às 00:00

**Função:** Gera faturas automaticamente para contratos que estavam ativos no mês anterior.

**Lógica:**
- Busca contratos `EM_ANDAMENTO` ou `FINALIZADO` no mês anterior
- Agrupa por cliente
- Cria uma fatura por cliente com todos os contratos do período
- Vincula os contratos à fatura
- Calcula valor total automaticamente

### 2. ⚠️ Alertas de Contratos Vencendo (`alertas-contratos.ts`)

**Execução:** Diariamente às 09:00

**Função:** Verifica e alerta sobre contratos próximos do vencimento ou já vencidos.

**Categorias:**
- 🚨 **Críticos:** Vencendo em 3 dias
- ⚠️  **Avisos:** Vencendo em 7 dias
- 🔴 **Vencidos:** Já passaram da data de devolução

### 3. 📦 Alertas de Devoluções Pendentes (`alertas-devolucoes.ts`)

**Execução:** Diariamente às 10:00

**Função:** Monitora devoluções que estão pendentes há mais de 7 dias.

**Categorias:**
- ⏳ **Pendentes:** Devoluções ainda não iniciadas (7+ dias)
- 🔄 **Em Andamento:** Devoluções parciais não concluídas (7+ dias)

## 🚀 Como Usar

### 1. Iniciar o Inngest Dev Server

Em um terminal separado, execute:

```bash
npm run inngest:dev
```

Isso iniciará o painel de desenvolvimento em `http://localhost:8288`.

### 2. Iniciar a Aplicação

```bash
npm run dev
```

### 3. Acessar o Painel Inngest

Abra [http://localhost:8288](http://localhost:8288) para:
- Ver todas as funções registradas
- Testar funções manualmente
- Ver histórico de execuções
- Monitorar erros e logs

## 🧪 Testar Funções Manualmente

### Opção 1: Via Painel Inngest

1. Acesse `http://localhost:8288`
2. Clique na função desejada
3. Clique em "Send Test Event"
4. Observe os logs e resultado

### Opção 2: Via tRPC (criar endpoint)

Você pode criar endpoints tRPC para disparar as funções:

```typescript
// src/trpc/routers/admin.router.ts
import { router, publicProcedure } from "../router-helpers";
import { inngest } from "@/inngest/client";

export const adminRouter = router({
  dispararFaturamento: publicProcedure.mutation(async () => {
    await inngest.send({
      name: "gerar-faturas-automaticas",
      data: {},
    });
    return { sucesso: true };
  }),
});
```

## 📊 Logs e Monitoramento

Todas as funções produzem logs detalhados no console:

```
✅ Fatura FAT-42 gerada para João da Silva - R$ 1500.00
```

```
🚨 Resumo de Alertas - 14/11/2025
────────────────────────────────────────
📌 Contratos vencendo em 3 dias: 5
⚠️  Contratos vencendo em 7 dias: 12
🔴 Contratos já vencidos: 2
```

## 🔧 Configuração de Horários (Cron)

Para alterar os horários de execução, edite o cron pattern nas funções:

```typescript
{ cron: "0 0 1 * *" }  // Dia 1 de cada mês às 00:00
{ cron: "0 9 * * *" }  // Diariamente às 09:00
{ cron: "0 10 * * *" } // Diariamente às 10:00
```

**Formato:** `minuto hora dia mês dia-da-semana`

Exemplos:
- `"0 0 * * *"` - Meia-noite todos os dias
- `"0 9 * * 1"` - 09:00 todas as segundas-feiras
- `"0 0 1,15 * *"` - Dia 1 e 15 de cada mês às 00:00

## 🎯 Próximos Passos

### Integrar Notificações

Adicione envio de emails/SMS nas funções de alerta:

```typescript
// Exemplo com SendGrid
import sgMail from "@sendgrid/mail";

await step.run("enviar-email-alerta", async () => {
  await sgMail.send({
    to: cliente.email,
    from: "noreply@alggestao.com.br",
    subject: "⚠️ Contrato vencendo em breve",
    text: `Seu contrato ${contrato.contratoNum} vence em 3 dias!`,
  });
});
```

### Dashboard de Automações

Criar página para visualizar:
- Últimas execuções
- Próximas execuções agendadas
- Histórico de faturas geradas
- Estatísticas de alertas

## 📚 Documentação

- [Inngest Documentation](https://www.inngest.com/docs)
- [Cron Expression Generator](https://crontab.guru/)

