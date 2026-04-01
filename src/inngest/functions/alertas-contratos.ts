import { inngest } from "../client";
import prisma from "@/lib/db";

/**
 * Função que verifica contratos próximos do vencimento
 * e envia alertas
 */
export const alertasContratosVencendo = inngest.createFunction(
  {
    id: "alertas-contratos-vencendo",
    name: "Alertas de Contratos Vencendo",
  },
  // Aceita tanto CRON quanto eventos manuais
  [
    { cron: "0 9 * * *" }, // Executa diariamente às 09:00
    { event: "alertas-contratos-vencendo" }, // Permite acionar manualmente
  ],
  async ({ step, event }) => {
    const hoje = new Date();
    const em3Dias = new Date(hoje);
    em3Dias.setDate(em3Dias.getDate() + 3);

    const em7Dias = new Date(hoje);
    em7Dias.setDate(em7Dias.getDate() + 7);

    // Contratos vencendo em 3 dias
    const contratosCriticos = await step.run("buscar-contratos-3-dias", async () => {
      return await prisma.contrato.findMany({
        where: {
          statusContrato: "EM_ANDAMENTO",
          dataVenc: {
            gte: hoje,
            lte: em3Dias,
          },
        },
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
      });
    });

    // Contratos vencendo em 7 dias
    const contratosAvisos = await step.run("buscar-contratos-7-dias", async () => {
      return await prisma.contrato.findMany({
        where: {
          statusContrato: "EM_ANDAMENTO",
          dataVenc: {
            gt: em3Dias,
            lte: em7Dias,
          },
        },
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
      });
    });

    // Contratos já vencidos
    const contratosVencidos = await step.run("buscar-contratos-vencidos", async () => {
      return await prisma.contrato.findMany({
        where: {
          statusContrato: "EM_ANDAMENTO",
          dataVenc: {
            lt: hoje,
          },
        },
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
      });
    });

    console.log(`
🚨 Resumo de Alertas - ${hoje.toLocaleDateString("pt-BR", { timeZone: 'America/Sao_Paulo' })}
────────────────────────────────────────
📌 Contratos vencendo em 3 dias: ${contratosCriticos.length}
⚠️  Contratos vencendo em 7 dias: ${contratosAvisos.length}
🔴 Contratos já vencidos: ${contratosVencidos.length}
    `);

    // Aqui você pode integrar com serviços de email/SMS/notificações
    // Por exemplo: SendGrid, Twilio, Firebase Cloud Messaging, etc.

    return {
      sucesso: true,
      data: hoje.toISOString(),
      criticos: contratosCriticos.length,
      avisos: contratosAvisos.length,
      vencidos: contratosVencidos.length,
      detalhes: {
        criticos: contratosCriticos.map((c) => ({
          contratoNum: c.contratoNum,
          cliente: c.cliente.contratante,
          vencimento: c.dataVenc,
        })),
        vencidos: contratosVencidos.map((c) => ({
          contratoNum: c.contratoNum,
          cliente: c.cliente.contratante,
          vencimento: c.dataVenc,
          diasAtraso: Math.floor(
            (hoje.getTime() - new Date(c.dataVenc).getTime()) / (1000 * 60 * 60 * 24)
          ),
        })),
      },
    };
  }
);

