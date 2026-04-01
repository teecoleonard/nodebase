import prisma from '@/lib/db';
import { createTRPCRouter, protectedProcedure } from '../init';
import { inngest } from '@/inngest/client';
import { baseProcedure } from '../init';
import { adminRouter } from "./admin.router";
import { auditRouter } from "./audit.router";
import { backupRouter } from "./backup.router";
import { clientesRouter } from "./clientes.router";
import { contratosRouter } from "./contratos.router";
import { dashboardRouter } from "./dashboard.router";
import { devolucoesRouter } from "./devolucoes.router";
import { equipamentosRouter } from "./equipamentos.router";
import { faturasRouter } from "./faturas.router";

export const appRouter = createTRPCRouter({
  // Sistema ALG Gestão - Routers principais
  dashboard: dashboardRouter,
  clientes: clientesRouter,
  equipamentos: equipamentosRouter,
  contratos: contratosRouter,
  devolucoes: devolucoesRouter,
  faturas: faturasRouter,
  admin: adminRouter,
  audit: auditRouter,
  backup: backupRouter,

  // Procedures existentes (manter compatibilidade)
  testAi: baseProcedure.mutation(async () => {
    await inngest.send({
      name: "execute/ai"
    });

    return { success: true, message: "AI executado com sucesso" };
  }),
  getWorkflows: protectedProcedure.query(({ ctx }) => {
    return prisma.workflow.findMany();
  }),
  createWorkflow: protectedProcedure.mutation(async () => {
    await inngest.send({
      name: "test/hello.world",
      data: {
        email: "leonardo@mail.com",
      },
    });
    return { success: true, message: "Workflow criado com sucesso" };
  }
),
});
// export type definition of API
export type AppRouter = typeof appRouter;