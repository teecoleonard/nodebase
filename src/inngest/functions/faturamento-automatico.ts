import { inngest } from "../client";
import prisma from "@/lib/db";

/**
 * Função que gera faturas automaticamente no início de cada mês
 * para contratos ativos/finalizados no mês anterior
 */
export const gerarFaturasAutomaticas = inngest.createFunction(
  {
    id: "gerar-faturas-automaticas",
    name: "Gerar Faturas Automáticas Mensais",
  },
  // Aceita tanto CRON quanto eventos manuais
  [
    { cron: "0 0 1 * *" }, // Executa todo dia 1 às 00:00
    { event: "gerar-faturas-automaticas" }, // Permite acionar manualmente
  ],
  async ({ step, event }) => {
    const mesAnterior = new Date();
    mesAnterior.setMonth(mesAnterior.getMonth() - 1);

    const dataInicio = new Date(mesAnterior.getFullYear(), mesAnterior.getMonth(), 1);
    const dataFim = new Date(mesAnterior.getFullYear(), mesAnterior.getMonth() + 1, 0);

    // Buscar contratos que estavam ativos no mês anterior
    // Inclui: EM_ANDAMENTO, DEVOLVIDO_PARCIALMENTE e FINALIZADO
    const contratos = await step.run("buscar-contratos-mes-anterior", async () => {
      return await prisma.contrato.findMany({
        where: {
          OR: [
            { statusContrato: "EM_ANDAMENTO" },
            { statusContrato: "DEVOLVIDO_PARCIALMENTE" },
            {
              statusContrato: "FINALIZADO",
              updatedAt: {
                gte: dataInicio,
                lte: dataFim,
              },
            },
          ],
          dataHoraEmissao: {
            lte: dataFim,
          },
        },
        include: {
          cliente: true,
        },
      });
    });

    console.log(`📊 Encontrados ${contratos.length} contratos para faturamento`);

    // Agrupar contratos por cliente
    const contratosPorCliente = contratos.reduce((acc, contrato) => {
      if (!acc[contrato.clienteId]) {
        acc[contrato.clienteId] = [];
      }
      acc[contrato.clienteId].push(contrato);
      return acc;
    }, {} as Record<number, typeof contratos>);

    let faturasGeradas = 0;
    const ano = mesAnterior.getFullYear();
    const mes = mesAnterior.getMonth() + 1; // 1-12

    // Gerar uma fatura por cliente
    for (const [clienteId, contratosCliente] of Object.entries(contratosPorCliente)) {
      await step.run(`gerar-fatura-cliente-${clienteId}`, async () => {
        const cliente = contratosCliente[0].cliente;

        // Verificar se já existe fatura para este cliente neste mês
        const faturaExistente = await prisma.fatura.findFirst({
          where: {
            clienteId: parseInt(clienteId),
            mesReferencia: mes,
            anoReferencia: ano,
          },
        });

        if (faturaExistente) {
          console.log(`⚠️  Fatura já existe para cliente ${cliente.contratante} - ${mes}/${ano}`);
          return null;
        }

        // Calcular valor total dos contratos
        const valorTotal = contratosCliente.reduce(
          (sum, c) => sum + Number(c.valorTotal),
          0
        );

        // Gerar número da fatura único (dentro do step para evitar race condition)
        const totalFaturas = await prisma.fatura.count();
        const proximoNumero = `FAT-${ano}-${(totalFaturas + 1).toString().padStart(4, '0')}`;

        // Criar fatura
        const fatura = await prisma.fatura.create({
          data: {
            clienteId: parseInt(clienteId),
            numeroFatura: proximoNumero,
            dataEmissao: new Date(),
            dataVencimento: new Date(new Date().setDate(new Date().getDate() + 30)),
            valorTotal: valorTotal.toString(),
            valorPago: "0",
            status: "PENDENTE",
            observacoes: `Fatura automática referente ao período ${mes.toString().padStart(2, '0')}/${ano}`,
            mesReferencia: mes,
            anoReferencia: ano,
          },
        });

        // Vincular contratos à fatura
        for (const contrato of contratosCliente) {
          await prisma.faturaContrato.create({
            data: {
              faturaId: fatura.id,
              contratoId: contrato.id,
              valorContrato: contrato.valorTotal.toString(),
            },
          });
        }

        console.log(`✅ Fatura ${proximoNumero} gerada para ${cliente.contratante} - R$ ${valorTotal.toFixed(2)}`);
        faturasGeradas++;

        return fatura;
      });
    }

    return {
      sucesso: true,
      periodo: mesAnterior.toISOString().slice(0, 7),
      totalContratos: contratos.length,
      totalClientes: Object.keys(contratosPorCliente).length,
      faturasGeradas,
    };
  }
);

