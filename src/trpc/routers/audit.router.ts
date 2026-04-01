import { z } from "zod";
import prisma from "@/lib/db";
import { router, adminProcedure, createPermissionProcedure, Permission } from "../router-helpers";
import { baseProcedure } from "../init";
import { AuditAction, AuditEntity } from "@/generated/prisma/enums";
import { logLogin, logLogout } from "@/lib/audit";
import { getRequestInfo } from "@/lib/audit";

export const auditRouter = router({
  // Listar logs de auditoria
  list: adminProcedure
    .input(
      z.object({
        userId: z.string().optional(),
        entity: z.nativeEnum(AuditEntity).optional(),
        action: z.nativeEnum(AuditAction).optional(),
        entityId: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const {
        userId,
        entity,
        action,
        entityId,
        startDate,
        endDate,
        limit,
        offset,
      } = input;

      const where: any = {};

      if (userId) where.userId = userId;
      if (entity) where.entity = entity;
      if (action) where.action = action;
      if (entityId) where.entityId = entityId;

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = startDate;
        if (endDate) where.createdAt.lte = endDate;
      }

      const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          take: limit,
          skip: offset,
          orderBy: { createdAt: "desc" },
        }),
        prisma.auditLog.count({ where }),
      ]);

      return {
        logs,
        total,
        hasMore: offset + limit < total,
      };
    }),

  // Buscar log por ID
  getById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const log = await prisma.auditLog.findUnique({
        where: { id: input.id },
      });

      if (!log) {
        throw new Error("Log não encontrado");
      }

      return log;
    }),

  // Logs por entidade
  byEntity: adminProcedure
    .input(
      z.object({
        entity: z.nativeEnum(AuditEntity),
        entityId: z.string(),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      const logs = await prisma.auditLog.findMany({
        where: {
          entity: input.entity,
          entityId: input.entityId,
        },
        take: input.limit,
        orderBy: { createdAt: "desc" },
      });

      return logs;
    }),

  // Logs por usuário
  byUser: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ input }) => {
      const logs = await prisma.auditLog.findMany({
        where: { userId: input.userId },
        take: input.limit,
        orderBy: { createdAt: "desc" },
      });

      return logs;
    }),

  // Estatísticas de auditoria
  stats: adminProcedure.query(async () => {
    const [
      totalLogs,
      logsToday,
      logsByAction,
      logsByEntity,
      recentLogs,
    ] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.auditLog.groupBy({
        by: ["action"],
        _count: true,
      }),
      prisma.auditLog.groupBy({
        by: ["entity"],
        _count: true,
      }),
      prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      totalLogs,
      logsToday,
      logsByAction: logsByAction.map((item) => ({
        action: item.action,
        count: item._count,
      })),
      logsByEntity: logsByEntity.map((item) => ({
        entity: item.entity,
        count: item._count,
      })),
      recentLogs,
    };
  }),

  // Registrar log de login (pode ser chamado após login bem-sucedido)
  // Usa baseProcedure para permitir chamada mesmo sem autenticação completa
  logLogin: baseProcedure
    .input(
      z.object({
        userId: z.string().optional(),
        userEmail: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Se não tiver userId, tenta obter da sessão
      let userId = input.userId;
      let userEmail = input.userEmail;

      if (!userId || !userEmail) {
        try {
          const { auth } = await import("@/lib/auth");
          const { headers } = await import("next/headers");
          const headersList = await headers();
          const session = await auth.api.getSession({
            headers: headersList,
          });
          
          if (session?.user) {
            userId = userId || session.user.id;
            userEmail = userEmail || session.user.email;
          }
        } catch (error) {
          // Ignora erro se não conseguir obter sessão
        }
      }

      // Se ainda não tiver userId, não registra o log (mas não falha)
      if (!userId) {
        console.warn("Não foi possível obter userId para registrar log de login");
        return { success: false, message: "userId não fornecido" };
      }

      const { headers } = await import("next/headers");
      const headersList = await headers();
      const requestInfo = getRequestInfo(headersList);

      await logLogin(
        userId,
        userEmail,
        requestInfo
      );

      return { success: true };
    }),

  // Registrar log de logout (pode ser chamado antes do logout)
  // Usa baseProcedure para permitir chamada mesmo durante logout
  logLogout: baseProcedure
    .input(
      z.object({
        userId: z.string(),
        userEmail: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { headers } = await import("next/headers");
      const headersList = await headers();
      const requestInfo = getRequestInfo(headersList);

      await logLogout(
        input.userId,
        input.userEmail,
        requestInfo
      );

      return { success: true };
    }),
});

