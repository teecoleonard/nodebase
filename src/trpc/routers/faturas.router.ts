import { TRPCError } from "@trpc/server";
import { z } from "zod";
import prisma from "@/lib/db";
import {
  adicionarContratoFaturaSchema,
  atualizarValorContratoFaturaSchema,
  cancelarFaturaSchema,
  createFaturaSchema,
  deleteFaturaSchema,
  gerarFaturaAutomaticaSchema,
  getFaturaByIdSchema,
  listFaturasSchema,
  registrarPagamentoSchema,
  updateFaturaSchema,
  type ParcelaFaturaInput,
} from "@/features/faturas/schemas/fatura.schema";
import {
  router,
  protectedProcedure,
  createPermissionProcedure,
  Permission,
} from "../router-helpers";
import { logCreate, logUpdate, logDelete, getRequestInfo } from "@/lib/audit";
import { AuditEntity } from "@/generated/prisma/enums";
import { headers } from "next/headers";

const PARCELAS_MARKER = "\n\n---parcelas_json---\n";
const MAX_FATURAS_LIMIT = 100;

type ParcelaPersistida = {
  numero: number;
  dataVencimento: string;
  valor: number;
  portador?: string | null;
  observacao?: string | null;
};

function extrairParcelas(observacoes?: string | null) {
  if (!observacoes) {
    return { texto: null, parcelas: [] as ParcelaPersistida[] };
  }

  const markerIndex = observacoes.indexOf(PARCELAS_MARKER);
  if (markerIndex === -1) {
    return { texto: observacoes, parcelas: [] as ParcelaPersistida[] };
  }

  const texto = observacoes.slice(0, markerIndex).trimEnd();
  const jsonRaw = observacoes.slice(markerIndex + PARCELAS_MARKER.length).trim();
  if (!jsonRaw) {
    return { texto, parcelas: [] as ParcelaPersistida[] };
  }

  try {
    const parsed = JSON.parse(jsonRaw);
    if (Array.isArray(parsed)) {
      return { texto: texto || null, parcelas: parsed as ParcelaPersistida[] };
    }
    return { texto, parcelas: [] as ParcelaPersistida[] };
  } catch {
    return { texto: observacoes, parcelas: [] as ParcelaPersistida[] };
  }
}

function combinarObservacoes(
  texto: string | null | undefined,
  parcelas: ParcelaPersistida[],
) {
  const base = (texto ?? "").trim();
  if (!parcelas || parcelas.length === 0) {
    return base || null;
  }
  return `${base}${base ? "\n\n" : ""}${PARCELAS_MARKER}${JSON.stringify(parcelas)}`;
}

function normalizarParcela(
  parcela: ParcelaFaturaInput,
  fallbackNumero: number,
): ParcelaPersistida {
  const numero = parcela.numero ?? fallbackNumero;
  const data =
    parcela.dataVencimento instanceof Date
      ? parcela.dataVencimento
      : new Date(parcela.dataVencimento);

  return {
    numero,
    dataVencimento: data.toISOString(),
    valor: Number(parcela.valor),
    portador: parcela.portador || null,
    observacao: parcela.observacao || null,
  };
}

// Helper para serializar faturas e converter Decimals para Numbers
function serializarFatura(fatura: any) {
  const { texto, parcelas } = extrairParcelas(fatura.observacoes);

  return {
    ...fatura,
    valorTotal: fatura.valorTotal ? Number(fatura.valorTotal) : null,
    valorPago: fatura.valorPago ? Number(fatura.valorPago) : null,
    observacoes: texto,
    parcelas,
    contratos: fatura.contratos?.map((fc: any) => ({
      ...fc,
      valorContrato: fc.valorContrato ? Number(fc.valorContrato) : null,
      contrato: fc.contrato
        ? {
            ...fc.contrato,
            valorTotal: fc.contrato.valorTotal
              ? Number(fc.contrato.valorTotal)
              : null,
            equipamentos: fc.contrato.equipamentos?.map((ec: any) => ({
              ...ec,
              valorUnitario: ec.valorUnitario ? Number(ec.valorUnitario) : null,
              valorTotal: ec.valorTotal ? Number(ec.valorTotal) : null,
              valorFrete: ec.valorFrete ? Number(ec.valorFrete) : null,
              equipamento: ec.equipamento
                ? {
                    ...ec.equipamento,
                    precoDiaria: ec.equipamento.precoDiaria
                      ? Number(ec.equipamento.precoDiaria)
                      : null,
                    precoSemanal: ec.equipamento.precoSemanal
                      ? Number(ec.equipamento.precoSemanal)
                      : null,
                    precoQuinzenal: ec.equipamento.precoQuinzenal
                      ? Number(ec.equipamento.precoQuinzenal)
                      : null,
                    precoMensal: ec.equipamento.precoMensal
                      ? Number(ec.equipamento.precoMensal)
                      : null,
                    valorPatrimonio: ec.equipamento.valorPatrimonio
                      ? Number(ec.equipamento.valorPatrimonio)
                      : null,
                  }
                : null,
            })),
          }
        : null,
    })),
  };
}

export const faturasRouter = router({
  // Listar faturas
  list: createPermissionProcedure(Permission.FATURAS_VIEW).input(listFaturasSchema).query(async ({ input }) => {
    const {
      clienteId,
      status,
      mesReferencia,
      anoReferencia,
      dataInicio,
      dataFim,
      limit = 50,
      offset = 0,
    } = input;

    const where: any = {};

    if (clienteId) where.clienteId = clienteId;
    if (status) where.status = status;
    if (mesReferencia) where.mesReferencia = mesReferencia;
    if (anoReferencia) where.anoReferencia = anoReferencia;

    // Filtrar por data de emissão
    if (dataInicio || dataFim) {
      where.dataEmissao = {};
      if (dataInicio) {
        // Iniciar do início do dia
        const inicio = new Date(dataInicio);
        inicio.setHours(0, 0, 0, 0);
        where.dataEmissao.gte = inicio;
      }
      if (dataFim) {
        // Terminar no fim do dia
        const fim = new Date(dataFim);
        fim.setHours(23, 59, 59, 999);
        where.dataEmissao.lte = fim;
      }
    }

    const take = Math.min(Math.max(limit, 1), MAX_FATURAS_LIMIT);
    const skipValue = Math.max(offset, 0);

    const [faturas, total] = await Promise.all([
      prisma.fatura.findMany({
        where,
        take,
        skip: skipValue,
        orderBy: { dataEmissao: "desc" },
        select: {
          id: true,
          clienteId: true,
          numeroFatura: true,
          dataEmissao: true,
          dataVencimento: true,
          mesReferencia: true,
          anoReferencia: true,
          status: true,
          valorTotal: true,
          valorPago: true,
          observacoes: true,
          cliente: {
            select: {
              id: true,
              contratante: true,
            },
          },
        },
      }),
      prisma.fatura.count({ where }),
    ]);

    return {
      faturas: faturas.map(serializarFatura),
      total,
      hasMore: skipValue + take < total,
    };
  }),

  // Buscar fatura por ID
  getById: createPermissionProcedure(Permission.FATURAS_VIEW)
    .input(getFaturaByIdSchema)
    .query(async ({ input }) => {
      const fatura = await prisma.fatura.findUnique({
        where: { id: input.id },
        include: {
          cliente: true,
          contratos: {
            include: {
              contrato: {
                include: {
                  equipamentos: {
                    include: {
                      equipamento: true,
                    },
                  },
                },
              },
            },
          },
          assinaturas: true,
        },
      });

      if (!fatura) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Fatura não encontrada",
        });
      }

      return serializarFatura(fatura);
    }),

  // Criar fatura manualmente
  create: createPermissionProcedure(Permission.FATURAS_CREATE)
    .input(createFaturaSchema)
    .mutation(async ({ input, ctx }) => {
      const { contratosIds, ...faturaData } = input;

      // Verifica se número de fatura já existe
      const existente = await prisma.fatura.findUnique({
        where: { numeroFatura: input.numeroFatura },
      });

      if (existente) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Número de fatura já existe",
        });
      }

      // Busca contratos para validação
      const contratos = await prisma.contrato.findMany({
        where: {
          id: { in: contratosIds },
          clienteId: input.clienteId,
        },
      });

      if (contratos.length !== contratosIds.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Um ou mais contratos não foram encontrados",
        });
      }

      // Cria fatura com contratos vinculados
      const fatura = await prisma.fatura.create({
        data: {
          ...faturaData,
          contratos: {
            create: contratos.map((contrato) => ({
              contratoId: contrato.id,
              valorContrato: contrato.valorTotal,
            })),
          },
        },
        include: {
          cliente: true,
          contratos: {
            include: {
              contrato: true,
            },
          },
        },
      });

      // Log de auditoria
      const headersList = await headers();
      const requestInfo = getRequestInfo(headersList);
      await logCreate(
        AuditEntity.FATURA,
        fatura.id.toString(),
        `Fatura criada: ${fatura.numeroFatura}`,
        fatura,
        ctx.auth?.user?.id,
        ctx.auth?.user?.email,
        { ...requestInfo }
      );

      return serializarFatura(fatura);
    }),

  // Atualizar fatura
  update: createPermissionProcedure(Permission.FATURAS_UPDATE)
    .input(updateFaturaSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, parcelas, ...rest } = input;

      const fatura = await prisma.fatura.findUnique({
        where: { id },
      });

      if (!fatura) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Fatura não encontrada",
        });
      }

      // Guarda valores antigos para auditoria
      const faturaAntiga = { ...fatura };

      if (fatura.status === "PAGA") {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Não é possível editar fatura paga",
        });
      }

      const { texto: observacoesExistentes, parcelas: parcelasExistentes } =
        extrairParcelas(fatura.observacoes);

      let observacoesBase =
        rest.observacoes !== undefined
          ? rest.observacoes
          : observacoesExistentes ?? null;

      let parcelasParaSalvar = parcelasExistentes;

      if (parcelas !== undefined) {
        const parcelasNormalizadas = parcelas.map((parcela, index) =>
          normalizarParcela(parcela, index + 1),
        );

        const totalParcelas = parcelasNormalizadas.reduce(
          (sum, parcela) => sum + parcela.valor,
          0,
        );
        const valorReferencia =
          rest.valorTotal !== undefined
            ? rest.valorTotal
            : Number(fatura.valorTotal);

        if (Math.round(totalParcelas * 100) !== Math.round(valorReferencia * 100)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "A soma das parcelas precisa ser igual ao valor total da fatura.",
          });
        }

        parcelasParaSalvar = parcelasNormalizadas;
      }

      const deveAtualizarObservacoes =
        parcelas !== undefined || rest.observacoes !== undefined;

      const data: typeof rest & { observacoes?: string | null } = { ...rest };

      if (deveAtualizarObservacoes) {
        data.observacoes = combinarObservacoes(
          observacoesBase,
          parcelasParaSalvar,
        );
      }

      const faturaAtualizada = await prisma.fatura.update({
        where: { id },
        data,
        include: {
          cliente: true,
          contratos: {
            include: {
              contrato: true,
            },
          },
        },
      });

      // Log de auditoria
      const headersList = await headers();
      const requestInfo = getRequestInfo(headersList);
      await logUpdate(
        AuditEntity.FATURA,
        faturaAtualizada.id.toString(),
        `Fatura atualizada: ${faturaAtualizada.numeroFatura}`,
        faturaAntiga,
        faturaAtualizada,
        ctx.auth?.user?.id,
        ctx.auth?.user?.email,
        { ...requestInfo }
      );

      return serializarFatura(faturaAtualizada);
    }),

  // Registrar pagamento
  registrarPagamento: createPermissionProcedure(Permission.FATURAS_PAGAR)
    .input(registrarPagamentoSchema)
    .mutation(async ({ input, ctx }) => {
      const fatura = await prisma.fatura.findUnique({
        where: { id: input.faturaId },
      });

      if (!fatura) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Fatura não encontrada",
        });
      }

      if (fatura.status === "PAGA") {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Fatura já foi paga",
        });
      }

      if (fatura.status === "CANCELADA") {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Não é possível pagar fatura cancelada",
        });
      }

      const novoValorPago = Number(fatura.valorPago || 0) + input.valorPago;
      const novoStatus =
        novoValorPago >= Number(fatura.valorTotal || 0) ? "PAGA" : fatura.status;

      await prisma.fatura.update({
        where: { id: input.faturaId },
        data: {
          valorPago: novoValorPago,
          status: novoStatus,
          dataPagamento: novoStatus === "PAGA" ? input.dataPagamento : undefined,
        },
      });

      // Busca fatura atualizada com relações para serializar
      const faturaAtualizada = await prisma.fatura.findUnique({
        where: { id: input.faturaId },
        include: {
          cliente: true,
          contratos: {
            include: {
              contrato: true,
            },
          },
        },
      });

      // Log de auditoria
      const headersList = await headers();
      const requestInfo = getRequestInfo(headersList);
      await logUpdate(
        AuditEntity.FATURA,
        faturaAtualizada!.id.toString(),
        `Pagamento registrado na fatura: ${faturaAtualizada!.numeroFatura}`,
        fatura,
        faturaAtualizada,
        ctx.auth?.user?.id,
        ctx.auth?.user?.email,
        { ...requestInfo, valorPago: input.valorPago }
      );

      return serializarFatura(faturaAtualizada!);
    }),

  // Cancelar fatura
  cancelar: createPermissionProcedure(Permission.FATURAS_CANCELAR)
    .input(cancelarFaturaSchema)
    .mutation(async ({ input, ctx }) => {
      const fatura = await prisma.fatura.findUnique({
        where: { id: input.faturaId },
      });

      if (!fatura) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Fatura não encontrada",
        });
      }

      if (fatura.status === "PAGA") {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Não é possível cancelar fatura paga",
        });
      }

      await prisma.fatura.update({
        where: { id: input.faturaId },
        data: {
          status: "CANCELADA",
          observacoes: input.motivo
            ? `${fatura.observacoes || ""}\nMotivo do cancelamento: ${input.motivo}`
            : fatura.observacoes,
        },
      });

      // Busca fatura atualizada com relações para serializar
      const faturaAtualizada = await prisma.fatura.findUnique({
        where: { id: input.faturaId },
        include: {
          cliente: true,
          contratos: {
            include: {
              contrato: true,
            },
          },
        },
      });

      // Log de auditoria
      const headersList = await headers();
      const requestInfo = getRequestInfo(headersList);
      await logUpdate(
        AuditEntity.FATURA,
        faturaAtualizada!.id.toString(),
        `Fatura cancelada: ${faturaAtualizada!.numeroFatura}`,
        fatura,
        faturaAtualizada,
        ctx.auth?.user?.id,
        ctx.auth?.user?.email,
        { ...requestInfo, motivo: input.motivo }
      );

      return serializarFatura(faturaAtualizada!);
    }),

  delete: createPermissionProcedure(Permission.FATURAS_DELETE)
    .input(deleteFaturaSchema)
    .mutation(async ({ input, ctx }) => {
      const fatura = await prisma.fatura.findUnique({
        where: { id: input.faturaId },
      });

      if (!fatura) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Fatura não encontrada",
        });
      }

      if (fatura.status === "PAGA") {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Não é possível excluir fatura paga",
        });
      }

      await prisma.fatura.delete({
        where: { id: input.faturaId },
      });

      const headersList = await headers();
      const requestInfo = getRequestInfo(headersList);
      await logDelete(
        AuditEntity.FATURA,
        input.faturaId.toString(),
        `Fatura excluída: ${fatura.numeroFatura}`,
        fatura,
        ctx.auth?.user?.id,
        ctx.auth?.user?.email,
        { ...requestInfo },
      );

      return { success: true };
    }),

  // Gerar faturas automáticas para contratos finalizados
  gerarAutomaticas: createPermissionProcedure(Permission.FATURAS_CREATE)
    .input(gerarFaturaAutomaticaSchema)
    .mutation(async ({ input }) => {
      const { mesReferencia, anoReferencia, diaVencimento } = input;

      // Busca contratos finalizados ou parcialmente devolvidos no mês de referência que ainda não têm fatura
      const contratosFinalizados = await prisma.contrato.findMany({
        where: {
          statusContrato: {
            in: ["FINALIZADO", "DEVOLVIDO_PARCIALMENTE"],
          },
          dataHoraEmissao: {
            gte: new Date(anoReferencia, mesReferencia - 1, 1),
            lt: new Date(anoReferencia, mesReferencia, 1),
          },
        },
        include: {
          cliente: true,
        },
      });

      // Agrupa por cliente
      const contratosPorCliente = contratosFinalizados.reduce(
        (acc, contrato) => {
          if (!acc[contrato.clienteId]) {
            acc[contrato.clienteId] = [];
          }
          acc[contrato.clienteId].push(contrato);
          return acc;
        },
        {} as Record<number, typeof contratosFinalizados>,
      );

      const faturasGeradas = [];

      // Cria uma fatura por cliente
      for (const [clienteIdStr, contratos] of Object.entries(
        contratosPorCliente,
      )) {
        const clienteId = Number.parseInt(clienteIdStr);

        // Verifica se já existe fatura para esse cliente nesse mês
        const faturaExistente = await prisma.fatura.findFirst({
          where: {
            clienteId,
            mesReferencia,
            anoReferencia,
          },
        });

        if (faturaExistente) {
          continue; // Pula se já existe
        }

        const valorTotal = contratos.reduce(
          (sum, c) => sum + Number(c.valorTotal),
          0,
        );

        const numeroFatura = `FAT-${clienteId}-${anoReferencia}${String(mesReferencia).padStart(2, "0")}`;

        const dataVencimento = new Date(
          anoReferencia,
          mesReferencia, // Próximo mês
          diaVencimento,
        );

        const fatura = await prisma.fatura.create({
          data: {
            clienteId,
            numeroFatura,
            dataVencimento,
            valorTotal,
            mesReferencia,
            anoReferencia,
            observacoes: "Fatura gerada automaticamente",
            contratos: {
              create: contratos.map((contrato) => ({
                contratoId: contrato.id,
                valorContrato: contrato.valorTotal,
              })),
            },
          },
          include: {
            cliente: true,
            contratos: true,
          },
        });

        faturasGeradas.push(fatura);
      }

      return {
        faturasGeradas: faturasGeradas.length,
        faturas: faturasGeradas.map(serializarFatura),
      };
    }),

  // Dashboard de faturas
  dashboard: createPermissionProcedure(Permission.FATURAS_VIEW).query(async () => {
    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1;
    const anoAtual = hoje.getFullYear();

    const [
      totalPendentes,
      totalVencidas,
      totalPagas,
      receitaTotal,
      receitaMesAtual,
      aPagar,
    ] = await Promise.all([
      prisma.fatura.count({
        where: { status: "PENDENTE" },
      }),
      prisma.fatura.count({
        where: { status: "VENCIDA" },
      }),
      prisma.fatura.count({
        where: { status: "PAGA" },
      }),
      prisma.fatura.aggregate({
        where: { status: "PAGA" },
        _sum: { valorPago: true },
      }),
      prisma.fatura.aggregate({
        where: {
          status: "PAGA",
          mesReferencia: mesAtual,
          anoReferencia: anoAtual,
        },
        _sum: { valorPago: true },
      }),
      prisma.fatura.aggregate({
        where: { status: { in: ["PENDENTE", "VENCIDA"] } },
        _sum: { valorTotal: true },
      }),
    ]);

    return {
      totalPendentes,
      totalVencidas,
      totalPagas,
      receitaTotal: Number(receitaTotal._sum.valorPago || 0),
      receitaMesAtual: Number(receitaMesAtual._sum.valorPago || 0),
      valorAPagar: Number(aPagar._sum.valorTotal || 0),
    };
  }),

  // Faturas por cliente
  porCliente: createPermissionProcedure(Permission.FATURAS_VIEW)
    .input(z.object({ clienteId: z.number() }))
    .query(async ({ input }) => {
      const faturas = await prisma.fatura.findMany({
        where: { clienteId: input.clienteId },
        include: {
          contratos: {
            include: {
              contrato: true,
            },
          },
        },
        orderBy: { dataEmissao: "desc" },
      });

      const totalFaturas = faturas.length;
      const faturasPagas = faturas.filter((f) => f.status === "PAGA").length;
      const faturasPendentes = faturas.filter(
        (f) => f.status === "PENDENTE",
      ).length;
      const faturasVencidas = faturas.filter(
        (f) => f.status === "VENCIDA",
      ).length;

      const valorTotal = faturas.reduce(
        (sum, f) => sum + Number(f.valorTotal),
        0,
      );
      const valorPago = faturas.reduce((sum, f) => sum + Number(f.valorPago), 0);

      return {
        faturas: faturas.map(serializarFatura),
        totalFaturas,
        faturasPagas,
        faturasPendentes,
        faturasVencidas,
        valorTotal,
        valorPago,
        valorPendente: valorTotal - valorPago,
      };
    }),

  // Adicionar contrato à fatura manualmente
  adicionarContrato: createPermissionProcedure(Permission.FATURAS_UPDATE)
    .input(adicionarContratoFaturaSchema)
    .mutation(async ({ input, ctx }) => {
      const { faturaId, contratoId, valorContrato } = input;

      const fatura = await prisma.fatura.findUnique({
        where: { id: faturaId },
      });

      if (!fatura) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Fatura não encontrada",
        });
      }

      if (fatura.status === "PAGA") {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Não é possível adicionar contratos a fatura paga",
        });
      }

      const contrato = await prisma.contrato.findUnique({
        where: { id: contratoId },
      });

      if (!contrato) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contrato não encontrado",
        });
      }

      // Verifica se o contrato já está na fatura
      const jaExiste = await prisma.faturaContrato.findUnique({
        where: {
          faturaId_contratoId: {
            faturaId,
            contratoId,
          },
        },
      });

      if (jaExiste) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Contrato já está incluído nesta fatura",
        });
      }

      // Adiciona contrato à fatura
      await prisma.faturaContrato.create({
        data: {
          faturaId,
          contratoId,
          valorContrato: valorContrato ? valorContrato.toString() : contrato.valorTotal.toString(),
        },
      });

      // Atualiza valor total da fatura
      const todosContratos = await prisma.faturaContrato.findMany({
        where: { faturaId },
      });

      const novoValorTotal = todosContratos.reduce(
        (sum, fc) => sum + Number(fc.valorContrato),
        0
      );

      const faturaAtualizada = await prisma.fatura.update({
        where: { id: faturaId },
        data: {
          valorTotal: novoValorTotal.toString(),
        },
        include: {
          cliente: true,
          contratos: {
            include: {
              contrato: true,
            },
          },
        },
      });

      // Log de auditoria
      const headersList = await headers();
      const requestInfo = getRequestInfo(headersList);
      await logUpdate(
        AuditEntity.FATURA,
        faturaAtualizada.id.toString(),
        `Contrato adicionado à fatura: ${faturaAtualizada.numeroFatura}`,
        fatura,
        faturaAtualizada,
        ctx.auth?.user?.id,
        ctx.auth?.user?.email,
        { ...requestInfo, contratoId }
      );

      return serializarFatura(faturaAtualizada);
    }),

  // Atualizar valor do contrato na fatura
  atualizarValorContrato: createPermissionProcedure(Permission.FATURAS_UPDATE)
    .input(atualizarValorContratoFaturaSchema)
    .mutation(async ({ input, ctx }) => {
      const { faturaContratoId, valorContrato } = input;

      const faturaContrato = await prisma.faturaContrato.findUnique({
        where: { id: faturaContratoId },
        include: {
          fatura: true,
        },
      });

      if (!faturaContrato) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Vínculo contrato-fatura não encontrado",
        });
      }

      if (faturaContrato.fatura.status === "PAGA") {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Não é possível editar valores de fatura paga",
        });
      }

      // Atualiza valor do contrato
      await prisma.faturaContrato.update({
        where: { id: faturaContratoId },
        data: {
          valorContrato: valorContrato.toString(),
        },
      });

      // Atualiza valor total da fatura
      const todosContratos = await prisma.faturaContrato.findMany({
        where: { faturaId: faturaContrato.faturaId },
      });

      const novoValorTotal = todosContratos.reduce(
        (sum, fc) => sum + Number(fc.valorContrato),
        0
      );

      const faturaAtualizada = await prisma.fatura.update({
        where: { id: faturaContrato.faturaId },
        data: {
          valorTotal: novoValorTotal.toString(),
        },
        include: {
          cliente: true,
          contratos: {
            include: {
              contrato: true,
            },
          },
        },
      });

      // Log de auditoria
      const headersList = await headers();
      const requestInfo = getRequestInfo(headersList);
      await logUpdate(
        AuditEntity.FATURA,
        faturaAtualizada.id.toString(),
        `Valor do contrato atualizado na fatura: ${faturaAtualizada.numeroFatura}`,
        faturaContrato.fatura,
        faturaAtualizada,
        ctx.auth?.user?.id,
        ctx.auth?.user?.email,
        { ...requestInfo, faturaContratoId, novoValor: valorContrato }
      );

      return serializarFatura(faturaAtualizada);
    }),

  // Buscar contratos do mês do cliente
  contratosDoMes: createPermissionProcedure(Permission.FATURAS_VIEW)
    .input(z.object({
      clienteId: z.number(),
      mesReferencia: z.number().int().min(1).max(12),
      anoReferencia: z.number().int(),
    }))
    .query(async ({ input }) => {
      const { clienteId, mesReferencia, anoReferencia } = input;

      const dataInicio = new Date(anoReferencia, mesReferencia - 1, 1);
      const dataFim = new Date(anoReferencia, mesReferencia, 0, 23, 59, 59);

      const contratos = await prisma.contrato.findMany({
        where: {
          clienteId,
          dataHoraEmissao: {
            gte: dataInicio,
            lte: dataFim,
          },
        },
        include: {
          equipamentos: {
            include: {
              equipamento: true,
            },
          },
          devolucoes: {
            select: {
              statusItemDevolucao: true,
            },
          },
        },
        orderBy: {
          dataHoraEmissao: "desc",
        },
      });

      return contratos.map((contrato) => ({
        ...contrato,
        valorTotal: Number(contrato.valorTotal),
        equipamentos: contrato.equipamentos.map((ec) => ({
          ...ec,
          valorUnitario: Number(ec.valorUnitario),
          valorTotal: Number(ec.valorTotal),
          valorFrete: Number(ec.valorFrete),
        })),
      }));
    }),
});

