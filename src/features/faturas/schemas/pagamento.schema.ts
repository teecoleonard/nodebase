import { z } from "zod";

export const registrarPagamentoSchema = z.object({
  id: z.number().int().positive(),
  valorPago: z.coerce.number().positive("Valor deve ser positivo"),
  dataPagamento: z.date(),
  metodoPagamento: z.string().min(1, "Método de pagamento é obrigatório").optional(),
  observacoes: z.string().optional(),
});

export type RegistrarPagamentoInput = z.infer<typeof registrarPagamentoSchema>;

