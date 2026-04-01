import { z } from "zod";

export const createEquipamentoSchema = z.object({
  nomeEquip: z
    .string()
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  precoDiaria: z.coerce.number().min(0, "Preço deve ser maior ou igual a zero"),
  precoSemanal: z.coerce.number().min(0, "Preço deve ser maior ou igual a zero"),
  precoQuinzenal: z.coerce.number().min(0, "Preço deve ser maior ou igual a zero"),
  precoMensal: z.coerce.number().min(0, "Preço deve ser maior ou igual a zero"),
  codigoEquip: z.string().max(50).optional().nullable(),
  quantidadeDisp: z
    .coerce.number()
    .int("Quantidade deve ser um número inteiro")
    .min(0, "Quantidade deve ser maior ou igual a zero"),
  valorPatrimonio: z
    .coerce.number()
    .min(0, "Valor deve ser maior ou igual a zero")
    .optional()
    .nullable(),
});

export const updateEquipamentoSchema = createEquipamentoSchema.partial().extend({
  id: z.number(),
});

export const getEquipamentoByIdSchema = z.object({
  id: z.number(),
});

export const deleteEquipamentoSchema = z.object({
  id: z.number(),
});

export const searchEquipamentosSchema = z.object({
  query: z.string().optional(),
  disponiveisApenas: z.boolean().default(false),
  limit: z.number().default(50),
  offset: z.number().default(0),
});

export const atualizarEstoqueSchema = z.object({
  equipamentoId: z.number(),
  quantidade: z.number().int("Quantidade deve ser um número inteiro"),
  operacao: z.enum(["ADICIONAR", "REMOVER"]),
});

export const verificarDisponibilidadeSchema = z.object({
  equipamentoId: z.number(),
  quantidade: z.number().int().min(1),
  dataInicio: z.date(),
  dataFim: z.date(),
  contratoIdExcluir: z.number().optional(), // Para excluir contrato atual na edição
});

export type CreateEquipamentoInput = z.infer<typeof createEquipamentoSchema>;
export type UpdateEquipamentoInput = z.infer<typeof updateEquipamentoSchema>;
export type AtualizarEstoqueInput = z.infer<typeof atualizarEstoqueSchema>;

