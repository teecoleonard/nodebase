import { TRPCError } from "@trpc/server";
import { z } from "zod";
import prisma from "@/lib/db";
import {
  assinarDevolucaoSchema,
  confirmarDevolucaoSchema,
  finalizarDevolucaoSchema,
  getDevolucaoByIdSchema,
  listDevolucoesSchema,
  registrarDevolucaoSchema,
} from "@/features/devolucoes/schemas/devolucao.schema";
import {
  router,
  protectedProcedure,
  createPermissionProcedure,
  Permission,
} from "../router-helpers";
import { logCreate, logUpdate, getRequestInfo } from "@/lib/audit";
import { AuditEntity } from "@/generated/prisma/enums";
import { headers } from "next/headers";

// Helper para serializar devoluções e converter Decimals para Numbers
function serializarDevolucao(devolucao: any) {
  return {
    ...devolucao,
    contrato: devolucao.contrato
      ? {
          ...devolucao.contrato,
          valorTotal: devolucao.contrato.valorTotal
            ? Number(devolucao.contrato.valorTotal)
            : null,
        }
      : null,
    equipamento: devolucao.equipamento
      ? {
          ...devolucao.equipamento,
          precoDiaria: devolucao.equipamento.precoDiaria
            ? Number(devolucao.equipamento.precoDiaria)
            : null,
          precoSemanal: devolucao.equipamento.precoSemanal
            ? Number(devolucao.equipamento.precoSemanal)
            : null,
          precoQuinzenal: devolucao.equipamento.precoQuinzenal
            ? Number(devolucao.equipamento.precoQuinzenal)
            : null,
          precoMensal: devolucao.equipamento.precoMensal
            ? Number(devolucao.equipamento.precoMensal)
            : null,
          valorPatrimonio: devolucao.equipamento.valorPatrimonio
            ? Number(devolucao.equipamento.valorPatrimonio)
            : null,
        }
      : null,
  };
}

export const devolucoesRouter = router({
  // Listar devoluções
  list: createPermissionProcedure(Permission.DEVOLUCOES_VIEW)
    .input(listDevolucoesSchema)
    .query(async ({ input }) => {
      const {
        contratoId,
        clienteId,
        equipamentoId,
        status,
        dataInicio,
        dataFim,
        query,
        limit,
        offset,
      } = input;

      const where: any = {};

      if (contratoId) where.contratoId = contratoId;
      if (clienteId) where.clienteId = clienteId;
      if (equipamentoId) where.equipamentoId = equipamentoId;
      if (status) where.statusItemDevolucao = status;
      if (query) {
        where.OR = [
          { devNum: { contains: query, mode: "insensitive" as const } },
          { cliente: { contratante: { contains: query, mode: "insensitive" as const } } },
          { equipamento: { nomeEquip: { contains: query, mode: "insensitive" as const } } },
        ];
      }

      if (dataInicio && dataFim) {
        where.dataDevolucaoPrevista = {
          gte: dataInicio,
          lte: dataFim,
        };
      }

      const [devolucoes, total] = await Promise.all([
        prisma.devolucao.findMany({
          where,
          take: limit,
          skip: offset,
          orderBy: { dataDevolucaoPrevista: "desc" },
          include: {
            contrato: {
              include: {
                cliente: true,
              },
            },
            equipamento: true,
            cliente: true,
          },
        }),
        prisma.devolucao.count({ where }),
      ]);

      return {
        devolucoes: devolucoes.map(serializarDevolucao),
        total,
        hasMore: offset + limit < total,
      };
    }),

  // Buscar devolução por ID
  getById: createPermissionProcedure(Permission.DEVOLUCOES_VIEW)
    .input(getDevolucaoByIdSchema)
    .query(async ({ input }) => {
      const devolucao = await prisma.devolucao.findUnique({
        where: { id: input.id },
        include: {
          contrato: {
            include: {
              cliente: true,
            },
          },
          equipamento: true,
          cliente: true,
          assinaturas: true,
        },
      });

      if (!devolucao) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Devolução não encontrada",
        });
      }

      return serializarDevolucao(devolucao);
    }),

  // Confirmar recebimento de devolução
  confirmar: createPermissionProcedure(Permission.DEVOLUCOES_CONFIRMAR)
    .input(confirmarDevolucaoSchema)
    .mutation(async ({ input, ctx }) => {
      const devolucao = await prisma.devolucao.findUnique({
        where: { id: input.devolucaoId },
        include: {
          equipamento: true,
        },
      });

      if (!devolucao) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Devolução não encontrada",
        });
      }

      if (devolucao.statusItemDevolucao === "DEVOLVIDO") {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Devolução já foi finalizada",
        });
      }

      // Valida quantidade
      if (input.quantidadeDevolvida > devolucao.quantidadeContratada) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Quantidade devolvida não pode ser maior que a contratada",
        });
      }

      const quantidadeTotalDevolvida =
        devolucao.quantidadeDevolvida + input.quantidadeDevolvida;

      // Determina novo status
      let novoStatus: "PENDENTE" | "PARCIAL" | "DEVOLVIDO" = "PENDENTE";
      if (quantidadeTotalDevolvida === devolucao.quantidadeContratada) {
        novoStatus = "DEVOLVIDO";
      } else if (quantidadeTotalDevolvida > 0) {
        novoStatus = "PARCIAL";
      }

      // Busca o contrato e todas as devoluções para verificar status
      const contrato = await prisma.contrato.findUnique({
        where: { id: devolucao.contratoId },
        include: {
          devolucoes: true,
        },
      });

      if (!contrato) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contrato não encontrado",
        });
      }

      // Atualiza devolução e estoque, e verifica status do contrato
      await prisma.$transaction(async (tx) => {
        await tx.devolucao.update({
          where: { id: input.devolucaoId },
          data: {
            quantidadeDevolvida: quantidadeTotalDevolvida,
            statusItemDevolucao: novoStatus,
            dataDevolucaoEfetiva:
              novoStatus === "DEVOLVIDO" ? new Date() : undefined,
            observacaoItemDevolucao: input.observacao,
          },
        });

        // Devolve equipamentos ao estoque
        await tx.equipamento.update({
          where: { id: devolucao.equipamentoId },
          data: {
            quantidadeDisp: {
              increment: input.quantidadeDevolvida,
            },
          },
        });

        // Busca todas as devoluções atualizadas do contrato
        const todasDevolucoes = await tx.devolucao.findMany({
          where: { contratoId: devolucao.contratoId },
        });

        // Verifica se todas as devoluções foram completadas
        const todasCompletas = todasDevolucoes.every(
          (d) => d.statusItemDevolucao === "DEVOLVIDO"
        );

        // Verifica se há alguma devolução parcial
        const temParcial = todasDevolucoes.some(
          (d) => d.statusItemDevolucao === "PARCIAL"
        );

        // Atualiza status do contrato
        let novoStatusContrato = contrato.statusContrato;
        if (todasCompletas && contrato.statusContrato !== "FINALIZADO") {
          novoStatusContrato = "FINALIZADO";
        } else if (temParcial) {
          // Se há devolução parcial, atualiza status apenas se ainda não estiver em DEVOLVIDO_PARCIALMENTE
          if (contrato.statusContrato === "EM_ANDAMENTO") {
            novoStatusContrato = "DEVOLVIDO_PARCIALMENTE";
          }
        }

        if (novoStatusContrato !== contrato.statusContrato) {
          await tx.contrato.update({
            where: { id: devolucao.contratoId },
            data: {
              statusContrato: novoStatusContrato,
            },
          });
        }
      });

      // Busca devolução atualizada com relações para serializar
      const devolucaoAtualizada = await prisma.devolucao.findUnique({
        where: { id: input.devolucaoId },
        include: {
          contrato: {
            include: {
              cliente: true,
            },
          },
          equipamento: true,
          cliente: true,
        },
      });

      // Log de auditoria
      const headersList = await headers();
      const requestInfo = getRequestInfo(headersList);
      await logUpdate(
        AuditEntity.DEVOLUCAO,
        devolucaoAtualizada!.id.toString(),
        `Devolução confirmada: ${devolucaoAtualizada!.devNum}`,
        devolucao,
        devolucaoAtualizada,
        ctx.auth?.user?.id,
        ctx.auth?.user?.email,
        { ...requestInfo, quantidadeDevolvida: input.quantidadeDevolvida }
      );

      return serializarDevolucao(devolucaoAtualizada!);
    }),

  // Finalizar devolução (sem confirmação de quantidade)
  finalizar: createPermissionProcedure(Permission.DEVOLUCOES_CONFIRMAR)
    .input(finalizarDevolucaoSchema)
    .mutation(async ({ input }) => {
      const devolucao = await prisma.devolucao.findUnique({
        where: { id: input.devolucaoId },
      });

      if (!devolucao) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Devolução não encontrada",
        });
      }

      if (devolucao.statusItemDevolucao === "DEVOLVIDO") {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Devolução já foi finalizada",
        });
      }

      // Finaliza devolução e restaura estoque pendente
      const quantidadePendente =
        devolucao.quantidadeContratada - devolucao.quantidadeDevolvida;

      await prisma.$transaction([
        prisma.devolucao.update({
          where: { id: input.devolucaoId },
          data: {
            quantidadeDevolvida: devolucao.quantidadeContratada,
            // ✅ IMPORTANTE: Não enviar statusItemDevolucao manualmente!
            // O backend recalcula automaticamente: 100% devolvido = "DEVOLVIDO"
            dataDevolucaoEfetiva: new Date(),
          },
        }),
        prisma.equipamento.update({
          where: { id: devolucao.equipamentoId },
          data: {
            quantidadeDisp: {
              increment: quantidadePendente,
            },
          },
        }),
      ]);

      // Busca devolução atualizada com relações para serializar
      const devolucaoAtualizada = await prisma.devolucao.findUnique({
        where: { id: input.devolucaoId },
        include: {
          contrato: {
            include: {
              cliente: true,
            },
          },
          equipamento: true,
          cliente: true,
        },
      });

      return serializarDevolucao(devolucaoAtualizada!);
    }),

  // Assinar devolução
  assinar: createPermissionProcedure(Permission.DEVOLUCOES_UPDATE)
    .input(assinarDevolucaoSchema)
    .mutation(async ({ input }) => {
      const devolucao = await prisma.devolucao.findUnique({
        where: { id: input.devolucaoId },
      });

      if (!devolucao) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Devolução não encontrada",
        });
      }

      if (devolucao.statusAssinatura === "ASSINADO") {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Devolução já foi assinada",
        });
      }

      // Salva assinatura
      const assinatura = await prisma.assinaturaDevolucao.create({
        data: {
          devolucaoId: input.devolucaoId,
          contratoId: devolucao.contratoId,
          nomeArquivo: input.nomeArquivo,
        },
      });

      // Atualiza devolução
      await prisma.devolucao.update({
        where: { id: input.devolucaoId },
        data: {
          statusAssinatura: "ASSINADO",
          dataAssinatura: new Date(),
        },
      });

      // Busca devolução atualizada com relações para serializar
      const devolucaoAtualizada = await prisma.devolucao.findUnique({
        where: { id: input.devolucaoId },
        include: {
          contrato: {
            include: {
              cliente: true,
            },
          },
          equipamento: true,
          cliente: true,
        },
      });

      return serializarDevolucao(devolucaoAtualizada!);
    }),

  // Dashboard de devoluções
  dashboard: createPermissionProcedure(Permission.DEVOLUCOES_VIEW).query(async () => {
    const hoje = new Date();
    const inicioDaSemana = new Date(hoje);
    inicioDaSemana.setDate(hoje.getDate() - hoje.getDay());

    const [
      totalPendentes,
      atrasadas,
      vencendoEstaSemana,
      parciais,
      concluidas,
    ] = await Promise.all([
      prisma.devolucao.count({
        where: { statusItemDevolucao: "PENDENTE" },
      }),
      prisma.devolucao.count({
        where: {
          statusItemDevolucao: { in: ["PENDENTE", "PARCIAL"] },
          dataDevolucaoPrevista: { lt: hoje },
        },
      }),
      prisma.devolucao.count({
        where: {
          statusItemDevolucao: { in: ["PENDENTE", "PARCIAL"] },
          dataDevolucaoPrevista: {
            gte: inicioDaSemana,
            lte: new Date(inicioDaSemana.getTime() + 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.devolucao.count({
        where: { statusItemDevolucao: "PARCIAL" },
      }),
      prisma.devolucao.count({
        where: { statusItemDevolucao: "DEVOLVIDO" },
      }),
    ]);

    return {
      totalPendentes,
      atrasadas,
      vencendoEstaSemana,
      parciais,
      concluidas,
    };
  }),

  // Devoluções por contrato
  porContrato: createPermissionProcedure(Permission.DEVOLUCOES_VIEW)
    .input(z.object({ contratoId: z.number() }))
    .query(async ({ input }) => {
      const devolucoes = await prisma.devolucao.findMany({
        where: { contratoId: input.contratoId },
        include: {
          equipamento: true,
        },
        orderBy: { dataDevolucaoPrevista: "asc" },
      });

      const totalItens = devolucoes.length;
      const itensPendentes = devolucoes.filter(
        (d) => d.statusItemDevolucao === "PENDENTE",
      ).length;
      const itensDevolvidos = devolucoes.filter(
        (d) => d.statusItemDevolucao === "DEVOLVIDO",
      ).length;

      return {
        devolucoes: devolucoes.map(serializarDevolucao),
        totalItens,
        itensPendentes,
        itensDevolvidos,
        percentualConclusao:
          totalItens > 0 ? (itensDevolvidos / totalItens) * 100 : 0,
      };
    }),

  // Registrar devolução de contrato
  registrar: createPermissionProcedure(Permission.DEVOLUCOES_CREATE)
    .input(registrarDevolucaoSchema)
    .mutation(async ({ input, ctx }) => {
      const { contratoId, equipamentos, assinaturaBase64 } = input;

      // Buscar contrato
      const contrato = await prisma.contrato.findUnique({
        where: { id: contratoId },
        include: {
          equipamentos: {
            include: {
              equipamento: true,
            },
          },
        },
      });

      if (!contrato) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contrato não encontrado",
        });
      }

      if (contrato.statusContrato !== "EM_ANDAMENTO") {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Apenas contratos em andamento podem ter devoluções",
        });
      }

      // Processar devolução em transação
      const resultado = await prisma.$transaction(async (tx) => {
        // Gerar número de devolução
        const devNum = `DEV-${contratoId}-${Date.now()}`;

        // Criar assinatura da devolução
        const assinatura = await tx.assinaturaDevolucao.create({
          data: {
            nomeArquivo: `devolucao_${devNum}_${Date.now()}.png`,
          },
        });

        // Criar devoluções para cada equipamento
        const devolucoesCreated = [];

        for (const equip of equipamentos) {
          const equipContrato = contrato.equipamentos.find(
            (ec) => ec.equipamentoId === equip.equipamentoId
          );

          if (!equipContrato) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Equipamento ${equip.equipamentoId} não está neste contrato`,
            });
          }

          // Verificar se já existe devolução para este equipamento
          const devolucaoExistente = await tx.devolucao.findFirst({
            where: {
              contratoId,
              equipamentoId: equip.equipamentoId,
            },
          });

          let devolucao;

          if (devolucaoExistente) {
            // Atualizar devolução existente
            devolucao = await tx.devolucao.update({
              where: { id: devolucaoExistente.id },
              data: {
                quantidadeDevolvida: {
                  increment: equip.quantidadeDevolvida,
                },
                dataDevolucaoEfetiva: new Date(),
                observacaoItemDevolucao: equip.observacao,
                statusItemDevolucao:
                  devolucaoExistente.quantidadeDevolvida +
                    equip.quantidadeDevolvida >=
                  equipContrato.quantidadeEquip
                    ? "DEVOLVIDO"
                    : "PARCIAL",
                statusAssinatura: "ASSINADO",
                dataAssinatura: new Date(),
              },
            });
          } else {
            // Criar nova devolução
            devolucao = await tx.devolucao.create({
              data: {
                contratoId,
                clienteId: contrato.clienteId,
                equipamentoId: equip.equipamentoId,
                devNum: `${devNum}-${equip.equipamentoId}`,
                dataDevolucaoPrevista: contrato.dataVenc,
                dataDevolucaoEfetiva: new Date(),
                quantidadeContratada: equipContrato.quantidadeEquip,
                quantidadeDevolvida: equip.quantidadeDevolvida,
                observacaoItemDevolucao: equip.observacao,
                statusItemDevolucao:
                  equip.quantidadeDevolvida >= equipContrato.quantidadeEquip
                    ? "DEVOLVIDO"
                    : "PARCIAL",
                statusAssinatura: "ASSINADO",
                dataAssinatura: new Date(),
              },
            });
          }

          devolucoesCreated.push(devolucao);

          // Atualizar estoque do equipamento
          await tx.equipamento.update({
            where: { id: equip.equipamentoId },
            data: {
              quantidadeDisp: {
                increment: equip.quantidadeDevolvida,
              },
            },
          });
        }

        // Verifica status das devoluções para atualizar contrato
        const todasDevolucoes = await tx.devolucao.findMany({
          where: { contratoId },
        });

        const todasCompletas = todasDevolucoes.every(
          (d) => d.statusItemDevolucao === "DEVOLVIDO"
        );
        const temParcial = todasDevolucoes.some(
          (d) => d.statusItemDevolucao === "PARCIAL"
        );

        // Atualiza status do contrato
        if (todasCompletas) {
          await tx.contrato.update({
            where: { id: contratoId },
            data: {
              statusContrato: "FINALIZADO",
            },
          });
        } else if (temParcial) {
          await tx.contrato.update({
            where: { id: contratoId },
            data: {
              statusContrato: "DEVOLVIDO_PARCIALMENTE",
            },
          });
        }

        return {
          devolucoesCreated,
          contratoFinalizado: todasCompletas,
        };
      });

      // Buscar devoluções criadas com relações para serializar
      const devolucoesCompletas = await Promise.all(
        resultado.devolucoesCreated.map((d) =>
          prisma.devolucao.findUnique({
            where: { id: d.id },
            include: {
              contrato: {
                include: {
                  cliente: true,
                },
              },
              equipamento: true,
              cliente: true,
            },
          })
        )
      );

      const devolucoes = devolucoesCompletas
        .filter((d): d is NonNullable<typeof d> => d !== null)
        .map(serializarDevolucao);

      // Log de auditoria
      const headersList = await headers();
      const requestInfo = getRequestInfo(headersList);
      for (const devolucao of devolucoes) {
        await logCreate(
          AuditEntity.DEVOLUCAO,
          devolucao.id.toString(),
          `Devolução registrada: ${devolucao.devNum}`,
          devolucao,
          ctx.auth?.user?.id,
          ctx.auth?.user?.email,
          { ...requestInfo, contratoId: input.contratoId }
        );
      }

      return {
        devolucoesCreated: devolucoes,
        contratoFinalizado: resultado.contratoFinalizado,
      };
    }),
});

