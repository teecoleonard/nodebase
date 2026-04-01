import { inngest } from "../client";
import prisma from "@/lib/db";

/**
 * Função que verifica devoluções pendentes e envia lembretes
 */
export const alertasDevolucoesPendentes = inngest.createFunction(
  {
    id: "alertas-devolucoes-pendentes",
    name: "Alertas de Devoluções Pendentes",
  },
  // Aceita tanto CRON quanto eventos manuais
  [
    { cron: "0 10 * * *" }, // Executa diariamente às 10:00
    { event: "alertas-devolucoes-pendentes" }, // Permite acionar manualmente
  ],
  async ({ step, event }) => {
    const hoje = new Date();

    // Devoluções pendentes há mais de 7 dias
    const seteDiasAtras = new Date(hoje);
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

    const devolucoesPendentes = await step.run("buscar-devolucoes-pendentes", async () => {
      return await prisma.devolucao.findMany({
        where: {
          statusItemDevolucao: "PENDENTE",
          createdAt: {
            lte: seteDiasAtras,
          },
        },
        include: {
          contrato: {
            include: {
              cliente: {
                select: {
                  id: true,
                  contratante: true,
                  email: true,
                  telefone: true,
                },
              },
            },
          },
        },
      });
    });

    // Devoluções parciais (iniciadas mas não concluídas)
    const devolucoesEmAndamento = await step.run("buscar-devolucoes-parciais", async () => {
      return await prisma.devolucao.findMany({
        where: {
          statusItemDevolucao: "PARCIAL",
          createdAt: {
            lte: seteDiasAtras,
          },
        },
        include: {
          contrato: {
            include: {
              cliente: {
                select: {
                  id: true,
                  contratante: true,
                  email: true,
                  telefone: true,
                },
              },
            },
          },
        },
      });
    });

    console.log(`
📦 Resumo de Devoluções - ${hoje.toLocaleDateString("pt-BR", { timeZone: 'America/Sao_Paulo' })}
────────────────────────────────────────
⏳ Devoluções pendentes (7+ dias): ${devolucoesPendentes.length}
🔄 Devoluções em andamento (7+ dias): ${devolucoesEmAndamento.length}
    `);

    // Aqui você pode integrar com notificações
    // Por exemplo: enviar email/SMS para os clientes lembrando da devolução

    return {
      sucesso: true,
      data: hoje.toISOString(),
      pendentes: devolucoesPendentes.length,
      emAndamento: devolucoesEmAndamento.length,
      detalhes: {
        pendentes: devolucoesPendentes.map((d) => ({
          devolucaoId: d.id,
          contratoNum: d.contrato.contratoNum,
          cliente: d.contrato.cliente.contratante,
          diasPendente: Math.floor(
            (hoje.getTime() - new Date(d.createdAt).getTime()) / (1000 * 60 * 60 * 24)
          ),
        })),
        emAndamento: devolucoesEmAndamento.map((d) => ({
          devolucaoId: d.id,
          contratoNum: d.contrato.contratoNum,
          cliente: d.contrato.cliente.contratante,
          diasEmAndamento: Math.floor(
            (hoje.getTime() - new Date(d.createdAt).getTime()) / (1000 * 60 * 60 * 24)
          ),
        })),
      },
    };
  }
);

