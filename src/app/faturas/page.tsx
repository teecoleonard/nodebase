import Link from "next/link";
import { AlertTriangle, ClipboardList, DollarSign } from "lucide-react";
import { requireAuth } from "@/lib/auth-utils";
import { caller } from "@/trpc/server";
import { formatCurrency } from "@/lib/utils/formatters/currency";
import { FaturasClienteListView } from "@/features/faturas/components/faturas-cliente-list-view";
import { FaturasFiltros } from "@/features/faturas/components/faturas-filtros";

export default async function FaturasPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    cliente?: string;
    mesReferencia?: string;
    anoReferencia?: string;
    dataInicio?: string;
    dataFim?: string;
  }>;
}) {
  await requireAuth();
  const params = await searchParams;

  const filtrosComuns: any = {
    limit: 200,
    offset: 0,
  };

  // Aplicar filtros
  if (params.status && params.status !== "all") {
    filtrosComuns.status = params.status as any;
  }

  if (params.cliente) {
    const clienteId = Number.parseInt(params.cliente);
    if (!Number.isNaN(clienteId)) {
      filtrosComuns.clienteId = clienteId;
    }
  }

  if (params.mesReferencia && params.mesReferencia !== "all") {
    const mes = Number.parseInt(params.mesReferencia);
    if (!Number.isNaN(mes)) {
      filtrosComuns.mesReferencia = mes;
    }
  }

  if (params.anoReferencia) {
    const ano = Number.parseInt(params.anoReferencia);
    if (!Number.isNaN(ano)) {
      filtrosComuns.anoReferencia = ano;
    }
  }

  // Aplicar filtros de data (podem ser independentes)
  if (params.dataInicio) {
    filtrosComuns.dataInicio = new Date(params.dataInicio);
  }
  if (params.dataFim) {
    filtrosComuns.dataFim = new Date(params.dataFim);
  }

  // Buscar faturas por status
  const buscarPorStatus = async (status: "PENDENTE" | "PAGA" | "VENCIDA") => {
    if (params.status && params.status !== "all" && params.status !== status) {
      return { faturas: [], total: 0 };
    }

    const resultado = await caller.faturas.list({
      ...filtrosComuns,
      status,
    });

    return {
      faturas: resultado.faturas,
      total: resultado.total,
    };
  };

  // Buscar todas as faturas para calcular os totais dos cards
  const [pendentes, pagas, vencidas] = await Promise.all([
    buscarPorStatus("PENDENTE"),
    buscarPorStatus("PAGA"),
    buscarPorStatus("VENCIDA"),
  ]);

  const pendentesFiltrados = pendentes.faturas;
  const pagasFiltradas = pagas.faturas;
  const vencidasFiltradas = vencidas.faturas;

  const totalPendente = pendentesFiltrados.reduce(
    (acc, f) => acc + Number(f.valorTotal),
    0,
  );
  const totalPago = pagasFiltradas.reduce(
    (acc, f) => acc + Number(f.valorTotal),
    0,
  );
  const totalVencido = vencidasFiltradas.reduce(
    (acc, f) => acc + Number(f.valorTotal),
    0,
  );

  const totalFiltrado =
    pendentesFiltrados.length +
    pagasFiltradas.length +
    vencidasFiltradas.length;

  const totalMonetarioFiltrado = totalPendente + totalPago + totalVencido;

  const agora = new Date();
  const vencidasCriticas = [...vencidasFiltradas]
    .sort(
      (a, b) =>
        new Date(a.dataVencimento).getTime() -
        new Date(b.dataVencimento).getTime(),
    )
    .slice(0, 4);

  const quinzeDiasMs = 1000 * 60 * 60 * 24 * 15;
  const pendentesProximos = pendentesFiltrados
    .filter((f) => {
      const data = new Date(f.dataVencimento);
      const diff = data.getTime() - agora.getTime();
      return diff >= 0 && diff <= quinzeDiasMs;
    })
    .sort(
      (a, b) =>
        new Date(a.dataVencimento).getTime() -
        new Date(b.dataVencimento).getTime(),
    )
    .slice(0, 4);

  const distribuicaoStatus = [
    {
      chave: "PENDENTE",
      label: "Pendentes",
      quantidade: pendentesFiltrados.length,
      valorTotal: totalPendente,
      href: "/faturas?status=PENDENTE",
      cor: "bg-amber-500",
    },
    {
      chave: "PAGA",
      label: "Pagas",
      quantidade: pagasFiltradas.length,
      valorTotal: totalPago,
      href: "/faturas?status=PAGA",
      cor: "bg-emerald-500",
    },
    {
      chave: "VENCIDA",
      label: "Vencidas",
      quantidade: vencidasFiltradas.length,
      valorTotal: totalVencido,
      href: "/faturas?status=VENCIDA",
      cor: "bg-red-500",
    },
  ];

  // Converter clienteId de string para number se presente
  const clienteIdSelecionado = params.cliente
    ? Number.parseInt(params.cliente)
    : null;

  const filtrosAtivos = Boolean(
    params.status ||
      params.cliente ||
      params.mesReferencia ||
      params.anoReferencia ||
      params.dataInicio ||
      params.dataFim,
  );

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6 px-4 py-8">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                Gestão de Faturas
              </p>
              <h1 className="mt-2 text-3xl font-bold leading-tight">Faturas</h1>
              <p className="text-sm text-slate-500">
                {totalFiltrado}{" "}
                {filtrosAtivos ? "registros filtrados" : "faturas no total"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/faturas?status=VENCIDA"
                className="inline-flex items-center gap-2 rounded-md border border-red-100 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
              >
                <AlertTriangle className="h-4 w-4" />
                Ver vencidas
              </Link>
              <Link
                href="/faturas?status=PENDENTE"
                className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white"
              >
                <ClipboardList className="h-4 w-4" />
                Pendências
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-3 text-sm md:grid-cols-4">
            <StatusBox
              label="Pendentes"
              value={formatCurrency(totalPendente)}
              count={`${pendentesFiltrados.length} fatura(s)`}
            />
            <StatusBox
              label="Pagas"
              value={formatCurrency(totalPago)}
              count={`${pagasFiltradas.length} fatura(s)`}
            />
            <StatusBox
              label="Vencidas"
              value={formatCurrency(totalVencido)}
              count={`${vencidasFiltradas.length} fatura(s)`}
            />
            <StatusBox
              label="Volume filtrado"
              value={totalFiltrado.toString()}
              count={formatCurrency(totalMonetarioFiltrado)}
            />
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <FaturasFiltros variant="compact" />
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-0 shadow-sm">
          <FaturasClienteListView
            clienteIdSelecionado={
              clienteIdSelecionado && !Number.isNaN(clienteIdSelecionado)
                ? clienteIdSelecionado
                : null
            }
            filtros={{
              status: params.status !== "all" ? params.status : undefined,
              mesReferencia: params.mesReferencia,
              anoReferencia: params.anoReferencia,
              dataInicio: params.dataInicio
                ? new Date(params.dataInicio)
                : undefined,
              dataFim: params.dataFim ? new Date(params.dataFim) : undefined,
            }}
          />
        </section>
      </div>
    </div>
  );
}

function StatusBox({
  label,
  value,
  count,
}: {
  label: string;
  value: string;
  count: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700">
      <p className="text-xs font-semibold uppercase text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
      <p className="text-xs text-slate-500">{count}</p>
    </div>
  );
}
