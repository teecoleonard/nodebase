import prisma from "@/lib/db";
import { publicProcedure, router } from "../router-helpers";

export const dashboardRouter = router({
  // Dashboard geral do sistema
  resumo: publicProcedure.query(async () => {
    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1;
    const anoAtual = hoje.getFullYear();
    const inicioDaSemana = new Date(hoje);
    inicioDaSemana.setDate(hoje.getDate() - hoje.getDay());

    // Métricas de Contratos
    const [
      contratosAtivos,
      contratosPendentes,
      receitaTotal,
      receitaMesAtual,
      contratosVencendoEstaSemana,
    ] = await Promise.all([
      prisma.contrato.count({
        where: {
          statusContrato: { in: ["EM_ANDAMENTO", "ASSINADO"] },
          arquivado: false,
        },
      }),
      prisma.contrato.count({
        where: {
          statusContrato: "PENDENTE",
          arquivado: false,
        },
      }),
      prisma.contrato.aggregate({
        where: { statusContrato: "FINALIZADO" },
        _sum: { valorTotal: true },
      }),
      prisma.contrato.aggregate({
        where: {
          dataHoraEmissao: {
            gte: new Date(anoAtual, mesAtual - 1, 1),
            lt: new Date(anoAtual, mesAtual, 1),
          },
        },
        _sum: { valorTotal: true },
      }),
      prisma.contrato.count({
        where: {
          dataVenc: {
            gte: inicioDaSemana,
            lte: new Date(inicioDaSemana.getTime() + 7 * 24 * 60 * 60 * 1000),
          },
          statusContrato: { notIn: ["FINALIZADO", "CANCELADO"] },
        },
      }),
    ]);

    // Métricas de Equipamentos
    const [equipamentosTotal, equipamentosDisponiveis, equipamentosEmUso] =
      await Promise.all([
        prisma.equipamento.aggregate({
          _sum: { quantidadeDisp: true },
          _count: { id: true },
        }),
        prisma.equipamento.count({
          where: { quantidadeDisp: { gt: 0 } },
        }),
        prisma.equipamentoContrato.aggregate({
          where: {
            contrato: {
              statusContrato: { in: ["EM_ANDAMENTO", "ASSINADO"] },
            },
          },
          _sum: { quantidadeEquip: true },
        }),
      ]);

    // Métricas de Devoluções
    const [
      devolucoesPendentes,
      devolucoesAtrasadas,
      devolucoesVencendoEstaSemana,
    ] = await Promise.all([
      prisma.devolucao.count({
        where: { statusItemDevolucao: { in: ["PENDENTE", "PARCIAL"] } },
      }),
      prisma.devolucao.count({
        where: {
          statusItemDevolucao: { in: ["PENDENTE", "PARCIAL"] },
          dataDevolucaoPrevista: { lt: hoje },
        },
      }),
      prisma.devolucao.count({
        where: {
          statusItemDevolucao: { in: ["PENDENTE", "PARCIAL"] },
          dataDevolucaoPrevista: {
            gte: inicioDaSemana,
            lte: new Date(inicioDaSemana.getTime() + 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    // Métricas de Faturas
    const [faturasPendentes, faturasVencidas, receitaFaturas, valorAPagar] =
      await Promise.all([
        prisma.fatura.count({
          where: { status: "PENDENTE" },
        }),
        prisma.fatura.count({
          where: { status: "VENCIDA" },
        }),
        prisma.fatura.aggregate({
          where: { status: "PAGA" },
          _sum: { valorPago: true },
        }),
        prisma.fatura.aggregate({
          where: { status: { in: ["PENDENTE", "VENCIDA"] } },
          _sum: { valorTotal: true },
        }),
      ]);

    // Clientes
    const [totalClientes, clientesAtivos] = await Promise.all([
      prisma.cliente.count(),
      prisma.cliente.count({
        where: {
          contratos: {
            some: {
              statusContrato: { in: ["EM_ANDAMENTO", "ASSINADO"] },
            },
          },
        },
      }),
    ]);

    return {
      contratos: {
        ativos: contratosAtivos,
        pendentes: contratosPendentes,
        vencendoEstaSemana: contratosVencendoEstaSemana,
        receitaTotal: Number(receitaTotal._sum.valorTotal || 0),
        receitaMesAtual: Number(receitaMesAtual._sum.valorTotal || 0),
      },
      equipamentos: {
        total: equipamentosTotal._count.id,
        disponiveis: equipamentosDisponiveis,
        emUso: equipamentosEmUso._sum.quantidadeEquip || 0,
        quantidadeTotal: equipamentosTotal._sum.quantidadeDisp || 0,
      },
      devolucoes: {
        pendentes: devolucoesPendentes,
        atrasadas: devolucoesAtrasadas,
        vencendoEstaSemana: devolucoesVencendoEstaSemana,
      },
      faturas: {
        pendentes: faturasPendentes,
        vencidas: faturasVencidas,
        receitaTotal: Number(receitaFaturas._sum.valorPago || 0),
        valorAPagar: Number(valorAPagar._sum.valorTotal || 0),
      },
      clientes: {
        total: totalClientes,
        ativos: clientesAtivos,
      },
    };
  }),

  // Gráfico de receita mensal (últimos 6 meses)
  receitaMensal: publicProcedure.query(async () => {
    const hoje = new Date();
    const meses = [];

    for (let i = 5; i >= 0; i--) {
      const mes = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const proximoMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 1);

      const [receita, contratos] = await Promise.all([
        prisma.contrato.aggregate({
          where: {
            dataHoraEmissao: {
              gte: mes,
              lt: proximoMes,
            },
          },
          _sum: { valorTotal: true },
        }),
        prisma.contrato.count({
          where: {
            dataHoraEmissao: {
              gte: mes,
              lt: proximoMes,
            },
          },
        }),
      ]);

      meses.push({
        mes: mes.toLocaleString("pt-BR", { month: "short" }),
        receita: Number(receita._sum.valorTotal || 0),
        contratos: contratos,
      });
    }

    return meses;
  }),

  // Top 5 clientes por receita
  topClientes: publicProcedure.query(async () => {
    const clientesComReceita = await prisma.cliente.findMany({
      select: {
        id: true,
        contratante: true,
      },
      orderBy: {
        contratos: {
          _count: "desc",
        },
      },
      take: 10, // Busca 10 para depois ordenar por receita e pegar top 5
    });

    // Calcula receita total por cliente
    const clientesProcessados = await Promise.all(
      clientesComReceita.map(async (cliente) => {
        const receita = await prisma.contrato.aggregate({
          where: { clienteId: cliente.id },
          _sum: { valorTotal: true },
        });

        const totalContratos = await prisma.contrato.count({
          where: { clienteId: cliente.id },
        });

        const contratosAtivos = await prisma.contrato.count({
          where: {
            clienteId: cliente.id,
            statusContrato: { in: ["EM_ANDAMENTO", "ASSINADO"] },
          },
        });

        return {
          id: cliente.id,
          contratante: cliente.contratante,
          valorTotal: Number(receita._sum.valorTotal || 0),
          contratosAtivos,
          _count: {
            contratos: totalContratos,
          },
        };
      }),
    );

    // Ordena por receita e retorna top 5
    return clientesProcessados
      .sort((a, b) => Number(b.valorTotal) - Number(a.valorTotal))
      .slice(0, 5);
  }),

  // Equipamentos mais alugados (detalhado)
  topEquipamentos: publicProcedure.query(async () => {
    const equipamentosComUso = await prisma.equipamento.findMany({
      select: {
        id: true,
        nomeEquip: true,
        codigoEquip: true,
        quantidadeDisp: true,
        _count: {
          select: {
            equipamentosContratos: true,
          },
        },
      },
      orderBy: {
        equipamentosContratos: {
          _count: "desc",
        },
      },
      take: 10,
    });

    // Calcula receita gerada por cada equipamento
    const equipamentosProcessados = await Promise.all(
      equipamentosComUso.map(async (equipamento) => {
        const receita = await prisma.equipamentoContrato.aggregate({
          where: { equipamentoId: equipamento.id },
          _sum: { valorTotal: true },
        });

        const emUso = await prisma.equipamentoContrato.aggregate({
          where: {
            equipamentoId: equipamento.id,
            contrato: {
              statusContrato: { in: ["EM_ANDAMENTO", "ASSINADO"] },
            },
          },
          _sum: { quantidadeEquip: true },
        });

        return {
          id: equipamento.id,
          nomeEquip: equipamento.nomeEquip,
          codigoEquip: equipamento.codigoEquip,
          quantidadeDisp: equipamento.quantidadeDisp,
          quantidadeEmUso: emUso._sum.quantidadeEquip || 0,
          vezesAlugado: equipamento._count.equipamentosContratos,
          receitaGerada: Number(receita._sum.valorTotal || 0),
          _count: {
            contratos: equipamento._count.equipamentosContratos,
          },
        };
      }),
    );

    return equipamentosProcessados;
  }),

  // Equipamentos mais alugados (para gráfico de pizza)
  equipamentosChart: publicProcedure.query(async () => {
    const equipamentos = await prisma.equipamento.findMany({
      select: {
        id: true,
        nomeEquip: true,
        _count: {
          select: {
            equipamentosContratos: true,
          },
        },
      },
      orderBy: {
        equipamentosContratos: {
          _count: "desc",
        },
      },
      take: 5,
    });

    return equipamentos.map((eq) => ({
      nome: eq.nomeEquip,
      quantidade: eq._count.equipamentosContratos,
    }));
  }),

  // Alertas e notificações
  alertas: publicProcedure.query(async () => {
    const hoje = new Date();
    const daquiA3Dias = new Date(hoje.getTime() + 3 * 24 * 60 * 60 * 1000);

    const [
      contratosVencendo,
      devolucoesAtrasadas,
      faturasVencidas,
      equipamentosIndisponiveis,
    ] = await Promise.all([
      prisma.contrato.findMany({
        where: {
          dataVenc: {
            gte: hoje,
            lte: daquiA3Dias,
          },
          statusContrato: { in: ["EM_ANDAMENTO", "ASSINADO"] },
        },
        include: {
          cliente: true,
        },
        take: 5,
      }),
      prisma.devolucao.findMany({
        where: {
          statusItemDevolucao: { in: ["PENDENTE", "PARCIAL"] },
          dataDevolucaoPrevista: { lt: hoje },
        },
        include: {
          cliente: true,
          equipamento: true,
        },
        orderBy: { dataDevolucaoPrevista: "asc" },
        take: 5,
      }),
      prisma.fatura.findMany({
        where: {
          status: "VENCIDA",
        },
        include: {
          cliente: true,
        },
        orderBy: { dataVencimento: "asc" },
        take: 5,
      }),
      prisma.equipamento.findMany({
        where: {
          quantidadeDisp: 0,
        },
        take: 5,
      }),
    ]);

    return {
      contratosVencendo: contratosVencendo.map((c) => ({
        id: c.id,
        numero: c.contratoNum,
        cliente: c.cliente.contratante,
        dataVenc: c.dataVenc,
      })),
      devolucoesAtrasadas: devolucoesAtrasadas.map((d) => ({
        id: d.id,
        numero: d.devNum,
        cliente: d.cliente.contratante,
        equipamento: d.equipamento.nomeEquip,
        dataPrevista: d.dataDevolucaoPrevista,
        diasAtraso: Math.ceil(
          (hoje.getTime() - d.dataDevolucaoPrevista.getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      })),
      faturasVencidas: faturasVencidas.map((f) => ({
        id: f.id,
        numero: f.numeroFatura,
        cliente: f.cliente.contratante,
        valor: Number(f.valorTotal),
        dataVenc: f.dataVencimento,
      })),
      equipamentosIndisponiveis: equipamentosIndisponiveis.map((e) => ({
        id: e.id,
        nome: e.nomeEquip,
        codigo: e.codigoEquip,
      })),
    };
  }),
});

