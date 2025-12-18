import prisma from '@/lib/db';
import { createTRPCRouter, protectedProcedure } from '../init';
import { inngest } from '@/inngest/client';
import { baseProcedure } from '../init';
import { TRPCError } from '@trpc/server';

export const appRouter = createTRPCRouter({
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