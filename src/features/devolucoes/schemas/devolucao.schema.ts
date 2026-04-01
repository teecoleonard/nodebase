import { z } from "zod";

export const statusItemDevolucaoEnum = z.enum([
  "PENDENTE",
  "PARCIAL",
  "DEVOLVIDO",
]);

export const listDevolucoesSchema = z.object({
  contratoId: z.number().optional(),
  clienteId: z.number().optional(),
  equipamentoId: z.number().optional(),
  status: statusItemDevolucaoEnum.optional(),
  dataInicio: z.date().optional(),
  dataFim: z.date().optional(),
  query: z.string().optional(),
  limit: z.number().default(50),
  offset: z.number().default(0),
});

export const getDevolucaoByIdSchema = z.object({
  id: z.number(),
});

export const confirmarDevolucaoSchema = z.object({
  devolucaoId: z.number(),
  quantidadeDevolvida: z.number().int().min(0),
  observacao: z.string().optional(),
  fotos: z.array(z.string()).optional(), // Base64 ou URLs
});

export const finalizarDevolucaoSchema = z.object({
  devolucaoId: z.number(),
});

export const assinarDevolucaoSchema = z.object({
  devolucaoId: z.number(),
  assinaturaBase64: z.string().min(1),
  nomeArquivo: z.string(),
});

export const registrarDevolucaoSchema = z.object({
  contratoId: z.number(),
  equipamentos: z.array(
    z.object({
      equipamentoId: z.number(),
      quantidadeDevolvida: z.number().int().min(0),
      observacao: z.string().optional().nullable(),
    })
  ).min(1, "Adicione pelo menos um equipamento"),
  assinaturaBase64: z.string().min(1, "Assinatura é obrigatória"),
});

export type ConfirmarDevolucaoInput = z.infer<typeof confirmarDevolucaoSchema>;
export type RegistrarDevolucaoInput = z.infer<typeof registrarDevolucaoSchema>;

