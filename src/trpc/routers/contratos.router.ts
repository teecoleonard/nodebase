import { TRPCError } from "@trpc/server";
import { z } from "zod";
import prisma from "@/lib/db";
import {
  arquivarContratoSchema,
  assinarContratoSchema,
  atualizarStatusContratoSchema,
  createContratoSchema,
  deleteContratoSchema,
  gerarProximoNumeroSchema,
  getContratoByIdSchema,
  listContratosSchema,
  renovarContratoSchema,
  updateContratoSchema,
} from "@/features/contratos/schemas/contrato.schema";
import {
  router,
  protectedProcedure,
  createPermissionProcedure,
  Permission,
} from "../router-helpers";
import { logCreate, logUpdate, logDelete, getRequestInfo } from "@/lib/audit";
import { AuditEntity } from "@/generated/prisma/enums";
import { headers } from "next/headers";

// Helper para serializar contratos e converter Decimals para Numbers
function serializarContrato(contrato: any) {
  return {
    ...contrato,
    valorTotal: contrato.valorTotal ? Number(contrato.valorTotal) : null,
    equipamentos: contrato.equipamentos?.map((ec: any) => ({
      ...ec,
      valorUnitario: ec.valorUnitario ? Number(ec.valorUnitario) : null,
      valorTotal: ec.valorTotal ? Number(ec.valorTotal) : null,
      valorFrete: ec.valorFrete ? Number(ec.valorFrete) : null,
      equipamento: ec.equipamento ? {
        ...ec.equipamento,
        precoDiaria: ec.equipamento.precoDiaria ? Number(ec.equipamento.precoDiaria) : null,
        precoSemanal: ec.equipamento.precoSemanal ? Number(ec.equipamento.precoSemanal) : null,
        precoQuinzenal: ec.equipamento.precoQuinzenal ? Number(ec.equipamento.precoQuinzenal) : null,
        precoMensal: ec.equipamento.precoMensal ? Number(ec.equipamento.precoMensal) : null,
        valorPatrimonio: ec.equipamento.valorPatrimonio ? Number(ec.equipamento.valorPatrimonio) : null,
      } : null,
    })),
  };
}

export const contratosRouter = router({
  // Listar contratos com filtros
  list: createPermissionProcedure(Permission.CONTRATOS_VIEW)
    .input(listContratosSchema)
    .query(async ({ input }) => {
      const {
        clienteId,
        status,
        arquivado,
        dataInicio,
        dataFim,
        query,
        limit,
        offset,
      } = input;

      const where: any = {};

      if (clienteId) where.clienteId = clienteId;
      if (status) where.statusContrato = status;
      if (typeof arquivado !== "undefined") where.arquivado = arquivado;

      if (dataInicio && dataFim) {
        where.dataHoraEmissao = {
          gte: dataInicio,
          lte: dataFim,
        };
      }

      if (query) {
        where.OR = [
          { contratoNum: { contains: query, mode: "insensitive" as const } },
          { obraLocal: { contains: query, mode: "insensitive" as const } },
          {
            cliente: { contratante: { contains: query, mode: "insensitive" as const } },
          },
        ];
      }

      const [contratos, total] = await Promise.all([
        prisma.contrato.findMany({
          where,
          take: limit,
          skip: offset,
          orderBy: { dataHoraEmissao: "desc" },
          include: {
            cliente: true,
            equipamentos: {
              include: {
                equipamento: true,
              },
            },
            _count: {
              select: {
                devolucoes: true,
              },
            },
          },
        }),
        prisma.contrato.count({ where }),
      ]);

      return {
        contratos: contratos.map(serializarContrato),
        total,
        hasMore: offset + limit < total,
      };
    }),

  // Buscar contrato por ID (completo)
  getById: createPermissionProcedure(Permission.CONTRATOS_VIEW)
    .input(getContratoByIdSchema)
    .query(async ({ input }) => {
      const contrato = await prisma.contrato.findUnique({
        where: { id: input.id },
        include: {
          cliente: true,
          equipamentos: {
            include: {
              equipamento: true,
            },
          },
          devolucoes: {
            include: {
              equipamento: true,
            },
            orderBy: { dataDevolucaoPrevista: "asc" },
          },
          assinatura: true,
        },
      });

      if (!contrato) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contrato não encontrado",
        });
      }

      return serializarContrato(contrato);
    }),

  // Criar novo contrato
  create: createPermissionProcedure(Permission.CONTRATOS_CREATE)
    .input(createContratoSchema)
    .mutation(async ({ input, ctx }) => {
      const { equipamentos, ...contratoData } = input;

      // Verifica se número do contrato já existe para este cliente
      const existente = await prisma.contrato.findUnique({
        where: {
          clienteId_contratoNum: {
            clienteId: input.clienteId,
            contratoNum: input.contratoNum,
          },
        },
      });

      if (existente) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Número de contrato já existe",
        });
      }

      // Verifica disponibilidade de todos os equipamentos
      for (const equip of equipamentos) {
        const equipamento = await prisma.equipamento.findUnique({
          where: { id: equip.equipamentoId },
        });

        if (!equipamento) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Equipamento ID ${equip.equipamentoId} não encontrado`,
          });
        }

        if (equipamento.quantidadeDisp < equip.quantidadeEquip) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: `Quantidade insuficiente para ${equipamento.nomeEquip}. Disponível: ${equipamento.quantidadeDisp}`,
          });
        }
      }

      // Cria contrato com equipamentos e devoluções atomicamente
      const contrato = await prisma.$transaction(async (tx) => {
        // Cria o contrato
        const novoContrato = await tx.contrato.create({
          data: {
            ...contratoData,
            equipamentos: {
              create: equipamentos,
            },
          },
          include: {
            equipamentos: {
              include: {
                equipamento: true,
              },
            },
          },
        });

        // Cria devoluções automáticas para cada equipamento
        const devolucoes = equipamentos.map((equip) => ({
          contratoId: novoContrato.id,
          clienteId: contratoData.clienteId,
          equipamentoId: equip.equipamentoId,
          devNum: `DEV-${novoContrato.id}-${Math.floor(Math.random() * 1000000)}`,
          dataDevolucaoPrevista: contratoData.dataVenc,
          quantidadeContratada: equip.quantidadeEquip,
          quantidadeDevolvida: 0,
          statusItemDevolucao: "PENDENTE" as const,
          observacaoItemDevolucao: `Devolução de ${equip.quantidadeEquip} unidade(s)`,
        }));

        await tx.devolucao.createMany({
          data: devolucoes,
        });

        // Atualiza estoque dos equipamentos
        for (const equip of equipamentos) {
          await tx.equipamento.update({
            where: { id: equip.equipamentoId },
            data: {
              quantidadeDisp: {
                decrement: equip.quantidadeEquip,
              },
            },
          });
        }

        return novoContrato;
      });

      // Log de auditoria
      const headersList = await headers();
      const requestInfo = getRequestInfo(headersList);
      await logCreate(
        AuditEntity.CONTRATO,
        contrato.id.toString(),
        `Contrato criado: ${contrato.contratoNum}`,
        contrato,
        ctx.auth?.user?.id,
        ctx.auth?.user?.email,
        { ...requestInfo }
      );

      return serializarContrato(contrato);
    }),

  // Atualizar contrato
  update: createPermissionProcedure(Permission.CONTRATOS_UPDATE)
    .input(updateContratoSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, equipamentos, ...data } = input;

      const contratoExistente = await prisma.contrato.findUnique({
        where: { id },
        include: {
          equipamentos: true,
        },
      });

      if (!contratoExistente) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contrato não encontrado",
        });
      }

      // Não permite edição de contratos finalizados ou cancelados
      if (["FINALIZADO", "CANCELADO"].includes(contratoExistente.statusContrato)) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Não é possível editar contratos finalizados ou cancelados",
        });
      }

      // Se está atualizando equipamentos, faz em transação
      if (equipamentos) {
        const contratoAtualizado = await prisma.$transaction(async (tx) => {
          // Remove equipamentos antigos e restaura estoque
          for (const equipAntigo of contratoExistente.equipamentos) {
            await tx.equipamento.update({
              where: { id: equipAntigo.equipamentoId },
              data: {
                quantidadeDisp: {
                  increment: equipAntigo.quantidadeEquip,
                },
              },
            });
          }

          await tx.equipamentoContrato.deleteMany({
            where: { contratoId: id },
          });

          // Adiciona novos equipamentos e atualiza estoque
          for (const equip of equipamentos) {
            const equipamento = await tx.equipamento.findUnique({
              where: { id: equip.equipamentoId },
            });

            if (!equipamento || equipamento.quantidadeDisp < equip.quantidadeEquip) {
              throw new TRPCError({
                code: "PRECONDITION_FAILED",
                message: `Quantidade insuficiente para equipamento ID ${equip.equipamentoId}`,
              });
            }

            await tx.equipamento.update({
              where: { id: equip.equipamentoId },
              data: {
                quantidadeDisp: {
                  decrement: equip.quantidadeEquip,
                },
              },
            });
          }

          // Atualiza contrato
          return await tx.contrato.update({
            where: { id },
            data: {
              ...data,
              equipamentos: {
                create: equipamentos,
              },
            },
            include: {
              cliente: true,
              equipamentos: {
                include: {
                  equipamento: true,
                },
              },
            },
          });
        });
        // Log de auditoria
        const headersList = await headers();
        const requestInfo = getRequestInfo(headersList);
        await logUpdate(
          AuditEntity.CONTRATO,
          contratoAtualizado.id.toString(),
          `Contrato atualizado: ${contratoAtualizado.contratoNum}`,
          contratoExistente,
          contratoAtualizado,
          ctx.auth?.user?.id,
          ctx.auth?.user?.email,
          { ...requestInfo }
        );

        return serializarContrato(contratoAtualizado);
      }

      // Atualização simples sem mudança de equipamentos
      const contratoAtualizado = await prisma.contrato.update({
        where: { id },
        data,
        include: {
          cliente: true,
          equipamentos: {
            include: {
              equipamento: true,
            },
          },
        },
      });

      // Log de auditoria
      const headersList = await headers();
      const requestInfo = getRequestInfo(headersList);
      await logUpdate(
        AuditEntity.CONTRATO,
        contratoAtualizado.id.toString(),
        `Contrato atualizado: ${contratoAtualizado.contratoNum}`,
        contratoExistente,
        contratoAtualizado,
        ctx.auth?.user?.id,
        ctx.auth?.user?.email,
        { ...requestInfo }
      );

      return serializarContrato(contratoAtualizado);
    }),

  // Deletar contrato
  delete: createPermissionProcedure(Permission.CONTRATOS_DELETE)
    .input(deleteContratoSchema)
    .mutation(async ({ input, ctx }) => {
      const contrato = await prisma.contrato.findUnique({
        where: { id: input.id },
        include: {
          equipamentos: true,
        },
      });

      if (!contrato) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contrato não encontrado",
        });
      }

      // Não permite deletar contratos finalizados
      if (contrato.statusContrato === "FINALIZADO") {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message:
            "Não é possível deletar contratos finalizados. Considere arquivá-los.",
        });
      }

      // Deleta contrato e restaura estoque
      await prisma.$transaction(async (tx) => {
        // Restaura estoque dos equipamentos
        for (const equip of contrato.equipamentos) {
          await tx.equipamento.update({
            where: { id: equip.equipamentoId },
            data: {
              quantidadeDisp: {
                increment: equip.quantidadeEquip,
              },
            },
          });
        }

        // Deleta contrato (cascade deleta equipamentos e devoluções)
        await tx.contrato.delete({
          where: { id: input.id },
        });
      });

      // Log de auditoria
      const headersList = await headers();
      const requestInfo = getRequestInfo(headersList);
      await logDelete(
        AuditEntity.CONTRATO,
        input.id.toString(),
        `Contrato deletado: ${contrato.contratoNum}`,
        contrato,
        ctx.auth?.user?.id,
        ctx.auth?.user?.email,
        { ...requestInfo }
      );

      return { success: true };
    }),

  // Atualizar status do contrato
  atualizarStatus: createPermissionProcedure(Permission.CONTRATOS_UPDATE)
    .input(atualizarStatusContratoSchema)
    .mutation(async ({ input }) => {
      const contrato = await prisma.contrato.findUnique({
        where: { id: input.contratoId },
      });

      if (!contrato) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contrato não encontrado",
        });
      }

      // Validações de transição de status
      const transicoesValidas: Record<string, string[]> = {
        PENDENTE: ["ASSINADO", "CANCELADO"],
        ASSINADO: ["EM_ANDAMENTO", "CANCELADO"],
        EM_ANDAMENTO: ["DEVOLVIDO_PARCIALMENTE", "FINALIZADO", "CANCELADO"],
        DEVOLVIDO_PARCIALMENTE: ["FINALIZADO", "CANCELADO"],
        FINALIZADO: [],
        CANCELADO: [],
      };

      if (!transicoesValidas[contrato.statusContrato]?.includes(input.novoStatus)) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: `Transição de ${contrato.statusContrato} para ${input.novoStatus} não é permitida`,
        });
      }

      const contratoAtualizado = await prisma.contrato.update({
        where: { id: input.contratoId },
        data: {
          statusContrato: input.novoStatus,
        },
      });

      // Se finalizou, dispara geração de fatura (será implementado no Inngest)
      if (input.novoStatus === "FINALIZADO") {
        // TODO: Disparar evento Inngest para geração de fatura
      }

      return contratoAtualizado;
    }),

  // Assinar contrato
  assinar: createPermissionProcedure(Permission.CONTRATOS_ASSINAR)
    .input(assinarContratoSchema)
    .mutation(async ({ input, ctx }) => {
      const contrato = await prisma.contrato.findUnique({
        where: { id: input.id },
      });

      if (!contrato) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contrato não encontrado",
        });
      }

      if (contrato.statusAssinatura === "ASSINADO") {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Contrato já foi assinado",
        });
      }

      // Gera nome do arquivo baseado no tipo de assinatura
      const timestamp = Date.now();
      const nomeArquivo = `assinatura_${input.tipoAssinatura}_${input.id}_${timestamp}.png`;

      // Salva assinatura
      const assinatura = await prisma.assinatura.create({
        data: {
          contratoId: input.id,
          nomeArquivo: nomeArquivo,
          // Em produção, você salvaria o input.assinaturaBase64 em um storage (S3, etc)
        },
      });

      // Atualiza contrato para status ASSINADO (EM_ANDAMENTO)
      const contratoAtualizado = await prisma.contrato.update({
        where: { id: input.id },
        data: {
          statusAssinatura: "ASSINADO",
          dataAssinatura: new Date(),
          assinaturaId: assinatura.id,
          statusContrato: "EM_ANDAMENTO", // Muda para EM_ANDAMENTO após assinatura
        },
      });

      return contratoAtualizado;
    }),

  // Arquivar/desarquivar contrato
  arquivar: createPermissionProcedure(Permission.CONTRATOS_UPDATE)
    .input(arquivarContratoSchema)
    .mutation(async ({ input }) => {
      const contrato = await prisma.contrato.update({
        where: { id: input.contratoId },
        data: {
          arquivado: input.arquivar,
          dataArquivamento: input.arquivar ? new Date() : null,
        },
      });

      return contrato;
    }),

  // Gerar próximo número de contrato para cliente
  gerarProximoNumero: createPermissionProcedure(Permission.CONTRATOS_VIEW)
    .input(gerarProximoNumeroSchema)
    .query(async ({ input }) => {
      const ultimoContrato = await prisma.contrato.findFirst({
        where: { clienteId: input.clienteId },
        orderBy: { contratoNum: "desc" },
      });

      if (!ultimoContrato) {
        return "001";
      }

      // Extrai número e incrementa
      const numero = Number.parseInt(ultimoContrato.contratoNum) || 0;
      return String(numero + 1).padStart(3, "0");
    }),

  // Renovar contrato (para contratos com devolução parcial)
  renovar: createPermissionProcedure(Permission.CONTRATOS_UPDATE)
    .input(renovarContratoSchema)
    .mutation(async ({ input, ctx }) => {
      const { contratoId, equipamentos, ...data } = input;

      const contratoExistente = await prisma.contrato.findUnique({
        where: { id: contratoId },
        include: {
          equipamentos: true,
          devolucoes: true,
        },
      });

      if (!contratoExistente) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contrato não encontrado",
        });
      }

      // Só permite renovar contratos com devolução parcial
      if (contratoExistente.statusContrato !== "DEVOLVIDO_PARCIALMENTE") {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Apenas contratos com devolução parcial podem ser renovados",
        });
      }

      // Verifica disponibilidade dos novos equipamentos
      for (const equip of equipamentos) {
        const equipamento = await prisma.equipamento.findUnique({
          where: { id: equip.equipamentoId },
        });

        if (!equipamento) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Equipamento ID ${equip.equipamentoId} não encontrado`,
          });
        }

        // Verifica se há equipamentos ainda não devolvidos do contrato original
        const devolucaoEquip = contratoExistente.devolucoes.find(
          (d) => d.equipamentoId === equip.equipamentoId
        );
        
        const quantidadeAindaEmUso = devolucaoEquip
          ? devolucaoEquip.quantidadeContratada - devolucaoEquip.quantidadeDevolvida
          : 0;

        // Verifica se há estoque suficiente (considerando equipamentos ainda em uso)
        const estoqueNecessario = equip.quantidadeEquip - quantidadeAindaEmUso;
        
        if (estoqueNecessario > 0 && equipamento.quantidadeDisp < estoqueNecessario) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: `Quantidade insuficiente para ${equipamento.nomeEquip}. Disponível: ${equipamento.quantidadeDisp}, Necessário: ${estoqueNecessario}`,
          });
        }
      }

      // Atualiza contrato em transação
      const contratoRenovado = await prisma.$transaction(async (tx) => {
        // Remove equipamentos antigos e ajusta estoque
        for (const equipAntigo of contratoExistente.equipamentos) {
          const devolucaoEquip = contratoExistente.devolucoes.find(
            (d) => d.equipamentoId === equipAntigo.equipamentoId
          );
          
          // Só restaura estoque dos equipamentos que foram totalmente devolvidos
          if (devolucaoEquip && devolucaoEquip.statusItemDevolucao === "DEVOLVIDO") {
            await tx.equipamento.update({
              where: { id: equipAntigo.equipamentoId },
              data: {
                quantidadeDisp: {
                  increment: equipAntigo.quantidadeEquip,
                },
              },
            });
          }
        }

        // Remove equipamentos antigos do contrato
        await tx.equipamentoContrato.deleteMany({
          where: { contratoId },
        });

        // Adiciona novos equipamentos e atualiza estoque
        for (const equip of equipamentos) {
          const equipamento = await tx.equipamento.findUnique({
            where: { id: equip.equipamentoId },
          });

          if (!equipamento) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: `Equipamento ID ${equip.equipamentoId} não encontrado`,
            });
          }

          // Verifica se há equipamentos ainda não devolvidos
          const devolucaoEquip = contratoExistente.devolucoes.find(
            (d) => d.equipamentoId === equip.equipamentoId
          );
          
          const quantidadeAindaEmUso = devolucaoEquip
            ? devolucaoEquip.quantidadeContratada - devolucaoEquip.quantidadeDevolvida
            : 0;

          // Só decrementa estoque se a quantidade nova for maior que a ainda em uso
          const estoqueNecessario = equip.quantidadeEquip - quantidadeAindaEmUso;
          
          if (estoqueNecessario > 0) {
            await tx.equipamento.update({
              where: { id: equip.equipamentoId },
              data: {
                quantidadeDisp: {
                  decrement: estoqueNecessario,
                },
              },
            });
          }

          // Cria novo equipamento no contrato
          await tx.equipamentoContrato.create({
            data: {
              contratoId,
              equipamentoId: equip.equipamentoId,
              quantidadeEquip: equip.quantidadeEquip,
              valorUnitario: equip.valorUnitario,
              valorTotal: equip.valorTotal,
              valorFrete: equip.valorFrete,
            },
          });
        }

        // Atualiza contrato com novos dados e muda status para EM_ANDAMENTO
        // IMPORTANTE: Mantém a data de emissão original para não alterar a data de vencimento
        return await tx.contrato.update({
          where: { id: contratoId },
          data: {
            ...data,
            dataHoraEmissao: contratoExistente.dataHoraEmissao, // Preserva a data original
            statusContrato: "EM_ANDAMENTO",
            updatedAt: new Date(),
          },
          include: {
            cliente: true,
            equipamentos: {
              include: {
                equipamento: true,
              },
            },
          },
        });
      });

      // Log de auditoria
      const headersList = await headers();
      const requestInfo = getRequestInfo(headersList);
      await logUpdate(
        AuditEntity.CONTRATO,
        contratoRenovado.id.toString(),
        `Contrato renovado: ${contratoRenovado.contratoNum}`,
        contratoExistente,
        contratoRenovado,
        ctx.auth?.user?.id,
        ctx.auth?.user?.email,
        { ...requestInfo }
      );

      return serializarContrato(contratoRenovado);
    }),

  // Dashboard de contratos
  dashboard: createPermissionProcedure(Permission.CONTRATOS_VIEW).query(async () => {
    const [
      totalContratos,
      contratosAtivos,
      contratosPendentes,
      contratosConcluidos,
      contratosCancelados,
      receitaTotal,
      receitaMesAtual,
    ] = await Promise.all([
      prisma.contrato.count(),
      prisma.contrato.count({
        where: {
          statusContrato: { in: ["EM_ANDAMENTO", "ASSINADO"] },
        },
      }),
      prisma.contrato.count({
        where: { statusContrato: "PENDENTE" },
      }),
      prisma.contrato.count({
        where: { statusContrato: "FINALIZADO" },
      }),
      prisma.contrato.count({
        where: { statusContrato: "CANCELADO" },
      }),
      prisma.contrato.aggregate({
        _sum: { valorTotal: true },
      }),
      prisma.contrato.aggregate({
        where: {
          dataHoraEmissao: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _sum: { valorTotal: true },
      }),
    ]);

    return {
      totalContratos,
      contratosAtivos,
      contratosPendentes,
      contratosConcluidos,
      contratosCancelados,
      receitaTotal: Number(receitaTotal._sum.valorTotal || 0),
      receitaMesAtual: Number(receitaMesAtual._sum.valorTotal || 0),
    };
  }),
});

