import { router, publicProcedure } from "../router-helpers";
import { inngest } from "@/inngest/client";

export const adminRouter = router({
  /**
   * Dispara manualmente a geração de faturas automáticas
   */
  gerarFaturasManual: publicProcedure.mutation(async () => {
    await inngest.send({
      name: "gerar-faturas-automaticas",
      data: { manual: true },
    });

    return {
      sucesso: true,
      mensagem: "Geração de faturas iniciada! Verifique o painel Inngest.",
    };
  }),

  /**
   * Dispara manualmente a verificação de contratos vencendo
   */
  verificarContratosManual: publicProcedure.mutation(async () => {
    await inngest.send({
      name: "alertas-contratos-vencendo",
      data: { manual: true },
    });

    return {
      sucesso: true,
      mensagem: "Verificação de contratos iniciada! Verifique o painel Inngest.",
    };
  }),

  /**
   * Dispara manualmente a verificação de devoluções pendentes
   */
  verificarDevolucoesManual: publicProcedure.mutation(async () => {
    await inngest.send({
      name: "alertas-devolucoes-pendentes",
      data: { manual: true },
    });

    return {
      sucesso: true,
      mensagem: "Verificação de devoluções iniciada! Verifique o painel Inngest.",
    };
  }),
});

