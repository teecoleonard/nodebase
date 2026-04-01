import { TRPCError } from "@trpc/server";
import { z } from "zod";
import prisma from "@/lib/db";
import {
  buscarCEPSchema,
  createClienteSchema,
  deleteClienteSchema,
  getClienteByIdSchema,
  searchClientesSchema,
  updateClienteSchema,
} from "@/features/clientes/schemas/cliente.schema";
import {
  router,
  protectedProcedure,
  adminProcedure,
  editProcedure,
  Permission,
  createPermissionProcedure,
} from "../router-helpers";
import { logCreate, logUpdate, logDelete, getRequestInfo } from "@/lib/audit";
import { AuditEntity } from "@/generated/prisma/enums";
import { headers } from "next/headers";

const MAX_CLIENTES_LIMIT = 100;

export const clientesRouter = router({
  // Listar todos os clientes
  list: createPermissionProcedure(Permission.CLIENTES_VIEW)
    .input(searchClientesSchema)
    .query(async ({ input }) => {
      const { query, limit = 50, offset = 0 } = input;
      const take = Math.min(Math.max(limit, 1), MAX_CLIENTES_LIMIT);
      const skipValue = Math.max(offset, 0);

      const where = query
        ? {
            OR: [
              { contratante: { contains: query, mode: "insensitive" as const } },
              { cpfCnpj: { contains: query, mode: "insensitive" as const } },
              { email: { contains: query, mode: "insensitive" as const } },
              { telefone: { contains: query, mode: "insensitive" as const } },
            ],
          }
        : {};

      const [clientes, total] = await Promise.all([
        prisma.cliente.findMany({
          where,
          take,
          skip: skipValue,
          orderBy: { contratante: "asc" },
          select: {
            id: true,
            contratante: true,
            cpfCnpj: true,
            telefone: true,
            email: true,
            endereco: true,
            numero: true,
            bairro: true,
            cidade: true,
            estado: true,
            cep: true,
            createdAt: true,
          },
        }),
        prisma.cliente.count({ where }),
      ]);

      return {
        clientes,
        total,
        hasMore: skipValue + take < total,
      };
    }),

  // Buscar cliente por ID
  getById: createPermissionProcedure(Permission.CLIENTES_VIEW)
    .input(getClienteByIdSchema)
    .query(async ({ input }) => {
      const cliente = await prisma.cliente.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          contratante: true,
          cpfCnpj: true,
          rgIe: true,
          endereco: true,
          numero: true,
          bairro: true,
          cidade: true,
          estado: true,
          cep: true,
          telefone: true,
          email: true,
          createdAt: true,
          contratos: {
            orderBy: { dataHoraEmissao: "desc" },
            take: 5,
            select: {
              id: true,
              contratoNum: true,
              dataHoraEmissao: true,
              statusContrato: true,
              valorTotal: true,
            },
          },
        },
      });

      if (!cliente) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cliente não encontrado",
        });
      }

      return cliente;
    }),

  // Criar novo cliente
  create: createPermissionProcedure(Permission.CLIENTES_CREATE)
    .input(createClienteSchema)
    .mutation(async ({ input }) => {
      // Verifica se CPF/CNPJ já existe
      const existente = await prisma.cliente.findUnique({
        where: { cpfCnpj: input.cpfCnpj },
      });

      if (existente) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "CPF/CNPJ já cadastrado",
        });
      }

      const cliente = await prisma.cliente.create({
        data: input,
      });

      // Log de auditoria
      const headersList = await headers();
      const requestInfo = getRequestInfo(headersList);
      await logCreate(
        AuditEntity.CLIENTE,
        cliente.id.toString(),
        `Cliente criado: ${cliente.contratante}`,
        cliente,
        ctx.auth?.user?.id,
        ctx.auth?.user?.email,
        { ...requestInfo }
      );

      return cliente;
    }),

  // Atualizar cliente
  update: createPermissionProcedure(Permission.CLIENTES_UPDATE)
    .input(updateClienteSchema)
    .mutation(async ({ input }) => {
      const { id, ...data } = input;

      // Se estiver alterando CPF/CNPJ, verifica duplicação
      if (data.cpfCnpj) {
        const existente = await prisma.cliente.findFirst({
          where: {
            cpfCnpj: data.cpfCnpj,
            NOT: { id },
          },
        });

        if (existente) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "CPF/CNPJ já cadastrado para outro cliente",
          });
        }
      }

      // Busca valores antigos para auditoria
      const clienteAntigo = await prisma.cliente.findUnique({
        where: { id },
      });

      const cliente = await prisma.cliente.update({
        where: { id },
        data,
      });

      // Log de auditoria
      const headersList = await headers();
      const requestInfo = getRequestInfo(headersList);
      await logUpdate(
        AuditEntity.CLIENTE,
        cliente.id.toString(),
        `Cliente atualizado: ${cliente.contratante}`,
        clienteAntigo,
        cliente,
        ctx.auth?.user?.id,
        ctx.auth?.user?.email,
        { ...requestInfo }
      );

      return cliente;
    }),

  // Deletar cliente
  delete: createPermissionProcedure(Permission.CLIENTES_DELETE)
    .input(deleteClienteSchema)
    .mutation(async ({ input }) => {
      // Verifica se cliente tem contratos
      const contratosCount = await prisma.contrato.count({
        where: { clienteId: input.id },
      });

      if (contratosCount > 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message:
            "Não é possível excluir cliente com contratos vinculados. Considere arquivar os contratos primeiro.",
        });
      }

      // Busca cliente antes de deletar para auditoria
      const cliente = await prisma.cliente.findUnique({
        where: { id: input.id },
      });

      await prisma.cliente.delete({
        where: { id: input.id },
      });

      // Log de auditoria
      if (cliente) {
        const headersList = await headers();
        const requestInfo = getRequestInfo(headersList);
        await logDelete(
          AuditEntity.CLIENTE,
          input.id.toString(),
          `Cliente deletado: ${cliente.contratante}`,
          cliente,
          ctx.auth?.user?.id,
          ctx.auth?.user?.email,
          { ...requestInfo }
        );
      }

      return { success: true };
    }),

  // Buscar endereço por CEP (ViaCEP) - Qualquer usuário autenticado pode buscar
  buscarCEP: protectedProcedure
    .input(buscarCEPSchema)
    .query(async ({ input }) => {
      try {
        const response = await fetch(
          `https://viacep.com.br/ws/${input.cep}/json/`,
        );

        if (!response.ok) {
          throw new Error("Erro ao buscar CEP");
        }

        const data = await response.json();

        if (data.erro) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "CEP não encontrado",
          });
        }

        return {
          endereco: data.logradouro,
          bairro: data.bairro,
          cidade: data.localidade,
          estado: data.uf,
          cep: data.cep,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao buscar CEP",
        });
      }
    }),

  // Estatísticas do cliente
  stats: createPermissionProcedure(Permission.CLIENTES_VIEW)
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const [
        contratosAtivos,
        totalContratos,
        valorTotalAggregate,
        devolucoesPendentes,
      ] = await Promise.all([
        prisma.contrato.count({
          where: {
            clienteId: input.id,
            statusContrato: { in: ["EM_ANDAMENTO", "ASSINADO"] },
          },
        }),
        prisma.contrato.count({
          where: {
            clienteId: input.id,
          },
        }),
        prisma.contrato.aggregate({
          where: { clienteId: input.id },
          _sum: { valorTotal: true },
        }),
        prisma.devolucao.count({
          where: {
            clienteId: input.id,
            statusItemDevolucao: "PENDENTE",
          },
        }),
      ]);

      return {
        contratosAtivos,
        totalContratos,
        valorTotal: Number(valorTotalAggregate._sum.valorTotal || 0),
        devolucoesPendentes,
      };
    }),
});

