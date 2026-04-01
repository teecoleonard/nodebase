/**
 * Sistema de Auditoria
 * 
 * Registra todas as ações importantes do sistema para rastreabilidade
 */

import prisma from "./db";
import { AuditAction, AuditEntity } from "@/generated/prisma/enums";

export interface AuditLogData {
  userId?: string;
  userEmail?: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId?: string;
  description: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
}

/**
 * Cria um log de auditoria
 */
export async function createAuditLog(data: AuditLogData) {
  try {
    // Serializa valores antigos e novos para JSON
    const oldValueStr = data.oldValue
      ? JSON.stringify(data.oldValue)
      : null;
    const newValueStr = data.newValue
      ? JSON.stringify(data.newValue)
      : null;
    const metadataStr = data.metadata
      ? JSON.stringify(data.metadata)
      : null;

    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        userEmail: data.userEmail,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        description: data.description,
        oldValue: oldValueStr,
        newValue: newValueStr,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        metadata: metadataStr,
      },
    });
  } catch (error) {
    // Não falha a operação principal se o log falhar
    console.error("Erro ao criar log de auditoria:", error);
  }
}

/**
 * Cria log de criação
 */
export async function logCreate(
  entity: AuditEntity,
  entityId: string,
  description: string,
  newValue?: any,
  userId?: string,
  userEmail?: string,
  metadata?: any
) {
  await createAuditLog({
    userId,
    userEmail,
    action: AuditAction.CREATE,
    entity,
    entityId,
    description,
    newValue,
    metadata,
  });
}

/**
 * Cria log de atualização
 */
export async function logUpdate(
  entity: AuditEntity,
  entityId: string,
  description: string,
  oldValue?: any,
  newValue?: any,
  userId?: string,
  userEmail?: string,
  metadata?: any
) {
  await createAuditLog({
    userId,
    userEmail,
    action: AuditAction.UPDATE,
    entity,
    entityId,
    description,
    oldValue,
    newValue,
    metadata,
  });
}

/**
 * Cria log de exclusão
 */
export async function logDelete(
  entity: AuditEntity,
  entityId: string,
  description: string,
  oldValue?: any,
  userId?: string,
  userEmail?: string,
  metadata?: any
) {
  await createAuditLog({
    userId,
    userEmail,
    action: AuditAction.DELETE,
    entity,
    entityId,
    description,
    oldValue,
    metadata,
  });
}

/**
 * Cria log de visualização (para ações sensíveis)
 */
export async function logView(
  entity: AuditEntity,
  entityId: string,
  description: string,
  userId?: string,
  userEmail?: string,
  metadata?: any
) {
  await createAuditLog({
    userId,
    userEmail,
    action: AuditAction.VIEW,
    entity,
    entityId,
    description,
    metadata,
  });
}

/**
 * Cria log de exportação
 */
export async function logExport(
  entity: AuditEntity,
  description: string,
  userId?: string,
  userEmail?: string,
  metadata?: any
) {
  await createAuditLog({
    userId,
    userEmail,
    action: AuditAction.EXPORT,
    entity,
    description,
    metadata,
  });
}

/**
 * Cria log de backup
 */
export async function logBackup(
  description: string,
  backupId?: string,
  userId?: string,
  userEmail?: string,
  metadata?: any
) {
  await createAuditLog({
    userId,
    userEmail,
    action: AuditAction.BACKUP,
    entity: AuditEntity.SYSTEM,
    entityId: backupId,
    description,
    metadata,
  });
}

/**
 * Cria log de restore
 */
export async function logRestore(
  description: string,
  backupId?: string,
  userId?: string,
  userEmail?: string,
  metadata?: any
) {
  await createAuditLog({
    userId,
    userEmail,
    action: AuditAction.RESTORE,
    entity: AuditEntity.SYSTEM,
    entityId: backupId,
    description,
    metadata,
  });
}

/**
 * Cria log de login
 */
export async function logLogin(
  userId?: string,
  userEmail?: string,
  metadata?: any
) {
  const requestInfo = await getRequestInfoFromHeaders();
  await createAuditLog({
    userId,
    userEmail,
    action: AuditAction.LOGIN,
    entity: AuditEntity.USER,
    entityId: userId,
    description: `Login realizado por ${userEmail || userId || "usuário desconhecido"}`,
    metadata: {
      ...metadata,
      ...requestInfo,
    },
  });
}

/**
 * Cria log de logout
 */
export async function logLogout(
  userId?: string,
  userEmail?: string,
  metadata?: any
) {
  const requestInfo = await getRequestInfoFromHeaders();
  await createAuditLog({
    userId,
    userEmail,
    action: AuditAction.LOGOUT,
    entity: AuditEntity.USER,
    entityId: userId,
    description: `Logout realizado por ${userEmail || userId || "usuário desconhecido"}`,
    metadata: {
      ...metadata,
      ...requestInfo,
    },
  });
}

/**
 * Obtém informações do request a partir dos headers do Next.js
 */
async function getRequestInfoFromHeaders(): Promise<{
  ipAddress?: string;
  userAgent?: string;
}> {
  try {
    const { headers } = await import("next/headers");
    const headersList = await headers();
    return getRequestInfo(headersList);
  } catch (error) {
    // Se não conseguir obter headers (ex: em contexto client-side), retorna vazio
    return {};
  }
}

/**
 * Obtém informações do request para auditoria
 */
export function getRequestInfo(headers: Headers): {
  ipAddress?: string;
  userAgent?: string;
} {
  const ipAddress =
    headers.get("x-forwarded-for")?.split(",")[0] ||
    headers.get("x-real-ip") ||
    undefined;
  const userAgent = headers.get("user-agent") || undefined;

  return { ipAddress, userAgent };
}

