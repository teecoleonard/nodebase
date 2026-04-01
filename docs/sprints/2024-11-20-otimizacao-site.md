## Escopo Geral

Aplicar as otimizações em *todo o site*: clientes, contratos, faturas, devoluções, dashboard e módulos auxiliares. A ordem abaixo pode ser ajustada conforme os resultados de cada sprint.

---

## Sprint 1 – Diagnóstico e consultas mais leves (5 dias úteis)

1. Ativar logs de duração no Prisma (`log: ["query"]`) e instrumentar métricas simples (tempo médio, p95) para todos os routers tRPC.
2. Revisar consultas das principais rotas (`clientes.list`, `contratos.list`, `faturas.list`, `dashboard` etc.):
   - Limitar campos (`select`) aos usados na UI.
   - Garantir paginação obrigatória com parâmetros expostos no front.
3. Criar/ajustar índices no Postgres para as colunas de filtro recorrentes (status, datas, clienteId, números de documento).
4. No front, ajustar hooks React Query que usam `refetchInterval` constante para `staleTime` + `refetchOnWindowFocus`/botões manuais.
5. Relatório consolidado com pontos críticos e ganhos observados.

## Sprint 2 – Cache e pré-processamento (5 dias úteis)

1. Introduzir Redis/KV como cache de leitura para:
   - `getById` (clientes, contratos, faturas)
   - Dashboards/resumos
   - Listagens paginadas com filtros estáveis
2. Incluir invalidadores nos pontos de mutação (create/update/delete/pagar/cancelar).
3. Criar materialized views ou tabelas agregadas para estatísticas (dashboard, totais por status) atualizadas via Inngest/cron.
4. Ajustar o front para consumir os endpoints cacheados (React Query com `staleTime` estendido e fallback ao cache em erro).
5. Implementar prefetch/lazy-loading nas páginas de maior densidade (faturas, contratos, dashboard).

## Sprint 3 – Otimizações avançadas & UX (opcional / conforme resultado)

1. Paralelizar jobs pesados (geração de faturas/relatórios) via Inngest filas e expor status no painel administrativo.
2. Aplicar paginação incremental (infinite scroll/“Ver mais”) nas listagens volumosas.
3. Implementar monitoramento contínuo: dashboards de métricas, alertas de lentidão e health checks das filas/jobs.

