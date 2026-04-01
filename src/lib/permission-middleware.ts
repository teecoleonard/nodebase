/**
 * Middleware de Permissões para tRPC
 * 
 * Cria procedures com verificação de permissões
 */

import { TRPCError } from "@trpc/server";
import { Permission, UserRole, hasPermission } from "./permissions";
import prisma from "./db";

/**
 * Obtém o role do usuário a partir do ID
 */
async function getUserRole(userId: string): Promise<UserRole> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Usuário não encontrado",
    });
  }

  return user.role as UserRole;
}

/**
 * Cria um middleware que verifica se o usuário tem uma permissão específica
 */
export function requirePermission(permission: Permission) {
  return async ({ ctx, next }: any) => {
    if (!ctx.auth?.user?.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Não autenticado",
      });
    }

    const userRole = await getUserRole(ctx.auth.user.id);

    if (!hasPermission(userRole, permission)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Você não tem permissão para realizar esta ação. Permissão necessária: ${permission}`,
      });
    }

    return next({
      ctx: {
        ...ctx,
        userRole,
      },
    });
  };
}

/**
 * Cria um middleware que verifica se o usuário tem pelo menos uma das permissões
 */
export function requireAnyPermission(permissions: Permission[]) {
  return async ({ ctx, next }: any) => {
    if (!ctx.auth?.user?.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Não autenticado",
      });
    }

    const userRole = await getUserRole(ctx.auth.user.id);

    const hasAny = permissions.some((permission) =>
      hasPermission(userRole, permission)
    );

    if (!hasAny) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Você não tem permissão para realizar esta ação. Permissões necessárias: ${permissions.join(", ")}`,
      });
    }

    return next({
      ctx: {
        ...ctx,
        userRole,
      },
    });
  };
}

/**
 * Cria um middleware que verifica se o usuário é admin
 */
export function requireAdmin() {
  return async ({ ctx, next }: any) => {
    if (!ctx.auth?.user?.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Não autenticado",
      });
    }

    const userRole = await getUserRole(ctx.auth.user.id);

    if (userRole !== UserRole.ADMIN) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Apenas administradores podem realizar esta ação",
      });
    }

    return next({
      ctx: {
        ...ctx,
        userRole,
      },
    });
  };
}

/**
 * Cria um middleware que verifica se o usuário pode editar (USER ou ADMIN)
 */
export function requireCanEdit() {
  return async ({ ctx, next }: any) => {
    if (!ctx.auth?.user?.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Não autenticado",
      });
    }

    const userRole = await getUserRole(ctx.auth.user.id);

    if (userRole !== UserRole.USER && userRole !== UserRole.ADMIN) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Você não tem permissão para editar",
      });
    }

    return next({
      ctx: {
        ...ctx,
        userRole,
      },
    });
  };
}

