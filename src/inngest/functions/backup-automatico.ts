import { inngest } from "../client";
import { createBackup, BackupType } from "@/lib/backup";

/**
 * Função que cria backups automáticos do banco de dados
 * Executa diariamente às 02:00 (horário de menor uso)
 */
export const backupAutomatico = inngest.createFunction(
  {
    id: "backup-automatico",
    name: "Backup Automático Diário",
  },
  [
    { cron: "0 2 * * *" }, // Executa diariamente às 02:00
    { event: "backup-automatico" }, // Permite acionar manualmente
  ],
  async ({ step, event }) => {
    const resultado = await step.run("criar-backup-automatico", async () => {
      console.log("💾 Iniciando backup automático...");

      const result = await createBackup(
        BackupType.AUTOMATIC,
        null, // Sistema (sem usuário)
        "sistema@alg.com",
        "Backup automático diário"
      );

      if (!result.success) {
        console.error("❌ Erro ao criar backup automático:", result.error);
        throw new Error(result.error || "Erro desconhecido ao criar backup");
      }

      console.log(`✅ Backup automático criado: ${result.fileName}`);
      console.log(`📦 Tamanho: ${(Number(result.fileSize || 0) / 1024 / 1024).toFixed(2)} MB`);

      return {
        success: true,
        fileName: result.fileName,
        fileSize: result.fileSize,
        backupId: result.backupId,
      };
    });

    // Limpar backups antigos (manter apenas últimos 30 dias)
    await step.run("limpar-backups-antigos", async () => {
      const { cleanupOldBackups } = await import("@/lib/backup");
      const cleanupResult = await cleanupOldBackups();

      console.log(`🧹 Limpeza de backups: ${cleanupResult.deleted} backups antigos removidos`);

      return cleanupResult;
    });

    return {
      success: true,
      message: `Backup automático criado com sucesso: ${resultado.fileName}`,
      backupId: resultado.backupId,
    };
  }
);

