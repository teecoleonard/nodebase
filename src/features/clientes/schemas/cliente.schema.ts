import { z } from "zod";
import { validarCPFouCNPJ } from "@/lib/utils/validators/cpf-cnpj";

export const createClienteSchema = z.object({
  contratante: z
    .string()
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  cpfCnpj: z.string().refine(validarCPFouCNPJ, {
    message: "CPF ou CNPJ inválido",
  }),
  rgIe: z.string().max(20).optional().nullable(),
  endereco: z.string().max(200).optional().nullable(),
  bairro: z.string().max(100).optional().nullable(),
  cep: z.string().max(10).optional().nullable(),
  cidade: z.string().max(100).optional().nullable(),
  estado: z.string().length(2).optional().nullable(),
  telefone: z.string().max(20).optional().nullable(),
  email: z.string().email("E-mail inválido").optional().nullable(),
});

export const updateClienteSchema = createClienteSchema.partial().extend({
  id: z.number(),
});

export const getClienteByIdSchema = z.object({
  id: z.number(),
});

export const deleteClienteSchema = z.object({
  id: z.number(),
});

export const searchClientesSchema = z.object({
  query: z.string().optional(),
  limit: z.number().default(50),
  offset: z.number().default(0),
});

// Schema para buscar CEP (integração ViaCEP)
export const buscarCEPSchema = z.object({
  cep: z.string().regex(/^\d{8}$/, "CEP deve conter 8 dígitos"),
});

export type CreateClienteInput = z.infer<typeof createClienteSchema>;
export type UpdateClienteInput = z.infer<typeof updateClienteSchema>;

