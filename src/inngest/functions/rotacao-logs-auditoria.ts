import { inngest } from "../client";
import { rotateAuditLogs, exportAuditLogsToJSON } from "@/lib/audit-rotation";

/**
 * Função que rotaciona logs de auditoria antigos
 * Executa semanalmente aos domingos às 03:00
 * Mantém apenas os últimos 90 dias de logs
 */
export const rotacaoLogsAuditoria = inngest.createFunction(
  {
    id: "rotacao-logs-auditoria",
    name: "Rotação de Logs de Auditoria",
  },
  [
    { cron: "0 3 * * 0" }, // Executa aos domingos às 03:00
    { event: "rotacao-logs-auditoria" }, // Permite acionar manualmente
  ],
  async ({ step, event }) => {
    const daysToKeep = 90; // Manter logs dos últimos 90 dias

    // Exportar logs antes de deletar (opcional, mas recomendado)
    const exportResult = await step.run("exportar-logs-antigos", async () => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      // Exportar logs do último ano que serão deletados
      const result = await exportAuditLogsToJSON(oneYearAgo, cutoffDate);

      if (!result.success) {
        console.warn("⚠️  Falha ao exportar logs, continuando com rotação...");
      } else if (result.recordCount && result.recordCount > 0) {
        console.log(`📦 ${result.recordCount} logs exportados antes da rotação`);
      }

      return result;
    });

    // Rotacionar logs (deletar logs antigos)
    const rotationResult = await step.run("rotacionar-logs", async () => {
      const result = await rotateAuditLogs(daysToKeep);

      if (result.error) {
        console.error("❌ Erro na rotação de logs:", result.error);
        throw new Error(result.error);
      }

      console.log(`✅ Rotação concluída: ${result.deleted} logs removidos`);

      return result;
    });

    return {
      success: true,
      message: `Rotação de logs concluída: ${rotationResult.deleted} logs removidos`,
      exported: exportResult.recordCount || 0,
      deleted: rotationResult.deleted,
    };
  }
);

