import prisma from "./db";

/**
 * Rotaciona logs de auditoria antigos
 * Arquiva logs mais antigos que o período especificado
 */
export async function rotateAuditLogs(daysToKeep: number = 90): Promise<{
  archived: number;
  deleted: number;
  error?: string;
}> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    // Contar logs que serão arquivados
    const logsToArchive = await prisma.auditLog.count({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    if (logsToArchive === 0) {
      return {
        archived: 0,
        deleted: 0,
      };
    }

    // Opção 1: Deletar logs antigos (mais simples)
    // Em produção, você pode querer exportar para um arquivo antes de deletar
    const deleteResult = await prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    console.log(`🗑️  ${deleteResult.count} logs de auditoria removidos (mais antigos que ${daysToKeep} dias)`);

    return {
      archived: 0,
      deleted: deleteResult.count,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("❌ Erro ao rotacionar logs de auditoria:", errorMessage);
    return {
      archived: 0,
      deleted: 0,
      error: errorMessage,
    };
  }
}

/**
 * Exporta logs de auditoria para JSON antes de deletar
 * Útil para manter histórico em storage externo
 */
export async function exportAuditLogsToJSON(
  startDate: Date,
  endDate: Date
): Promise<{
  success: boolean;
  filePath?: string;
  recordCount?: number;
  error?: string;
}> {
  try {
    const logs = await prisma.auditLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    if (logs.length === 0) {
      return {
        success: true,
        recordCount: 0,
      };
    }

    // Criar diretório de exportação se não existir
    const { mkdir } = await import("fs/promises");
    const { existsSync } = await import("fs");
    const { join } = await import("path");

    const exportDir = join(process.cwd(), "exports", "audit-logs");
    if (!existsSync(exportDir)) {
      await mkdir(exportDir, { recursive: true });
    }

    // Gerar nome do arquivo com data
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `audit-logs-${timestamp}.json`;
    const filePath = join(exportDir, fileName);

    // Escrever arquivo JSON
    const { writeFile } = await import("fs/promises");
    await writeFile(filePath, JSON.stringify(logs, null, 2), "utf-8");

    console.log(`📦 ${logs.length} logs exportados para: ${filePath}`);

    return {
      success: true,
      filePath,
      recordCount: logs.length,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("❌ Erro ao exportar logs de auditoria:", errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

