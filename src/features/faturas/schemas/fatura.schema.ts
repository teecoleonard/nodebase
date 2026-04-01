import { z } from "zod";

export const statusFaturaEnum = z.enum([
  "PENDENTE",
  "PAGA",
  "VENCIDA",
  "CANCELADA",
]);

export const createFaturaSchema = z.object({
  clienteId: z.number(),
  numeroFatura: z.string().min(1),
  dataVencimento: z.date(),
  valorTotal: z.number().min(0),
  mesReferencia: z.number().int().min(1).max(12),
  anoReferencia: z.number().int().min(2020),
  observacoes: z.string().optional(),
  contratosIds: z.array(z.number()).min(1, "Adicione pelo menos um contrato"),
});

const parcelaSchema = z.object({
  id: z.number().optional(),
  numero: z.number().int().min(1),
  dataVencimento: z.date(),
  valor: z.number().min(0),
  portador: z.string().optional(),
  observacao: z.string().optional(),
});

export const updateFaturaSchema = z.object({
  id: z.number(),
  dataVencimento: z.date().optional(),
  valorTotal: z.number().min(0).optional(),
  status: statusFaturaEnum.optional(),
  observacoes: z.string().optional(),
  parcelas: z.array(parcelaSchema).optional(),
});

export const getFaturaByIdSchema = z.object({
  id: z.number(),
});

export const listFaturasSchema = z.object({
  clienteId: z.number().optional(),
  status: statusFaturaEnum.optional(),
  mesReferencia: z.number().int().min(1).max(12).optional(),
  anoReferencia: z.number().int().optional(),
  dataInicio: z.coerce.date().optional(),
  dataFim: z.coerce.date().optional(),
  limit: z.number().default(50),
  offset: z.number().default(0),
});

export const registrarPagamentoSchema = z.object({
  faturaId: z.number(),
  valorPago: z.number().min(0),
  dataPagamento: z.date(),
});

export const cancelarFaturaSchema = z.object({
  faturaId: z.number(),
  motivo: z.string().optional(),
});

export const deleteFaturaSchema = z.object({
  faturaId: z.number(),
});

export const gerarFaturaAutomaticaSchema = z.object({
  mesReferencia: z.number().int().min(1).max(12),
  anoReferencia: z.number().int(),
  diaVencimento: z.number().int().min(1).max(31).default(10),
});

export const adicionarContratoFaturaSchema = z.object({
  faturaId: z.number(),
  contratoId: z.number(),
  valorContrato: z.number().min(0).optional(),
});

export const atualizarValorContratoFaturaSchema = z.object({
  faturaContratoId: z.number(),
  valorContrato: z.number().min(0),
});

export type CreateFaturaInput = z.infer<typeof createFaturaSchema>;
export type UpdateFaturaInput = z.infer<typeof updateFaturaSchema>;
export type ParcelaFaturaInput = z.infer<typeof parcelaSchema>;
export type AdicionarContratoFaturaInput = z.infer<typeof adicionarContratoFaturaSchema>;
export type AtualizarValorContratoFaturaInput = z.infer<typeof atualizarValorContratoFaturaSchema>;

