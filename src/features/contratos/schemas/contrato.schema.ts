import { z } from "zod";

export const periodoContratoEnum = z.enum([
  "DIARIA",
  "SEMANAL",
  "QUINZENAL",
  "MENSAL",
]);

export const statusContratoEnum = z.enum([
  "PENDENTE",
  "ASSINADO",
  "EM_ANDAMENTO",
  "DEVOLVIDO_PARCIALMENTE",
  "FINALIZADO",
  "CANCELADO",
]);

export const statusAssinaturaEnum = z.enum(["PENDENTE", "ASSINADO"]);

// Schema para equipamentos no contrato
export const equipamentoContratoSchema = z.object({
  equipamentoId: z.number(),
  quantidadeEquip: z.number().int().min(1, "Quantidade mínima é 1"),
  valorUnitario: z.number().min(0),
  valorTotal: z.number().min(0),
  valorFrete: z.number().min(0).optional(),
});

export const createContratoSchema = z.object({
  clienteId: z.number(),
  contratoNum: z.string().min(1, "Número do contrato é obrigatório"),
  dataHoraEmissao: z.date(),
  dataVenc: z.date(),
  obraLocal: z.string().max(200).optional().nullable(),
  contratoPeriodo: periodoContratoEnum,
  entregaLocal: z.string().max(200).optional().nullable(),
  respPedido: z.string().max(100).optional().nullable(),
  valorTotal: z.number().min(0),
  equipamentos: z
    .array(equipamentoContratoSchema)
    .min(1, "Adicione pelo menos um equipamento"),
});

export const updateContratoSchema = z.object({
  id: z.number(),
  clienteId: z.number().optional(),
  dataHoraEmissao: z.date().optional(),
  dataVenc: z.date().optional(),
  obraLocal: z.string().max(200).optional().nullable(),
  contratoPeriodo: periodoContratoEnum.optional(),
  entregaLocal: z.string().max(200).optional().nullable(),
  respPedido: z.string().max(100).optional().nullable(),
  valorTotal: z.number().min(0).optional(),
  equipamentos: z.array(equipamentoContratoSchema).optional(),
});

export const getContratoByIdSchema = z.object({
  id: z.number(),
});

export const deleteContratoSchema = z.object({
  id: z.number(),
});

export const listContratosSchema = z.object({
  clienteId: z.number().optional(),
  status: statusContratoEnum.optional(),
  arquivado: z.boolean().optional(),
  dataInicio: z.date().optional(),
  dataFim: z.date().optional(),
  query: z.string().optional(),
  limit: z.number().default(50),
  offset: z.number().default(0),
});

export const atualizarStatusContratoSchema = z.object({
  contratoId: z.number(),
  novoStatus: statusContratoEnum,
  observacao: z.string().optional(),
});

export const assinarContratoSchema = z.object({
  id: z.number(),
  assinaturaBase64: z.string().min(1, "Assinatura é obrigatória"),
  tipoAssinatura: z.enum(["CLIENTE", "TESTEMUNHA_1", "TESTEMUNHA_2"]),
});

export const arquivarContratoSchema = z.object({
  contratoId: z.number(),
  arquivar: z.boolean(),
});

export const gerarProximoNumeroSchema = z.object({
  clienteId: z.number(),
});

export const renovarContratoSchema = z.object({
  contratoId: z.number(),
  dataVenc: z.date(),
  valorTotal: z.number().min(0),
  equipamentos: z
    .array(equipamentoContratoSchema)
    .min(1, "Adicione pelo menos um equipamento"),
  obraLocal: z.string().max(200).optional(),
  entregaLocal: z.string().max(200).optional(),
  respPedido: z.string().max(100).optional(),
});

export type CreateContratoInput = z.infer<typeof createContratoSchema>;
export type UpdateContratoInput = z.infer<typeof updateContratoSchema>;
export type EquipamentoContratoInput = z.infer<typeof equipamentoContratoSchema>;
export type RenovarContratoInput = z.infer<typeof renovarContratoSchema>;

