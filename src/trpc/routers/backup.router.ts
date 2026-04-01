import { z } from "zod";
import { router, adminProcedure } from "../router-helpers";
import {
  createBackup,
  restoreBackup,
  listBackups,
  cleanupOldBackups,
  BackupType,
} from "@/lib/backup";
import { getRequestInfo } from "@/lib/audit";
import prisma from "@/lib/db";

// Função para serializar backup (converte BigInt para Number)
function serializarBackup(backup: any) {
  return {
    ...backup,
    fileSize: backup.fileSize ? Number(backup.fileSize) : null,
  };
}

export const backupRouter = router({
  // Criar backup manual
  create: adminProcedure
    .input(
      z.object({
        type: z.enum(["FULL", "PARTIAL", "AUTOMATIC"]).default("FULL"),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const session = ctx.auth;
      const { headers } = await import("next/headers");
      const headersList = await headers();
      const requestInfo = getRequestInfo(headersList);

      const result = await createBackup(
        input.type as BackupType,
        session?.user?.id,
        session?.user?.email,
        input.description
      );

      if (!result.success) {
        throw new Error(result.error || "Erro ao criar backup");
      }

      return result;
    }),

  // Listar backups
  list: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const backups = await listBackups();
      const total = backups.length;

      return {
        backups: backups
          .slice(input.offset, input.offset + input.limit)
          .map(serializarBackup),
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  // Buscar backup por ID
  getById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const backup = await listBackups();
      const found = backup.find((b) => b.id === input.id);

      if (!found) {
        throw new Error("Backup não encontrado");
      }

      return serializarBackup(found);
    }),

  // Restaurar backup
  restore: adminProcedure
    .input(
      z.object({
        backupId: z.number(),
        confirm: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!input.confirm) {
        throw new Error(
          "Confirmação necessária. Esta ação irá substituir todos os dados atuais."
        );
      }

      const session = ctx.auth;
      const { headers } = await import("next/headers");
      const headersList = await headers();
      const requestInfo = getRequestInfo(headersList);

      const result = await restoreBackup(
        input.backupId,
        session?.user?.id,
        session?.user?.email
      );

      if (!result.success) {
        throw new Error(result.error || "Erro ao restaurar backup");
      }

      return { success: true, message: "Backup restaurado com sucesso" };
    }),

  // Deletar backup
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const { unlink } = await import("fs/promises");
      const { existsSync } = await import("fs");

      const backup = await listBackups();
      const found = backup.find((b) => b.id === input.id);

      if (!found) {
        throw new Error("Backup não encontrado");
      }

      // Deleta arquivo se existir
      if (found.filePath && existsSync(found.filePath)) {
        await unlink(found.filePath);
      }

      // Deleta registro do banco
      await prisma.backup.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Limpar backups antigos
  cleanup: adminProcedure.mutation(async () => {
    const result = await cleanupOldBackups();
    return result;
  }),

  // Estatísticas de backups
  stats: adminProcedure.query(async () => {
    const backups = await listBackups();

    const total = backups.length;
    const successful = backups.filter((b) => b.status === "SUCCESS").length;
    const failed = backups.filter((b) => b.status === "FAILED").length;
    const totalSize = backups.reduce(
      (sum, b) => sum + Number(b.fileSize || 0),
      0
    );

    return {
      total,
      successful,
      failed,
      totalSize,
      averageSize: total > 0 ? totalSize / total : 0,
    };
  }),
});

