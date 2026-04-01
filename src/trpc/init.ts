import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { initTRPC } from '@trpc/server';
import { TRPCError } from '@trpc/server';
import { cache } from 'react';
import prisma from '@/lib/db';
import { UserRole } from '@/lib/permissions';
import {
  requirePermission,
  requireAnyPermission,
  requireAdmin,
  requireCanEdit,
} from '@/lib/permission-middleware';

export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  return { userId: 'user_123' };
});

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  // transformer: superjson,
});

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

/**
 * Procedure que requer autenticação
 */
export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Não autenticado',
    });
  }

  // Obtém o role do usuário
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  const userRole = (user?.role as UserRole) || UserRole.VIEWER;

  return next({
    ctx: {
      ...ctx,
      auth: session,
      userRole,
    },
  });
});

/**
 * Procedure que requer permissão específica
 */
export const createPermissionProcedure = (permission: any) => {
  return protectedProcedure.use(requirePermission(permission));
};

/**
 * Procedure que requer qualquer uma das permissões
 */
export const createAnyPermissionProcedure = (permissions: any[]) => {
  return protectedProcedure.use(requireAnyPermission(permissions));
};

/**
 * Procedure que requer ser admin
 */
export const adminProcedure = protectedProcedure.use(requireAdmin());

/**
 * Procedure que requer permissão de edição (USER ou ADMIN)
 */
export const editProcedure = protectedProcedure.use(requireCanEdit());