import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import {
  gerarFaturasAutomaticas,
  alertasContratosVencendo,
  alertasDevolucoesPendentes,
  backupAutomatico,
  rotacaoLogsAuditoria,
} from "@/inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    gerarFaturasAutomaticas,
    alertasContratosVencendo,
    alertasDevolucoesPendentes,
    backupAutomatico,
    rotacaoLogsAuditoria,
  ],
});

