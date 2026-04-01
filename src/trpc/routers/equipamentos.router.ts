import { TRPCError } from "@trpc/server";
import { z } from "zod";
import prisma from "@/lib/db";
import {
  atualizarEstoqueSchema,
  createEquipamentoSchema,
  deleteEquipamentoSchema,
  getEquipamentoByIdSchema,
  searchEquipamentosSchema,
  updateEquipamentoSchema,
  verificarDisponibilidadeSchema,
} from "@/features/equipamentos/schemas/equipamento.schema";
import {
  router,
  protectedProcedure,
  createPermissionProcedure,
  Permission,
} from "../router-helpers";
import { logCreate, logUpdate, logDelete, getRequestInfo } from "@/lib/audit";
import { AuditEntity } from "@/generated/prisma/enums";
import { headers } from "next/headers";

// Helper para serializar equipamentos e converter Decimals para Numbers
function serializarEquipamento(equipamento: any) {
  return {
    ...equipamento,
    precoDiaria: equipamento.precoDiaria ? Number(equipamento.precoDiaria) : null,
    precoSemanal: equipamento.precoSemanal ? Number(equipamento.precoSemanal) : null,
    precoQuinzenal: equipamento.precoQuinzenal ? Number(equipamento.precoQuinzenal) : null,
    precoMensal: equipamento.precoMensal ? Number(equipamento.precoMensal) : null,
    valorPatrimonio: equipamento.valorPatrimonio ? Number(equipamento.valorPatrimonio) : null,
    equipamentosContratos: equipamento.equipamentosContratos?.map((ec: any) => ({
      ...ec,
      valorUnitario: ec.valorUnitario ? Number(ec.valorUnitario) : null,
      valorTotal: ec.valorTotal ? Number(ec.valorTotal) : null,
      valorFrete: ec.valorFrete ? Number(ec.valorFrete) : null,
      contrato: ec.contrato ? {
        ...ec.contrato,
        valorTotal: ec.contrato.valorTotal ? Number(ec.contrato.valorTotal) : null,
      } : null,
    })),
  };
}

const MAX_EQUIPAMENTOS_LIMIT = 100;

export const equipamentosRouter = router({
  // Listar equipamentos
  list: createPermissionProcedure(Permission.EQUIPAMENTOS_VIEW)
    .input(searchEquipamentosSchema)
    .query(async ({ input }) => {
      const { query, disponiveisApenas, limit = 50, offset = 0 } = input;
      const take = Math.min(Math.max(limit, 1), MAX_EQUIPAMENTOS_LIMIT);
      const skipValue = Math.max(offset, 0);

      const where: any = {};

      if (query) {
        where.OR = [
          { nomeEquip: { contains: query, mode: "insensitive" as const } },
          { codigoEquip: { contains: query, mode: "insensitive" as const } },
        ];
      }

      if (disponiveisApenas) {
        where.quantidadeDisp = { gt: 0 };
      }

      const [equipamentos, total] = await Promise.all([
        prisma.equipamento.findMany({
          where,
          take,
          skip: skipValue,
          orderBy: { nomeEquip: "asc" },
          select: {
            id: true,
            nomeEquip: true,
            codigoEquip: true,
            quantidadeDisp: true,
            precoDiaria: true,
            precoSemanal: true,
            precoQuinzenal: true,
            precoMensal: true,
            valorPatrimonio: true,
            _count: {
              select: {
                equipamentosContratos: true,
                devolucoes: true,
              },
            },
          },
        }),
        prisma.equipamento.count({ where }),
      ]);

      return {
        equipamentos: equipamentos.map(serializarEquipamento),
        total,
        hasMore: skipValue + take < total,
      };
    }),

  // Buscar por ID
  getById: createPermissionProcedure(Permission.EQUIPAMENTOS_VIEW)
    .input(getEquipamentoByIdSchema)
    .query(async ({ input }) => {
      const equipamento = await prisma.equipamento.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          nomeEquip: true,
          codigoEquip: true,
          quantidadeDisp: true,
          precoDiaria: true,
          precoSemanal: true,
          precoQuinzenal: true,
          precoMensal: true,
          valorPatrimonio: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              equipamentosContratos: true,
              devolucoes: true,
            },
          },
          equipamentosContratos: {
            orderBy: {
              contrato: {
                dataHoraEmissao: "desc",
              },
            },
            take: 5,
            select: {
              id: true,
              quantidadeEquip: true,
              contrato: {
                select: {
                  id: true,
                  contratoNum: true,
                  dataHoraEmissao: true,
                  statusContrato: true,
                  valorTotal: true,
                  cliente: {
                    select: {
                      id: true,
                      contratante: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!equipamento) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Equipamento não encontrado",
        });
      }

      return serializarEquipamento(equipamento);
    }),

  // Criar equipamento
  create: createPermissionProcedure(Permission.EQUIPAMENTOS_CREATE)
    .input(createEquipamentoSchema)
    .mutation(async ({ input, ctx }) => {
      // Verifica se código já existe (se fornecido)
      if (input.codigoEquip) {
        const existente = await prisma.equipamento.findFirst({
          where: { codigoEquip: input.codigoEquip },
        });

        if (existente) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Código de equipamento já cadastrado",
          });
        }
      }

      const equipamento = await prisma.equipamento.create({
        data: input,
      });

      // Log de auditoria
      const headersList = await headers();
      const requestInfo = getRequestInfo(headersList);
      await logCreate(
        AuditEntity.EQUIPAMENTO,
        equipamento.id.toString(),
        `Equipamento criado: ${equipamento.nomeEquip}`,
        equipamento,
        ctx.auth?.user?.id,
        ctx.auth?.user?.email,
        { ...requestInfo }
      );

      return serializarEquipamento(equipamento);
    }),

  // Atualizar equipamento
  update: createPermissionProcedure(Permission.EQUIPAMENTOS_UPDATE)
    .input(updateEquipamentoSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;

      // Busca valores antigos para auditoria
      const equipamentoAntigo = await prisma.equipamento.findUnique({
        where: { id },
      });

      // Se estiver alterando código, verifica duplicação
      if (data.codigoEquip) {
        const existente = await prisma.equipamento.findFirst({
          where: {
            codigoEquip: data.codigoEquip,
            NOT: { id },
          },
        });

        if (existente) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Código de equipamento já cadastrado",
          });
        }
      }

      const equipamento = await prisma.equipamento.update({
        where: { id },
        data,
      });

      // Log de auditoria
      const headersList = await headers();
      const requestInfo = getRequestInfo(headersList);
      await logUpdate(
        AuditEntity.EQUIPAMENTO,
        equipamento.id.toString(),
        `Equipamento atualizado: ${equipamento.nomeEquip}`,
        equipamentoAntigo,
        equipamento,
        ctx.auth?.user?.id,
        ctx.auth?.user?.email,
        { ...requestInfo }
      );

      return serializarEquipamento(equipamento);
    }),

  // Deletar equipamento
  delete: createPermissionProcedure(Permission.EQUIPAMENTOS_DELETE)
    .input(deleteEquipamentoSchema)
    .mutation(async ({ input, ctx }) => {
      // Verifica se equipamento está em contratos ativos
      const contratosAtivos = await prisma.equipamentoContrato.count({
        where: {
          equipamentoId: input.id,
          contrato: {
            statusContrato: {
              in: ["PENDENTE", "ASSINADO", "EM_ANDAMENTO"],
            },
          },
        },
      });

      if (contratosAtivos > 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message:
            "Não é possível excluir equipamento vinculado a contratos ativos",
        });
      }

      // Busca equipamento antes de deletar para auditoria
      const equipamento = await prisma.equipamento.findUnique({
        where: { id: input.id },
      });

      await prisma.equipamento.delete({
        where: { id: input.id },
      });

      // Log de auditoria
      if (equipamento) {
        const headersList = await headers();
        const requestInfo = getRequestInfo(headersList);
        await logDelete(
          AuditEntity.EQUIPAMENTO,
          input.id.toString(),
          `Equipamento deletado: ${equipamento.nomeEquip}`,
          equipamento,
          ctx.auth?.user?.id,
          ctx.auth?.user?.email,
          { ...requestInfo }
        );
      }

      return { success: true };
    }),

  // Atualizar estoque
  atualizarEstoque: createPermissionProcedure(Permission.EQUIPAMENTOS_UPDATE)
    .input(atualizarEstoqueSchema)
    .mutation(async ({ input }) => {
      const equipamento = await prisma.equipamento.findUnique({
        where: { id: input.equipamentoId },
      });

      if (!equipamento) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Equipamento não encontrado",
        });
      }

      let novaQuantidade = equipamento.quantidadeDisp;

      if (input.operacao === "ADICIONAR") {
        novaQuantidade += input.quantidade;
      } else {
        novaQuantidade -= input.quantidade;

        if (novaQuantidade < 0) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "Quantidade insuficiente em estoque",
          });
        }
      }

      const equipamentoAtualizado = await prisma.equipamento.update({
        where: { id: input.equipamentoId },
        data: { quantidadeDisp: novaQuantidade },
      });

      return serializarEquipamento(equipamentoAtualizado);
    }),

  // Verificar disponibilidade
  verificarDisponibilidade: createPermissionProcedure(Permission.EQUIPAMENTOS_VIEW)
    .input(verificarDisponibilidadeSchema)
    .query(async ({ input }) => {
      const equipamento = await prisma.equipamento.findUnique({
        where: { id: input.equipamentoId },
      });

      if (!equipamento) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Equipamento não encontrado",
        });
      }

      // Busca contratos que podem conflitar no período
      const contratosConflitantes = await prisma.equipamentoContrato.findMany({
        where: {
          equipamentoId: input.equipamentoId,
          contrato: {
            id: input.contratoIdExcluir
              ? { not: input.contratoIdExcluir }
              : undefined,
            statusContrato: {
              notIn: ["FINALIZADO", "CANCELADO"],
            },
            OR: [
              {
                dataHoraEmissao: { lte: input.dataFim },
                dataVenc: { gte: input.dataInicio },
              },
            ],
          },
        },
        select: {
          quantidadeEquip: true,
        },
      });

      const quantidadeReservada = contratosConflitantes.reduce(
        (acc, ec) => acc + ec.quantidadeEquip,
        0,
      );

      const quantidadeDisponivel =
        equipamento.quantidadeDisp - quantidadeReservada;

      return {
        disponivel: quantidadeDisponivel >= input.quantidade,
        quantidadeDisponivel,
        quantidadeTotal: equipamento.quantidadeDisp,
        quantidadeReservada,
      };
    }),

  // Estatísticas do equipamento
  stats: createPermissionProcedure(Permission.EQUIPAMENTOS_VIEW)
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const [
        contratosAtivos,
        historicoContratos,
        receitaTotal,
        devolucoesPendentes,
      ] = await Promise.all([
        prisma.equipamentoContrato.count({
          where: {
            equipamentoId: input.id,
            contrato: {
              statusContrato: { in: ["EM_ANDAMENTO", "ASSINADO"] },
            },
          },
        }),
        prisma.equipamentoContrato.count({
          where: { equipamentoId: input.id },
        }),
        prisma.equipamentoContrato.aggregate({
          where: { equipamentoId: input.id },
          _sum: { valorTotal: true },
        }),
        prisma.devolucao.count({
          where: {
            equipamentoId: input.id,
            statusItemDevolucao: "PENDENTE",
          },
        }),
      ]);

      return {
        contratosAtivos,
        historicoContratos,
        receitaTotal: Number(receitaTotal._sum.valorTotal || 0),
        devolucoesPendentes,
      };
    }),
});

