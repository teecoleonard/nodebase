/**
 * Sistema de Backup e Restore
 * 
 * Gerencia backups do banco de dados e restaurações
 */

import { writeFile, readFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import prisma from "./db";
import { logBackup, logRestore } from "./audit";
import { AuditEntity } from "@/generated/prisma/enums";

const BACKUP_DIR = join(process.cwd(), "backups");

// Garante que o diretório de backups existe
async function ensureBackupDir() {
  if (!existsSync(BACKUP_DIR)) {
    await mkdir(BACKUP_DIR, { recursive: true });
  }
}

/**
 * Tipos de backup
 */
export enum BackupType {
  FULL = "FULL",
  PARTIAL = "PARTIAL",
  AUTOMATIC = "AUTOMATIC",
}

/**
 * Cria um backup completo do banco de dados
 */
export async function createBackup(
  type: BackupType = BackupType.FULL,
  userId?: string,
  userEmail?: string,
  description?: string
): Promise<{ success: boolean; fileName?: string; error?: string }> {
  try {
    await ensureBackupDir();

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `backup-${timestamp}.json`;
    const filePath = join(BACKUP_DIR, fileName);

    // Busca todos os dados do banco
    const data = {
      timestamp: new Date().toISOString(),
      version: "1.0",
      tables: {
        clientes: await prisma.cliente.findMany(),
        equipamentos: await prisma.equipamento.findMany(),
        contratos: await prisma.contrato.findMany({
          include: {
            equipamentos: true,
          },
        }),
        devolucoes: await prisma.devolucao.findMany(),
        faturas: await prisma.fatura.findMany({
          include: {
            contratos: true,
          },
        }),
        equipamentosContratos: await prisma.equipamentoContrato.findMany(),
        faturaContratos: await prisma.faturaContrato.findMany(),
        assinaturas: await prisma.assinatura.findMany(),
        assinaturasDevolucao: await prisma.assinaturaDevolucao.findMany(),
        assinaturasFatura: await prisma.assinaturaFatura.findMany(),
      },
    };

    // Serializa para JSON
    const jsonData = JSON.stringify(data, null, 2);

    // Salva arquivo
    await writeFile(filePath, jsonData, "utf-8");

    // Obtém tamanho do arquivo
    const stats = await import("fs/promises").then((fs) =>
      fs.stat(filePath)
    );
    const fileSize = stats.size;

    // Registra backup no banco
    const backup = await prisma.backup.create({
      data: {
        fileName,
        filePath,
        fileSize: BigInt(fileSize),
        backupType: type,
        description: description || `Backup ${type.toLowerCase()}`,
        userId,
        userEmail,
        status: "SUCCESS",
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 dias
      },
    });

    // Log de auditoria
    await logBackup(
      `Backup criado: ${fileName}`,
      backup.id.toString(),
      userId,
      userEmail,
      { type, fileName, fileSize }
    );

    return { success: true, fileName };
  } catch (error: any) {
    console.error("Erro ao criar backup:", error);

    // Registra falha no banco
    try {
      await prisma.backup.create({
        data: {
          fileName: `backup-failed-${Date.now()}.json`,
          backupType: type,
          description: description || `Backup ${type.toLowerCase()} (falhou)`,
          userId,
          userEmail,
          status: "FAILED",
          errorMessage: error.message,
        },
      });
    } catch (dbError) {
      console.error("Erro ao registrar falha de backup:", dbError);
    }

    return { success: false, error: error.message };
  }
}

/**
 * Restaura dados de um backup
 */
export async function restoreBackup(
  backupId: number,
  userId?: string,
  userEmail?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Busca informações do backup
    const backup = await prisma.backup.findUnique({
      where: { id: backupId },
    });

    if (!backup) {
      return { success: false, error: "Backup não encontrado" };
    }

    if (backup.status !== "SUCCESS") {
      return { success: false, error: "Backup não está disponível" };
    }

    if (!backup.filePath || !existsSync(backup.filePath)) {
      return { success: false, error: "Arquivo de backup não encontrado" };
    }

    // Lê arquivo de backup
    const fileContent = await readFile(backup.filePath, "utf-8");
    const data = JSON.parse(fileContent);

    // Inicia transação para restaurar dados
    await prisma.$transaction(async (tx) => {
      // Limpa dados existentes (cuidado em produção!)
      // Em produção, você pode querer fazer backup antes de restaurar
      await tx.equipamentoContrato.deleteMany();
      await tx.faturaContrato.deleteMany();
      await tx.assinaturaDevolucao.deleteMany();
      await tx.assinaturaFatura.deleteMany();
      await tx.devolucao.deleteMany();
      await tx.fatura.deleteMany();
      await tx.contrato.deleteMany();
      await tx.equipamento.deleteMany();
      await tx.cliente.deleteMany();

      // Restaura clientes
      if (data.tables.clientes?.length > 0) {
        await tx.cliente.createMany({
          data: data.tables.clientes.map((c: any) => ({
            ...c,
            id: undefined, // Deixa o banco gerar novos IDs
          })),
        });
      }

      // Restaura equipamentos
      if (data.tables.equipamentos?.length > 0) {
        await tx.equipamento.createMany({
          data: data.tables.equipamentos.map((e: any) => ({
            ...e,
            id: undefined,
          })),
        });
      }

      // Restaura contratos
      if (data.tables.contratos?.length > 0) {
        for (const contrato of data.tables.contratos) {
          const { equipamentos, ...contratoData } = contrato;
          const novoContrato = await tx.contrato.create({
            data: {
              ...contratoData,
              id: undefined,
            },
          });

          // Restaura equipamentos do contrato
          if (equipamentos?.length > 0) {
            await tx.equipamentoContrato.createMany({
              data: equipamentos.map((ec: any) => ({
                ...ec,
                id: undefined,
                contratoId: novoContrato.id,
              })),
            });
          }
        }
      }

      // Restaura devoluções
      if (data.tables.devolucoes?.length > 0) {
        await tx.devolucao.createMany({
          data: data.tables.devolucoes.map((d: any) => ({
            ...d,
            id: undefined,
          })),
        });
      }

      // Restaura faturas
      if (data.tables.faturas?.length > 0) {
        for (const fatura of data.tables.faturas) {
          const { contratos, ...faturaData } = fatura;
          const novaFatura = await tx.fatura.create({
            data: {
              ...faturaData,
              id: undefined,
            },
          });

          // Restaura contratos da fatura
          if (contratos?.length > 0) {
            await tx.faturaContrato.createMany({
              data: contratos.map((fc: any) => ({
                ...fc,
                id: undefined,
                faturaId: novaFatura.id,
              })),
            });
          }
        }
      }
    });

    // Log de auditoria
    await logRestore(
      `Backup restaurado: ${backup.fileName}`,
      backup.id.toString(),
      userId,
      userEmail,
      { backupId, fileName: backup.fileName }
    );

    return { success: true };
  } catch (error: any) {
    console.error("Erro ao restaurar backup:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Lista todos os backups disponíveis
 */
export async function listBackups() {
  await ensureBackupDir();
  return await prisma.backup.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

/**
 * Remove backups antigos (mais de 90 dias)
 */
export async function cleanupOldBackups() {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const oldBackups = await prisma.backup.findMany({
    where: {
      expiresAt: {
        lte: ninetyDaysAgo,
      },
    },
  });

  for (const backup of oldBackups) {
    if (backup.filePath && existsSync(backup.filePath)) {
      try {
        await unlink(backup.filePath);
      } catch (error) {
        console.error(`Erro ao deletar arquivo ${backup.filePath}:`, error);
      }
    }

    await prisma.backup.delete({
      where: { id: backup.id },
    });
  }

  return { deleted: oldBackups.length };
}

