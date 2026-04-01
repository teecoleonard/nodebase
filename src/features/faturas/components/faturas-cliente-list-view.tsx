"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/formatters/date";
import { formatCurrency } from "@/lib/utils/formatters/currency";
import { trpc } from "@/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign,
  Eye,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  RefreshCw,
  Edit,
} from "lucide-react";
import { EditarFaturaDialog } from "./editar-fatura-dialog";

interface FaturasClienteListViewProps {
  clienteIdSelecionado?: number | null;
  filtros?: {
    status?: string;
    mesReferencia?: string;
    anoReferencia?: string;
    dataInicio?: Date;
    dataFim?: Date;
  };
}

export function FaturasClienteListView({
  clienteIdSelecionado,
  filtros,
}: FaturasClienteListViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [clienteSelecionado, setClienteSelecionado] = useState<number | null>(
    clienteIdSelecionado || null,
  );
  const [faturaAtivaId, setFaturaAtivaId] = useState<number | null>(null);

  const statusFiltro = searchParams.get("status");
  const clienteFiltroUrl = searchParams.get("cliente");
  const mesReferenciaFiltro = searchParams.get("mesReferencia");
  const anoReferenciaFiltro = searchParams.get("anoReferencia");
  const dataInicioFiltro = searchParams.get("dataInicio");
  const dataFimFiltro = searchParams.get("dataFim");

  const clienteSelecionadoUrl = clienteFiltroUrl
    ? Number.parseInt(clienteFiltroUrl)
    : null;

  const selecionarCliente = useCallback(
    (clienteId: number) => {
      setClienteSelecionado(clienteId);
      const params = new URLSearchParams(searchParams.toString());
      params.set("cliente", clienteId.toString());
      router.push(`/faturas?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const temFiltrosAplicados = !!(
    (statusFiltro && statusFiltro !== "all") ||
    (mesReferenciaFiltro && mesReferenciaFiltro !== "all") ||
    anoReferenciaFiltro ||
    dataInicioFiltro ||
    dataFimFiltro
  );

  const {
    data: todasFaturasData,
    isLoading: isLoadingTodasFaturas,
  } = trpc.faturas.list.useQuery(
    {
      status:
        statusFiltro && statusFiltro !== "all" ? (statusFiltro as any) : undefined,
      mesReferencia:
        mesReferenciaFiltro && mesReferenciaFiltro !== "all"
          ? Number.parseInt(mesReferenciaFiltro)
          : undefined,
      anoReferencia: anoReferenciaFiltro
        ? Number.parseInt(anoReferenciaFiltro)
        : undefined,
      dataInicio: dataInicioFiltro ? new Date(dataInicioFiltro) : undefined,
      dataFim: dataFimFiltro ? new Date(dataFimFiltro) : undefined,
      limit: 500,
      offset: 0,
    },
    {
      enabled: temFiltrosAplicados,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  );

  const {
    data: clientesData,
    isLoading: isLoadingClientes,
    isFetching: isFetchingClientes,
    refetch: refetchClientes,
  } = trpc.clientes.list.useQuery(
    {
      limit: 200,
      offset: 0,
    },
    {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  );

  const {
    data: faturasData,
    isLoading: isLoadingFaturas,
    isFetching: isFetchingFaturas,
    refetch: refetchFaturas,
  } = trpc.faturas.list.useQuery(
    {
      clienteId: clienteSelecionado || undefined,
      status:
        statusFiltro && statusFiltro !== "all" ? (statusFiltro as any) : undefined,
      mesReferencia:
        mesReferenciaFiltro && mesReferenciaFiltro !== "all"
          ? Number.parseInt(mesReferenciaFiltro)
          : undefined,
      anoReferencia: anoReferenciaFiltro
        ? Number.parseInt(anoReferenciaFiltro)
        : undefined,
      dataInicio: dataInicioFiltro ? new Date(dataInicioFiltro) : undefined,
      dataFim: dataFimFiltro ? new Date(dataFimFiltro) : undefined,
      limit: 200,
      offset: 0,
    },
    {
      enabled: !!clienteSelecionado,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  );

  const todosClientes = clientesData?.clientes || [];
  const clientesFiltrados =
    temFiltrosAplicados && todasFaturasData?.faturas
      ? (() => {
          const clienteIdsComFaturas = new Set(
            todasFaturasData.faturas.map((f) => f.clienteId),
          );
          return todosClientes
            .filter((c) => clienteIdsComFaturas.has(c.id))
            .map((c) => {
              const quantidadeFaturasFiltradas = todasFaturasData.faturas.filter(
                (f) => f.clienteId === c.id,
              ).length;
              return {
                ...c,
                _count: {
                  ...(c as any)._count,
                  faturasFiltradas: quantidadeFaturasFiltradas,
                },
              };
            });
        })()
      : todosClientes;

  const clientes = [...clientesFiltrados].sort((a, b) => {
    const faturasA = temFiltrosAplicados
      ? (a as any)._count?.faturasFiltradas || 0
      : (a as any)._count?.faturas || 0;
    const faturasB = temFiltrosAplicados
      ? (b as any)._count?.faturasFiltradas || 0
      : (b as any)._count?.faturas || 0;
    return faturasB - faturasA;
  });

  const faturas = faturasData?.faturas || [];
  const clienteAtivo = clientes.find((c) => c.id === clienteSelecionado);
  const faturaAtiva =
    faturas.find((f) => f.id === faturaAtivaId) || (faturas[0] ?? null);

  useEffect(() => {
    if (clienteIdSelecionado && clienteIdSelecionado !== clienteSelecionado) {
      setClienteSelecionado(clienteIdSelecionado);
    } else if (
      clienteSelecionadoUrl &&
      clienteSelecionadoUrl !== clienteSelecionado
    ) {
      setClienteSelecionado(clienteSelecionadoUrl);
    }
  }, [clienteIdSelecionado, clienteSelecionado, clienteSelecionadoUrl]);

  useEffect(() => {
    if (!clienteSelecionado && clientes.length > 0) {
      if (
        clienteSelecionadoUrl &&
        clientes.find((c) => c.id === clienteSelecionadoUrl)
      ) {
        setClienteSelecionado(clienteSelecionadoUrl);
        return;
      }
      const clienteComFaturas = clientes.find((c) => {
        const qtd = temFiltrosAplicados
          ? (c as any)._count?.faturasFiltradas || 0
          : (c as any)._count?.faturas || 0;
        return qtd > 0;
      });
      if (clienteComFaturas) {
        selecionarCliente(clienteComFaturas.id);
      } else {
        selecionarCliente(clientes[0].id);
      }
    }
  }, [clientes, clienteSelecionado, clienteSelecionadoUrl, selecionarCliente, temFiltrosAplicados]);

  useEffect(() => {
    if (
      clientes.length > 0 &&
      clienteSelecionado &&
      !clientes.find((c) => c.id === clienteSelecionado)
    ) {
      selecionarCliente(clientes[0].id);
    }
  }, [clientes, clienteSelecionado, selecionarCliente]);

  useEffect(() => {
    if (clienteSelecionado) {
      refetchFaturas();
    }
  }, [
    clienteSelecionado,
    statusFiltro,
    mesReferenciaFiltro,
    anoReferenciaFiltro,
    dataInicioFiltro,
    dataFimFiltro,
    refetchFaturas,
  ]);

  useEffect(() => {
    if (faturas.length === 0) {
      setFaturaAtivaId(null);
      return;
    }
    if (!faturaAtivaId || !faturas.find((f) => f.id === faturaAtivaId)) {
      setFaturaAtivaId(faturas[0].id);
    }
  }, [faturas, faturaAtivaId]);

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "PAGA":
        return (
          <Badge className="bg-green-600 text-white">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Paga
          </Badge>
        );
      case "VENCIDA":
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Vencida
          </Badge>
        );
      case "PENDENTE":
        return (
          <Badge variant="outline">
            <Clock className="mr-1 h-3 w-3" />
            Pendente
          </Badge>
        );
      case "CANCELADA":
        return <Badge variant="secondary">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
      <Card className="border-r border-slate-200 bg-slate-50/70">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Clientes</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                refetchClientes();
                refetchFaturas();
              }}
              disabled={isFetchingClientes || isFetchingFaturas}
              className="h-8 w-8 p-0"
            >
              <RefreshCw
                className={cn(
                  "h-4 w-4",
                  (isFetchingClientes || isFetchingFaturas) && "animate-spin",
                )}
              />
            </Button>
          </div>
          <CardDescription>
            {temFiltrosAplicados
              ? "Resultado conforme filtros"
              : "Todos os clientes com faturamento"}
          </CardDescription>
        </CardHeader>
        <CardContent className="max-h-[70vh] space-y-2 overflow-y-auto pr-1">
          {isLoadingClientes || (temFiltrosAplicados && isLoadingTodasFaturas) ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-md" />
              ))}
            </div>
          ) : clientes.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500">
              <User className="mx-auto mb-2 h-8 w-8 opacity-40" />
              Nenhum cliente encontrado
            </div>
          ) : (
            clientes.map((cliente) => {
              const quantidadeFaturas = temFiltrosAplicados
                ? (cliente as any)._count?.faturasFiltradas || 0
                : (cliente as any)._count?.faturas || 0;
              return (
                <button
                  key={cliente.id}
                  className={cn(
                    "w-full rounded-lg border px-3 py-2 text-left text-sm",
                    clienteSelecionado === cliente.id
                      ? "border-slate-800 bg-white font-semibold"
                      : "border-transparent bg-slate-100 hover:bg-white",
                  )}
                  onClick={() => selecionarCliente(cliente.id)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate">{cliente.contratante}</span>
                    {quantidadeFaturas > 0 && (
                      <Badge variant="secondary" className="shrink-0">
                        {quantidadeFaturas}
                      </Badge>
                    )}
                  </div>
                  {cliente.cpfCnpj && (
                    <p className="truncate text-xs text-slate-500">
                      {cliente.cpfCnpj}
                    </p>
                  )}
                </button>
              );
            })
          )}
        </CardContent>
      </Card>

      <div className="space-y-4 p-4">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase text-slate-500">
                Cliente selecionado
              </p>
              <h3 className="text-lg font-semibold">
                {clienteAtivo ? clienteAtivo.contratante : "Selecione um cliente"}
              </h3>
              <p className="text-xs text-slate-500">
                {clienteAtivo?.cpfCnpj || "Documento não informado"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" disabled={!clienteAtivo}>
                <FileText className="mr-2 h-4 w-4" />
                Nova fatura
              </Button>
              <Button variant="secondary" size="sm" disabled={!clienteAtivo}>
                <DollarSign className="mr-2 h-4 w-4" />
                Registrar pagamento
              </Button>
            </div>
          </div>

          <div className="p-4">
            {!clienteSelecionado ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-slate-500">
                <FileText className="h-10 w-10 opacity-40" />
                Escolha um cliente para listar as faturas.
              </div>
            ) : isLoadingFaturas ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : faturas.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-slate-500">
                <FileText className="h-10 w-10 opacity-40" />
                Nenhuma fatura encontrada para este cliente.
              </div>
            ) : (
              <>
                <div className="overflow-auto rounded-lg border border-slate-200">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold">Fatura</th>
                        <th className="px-3 py-2 text-left font-semibold">
                          Emissão
                        </th>
                        <th className="px-3 py-2 text-left font-semibold">
                          Vencimento
                        </th>
                        <th className="px-3 py-2 text-right font-semibold">Valor</th>
                        <th className="px-3 py-2 text-left font-semibold">Status</th>
                        <th className="px-3 py-2 text-left font-semibold">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {faturas.map((fatura) => (
                        <tr
                          key={fatura.id}
                          className={cn(
                            "cursor-pointer border-b border-slate-100 text-slate-700 hover:bg-slate-50",
                            faturaAtiva?.id === fatura.id &&
                              "bg-primary/5 hover:bg-primary/10",
                          )}
                          onClick={() => setFaturaAtivaId(fatura.id)}
                        >
                          <td className="px-3 py-2 font-semibold">
                            {fatura.numeroFatura}
                          </td>
                          <td className="px-3 py-2 text-sm">
                            {formatDate(new Date(fatura.dataEmissao))}
                          </td>
                          <td className="px-3 py-2 text-sm">
                            {formatDate(new Date(fatura.dataVencimento))}
                          </td>
                          <td className="px-3 py-2 text-right font-semibold text-slate-900">
                            {formatCurrency(Number(fatura.valorTotal))}
                          </td>
                          <td className="px-3 py-2">
                            {renderStatusBadge(fatura.status)}
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex flex-wrap gap-2">
                              <Link href={`/faturas/${fatura.id}`}>
                                <Button variant="outline" size="xs">
                                  <Eye className="mr-1 h-3 w-3" />
                                  Abrir
                                </Button>
                              </Link>
                              <EditarFaturaDialog
                                fatura={fatura}
                                trigger={
                                  <Button variant="ghost" size="xs">
                                    <Edit className="mr-1 h-3 w-3" />
                                    Editar
                                  </Button>
                                }
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {faturaAtiva && (
                  <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Detalhes da fatura selecionada
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <Detail label="Número" value={faturaAtiva.numeroFatura} />
                      <Detail
                        label="Referência"
                        value={
                          faturaAtiva.mesReferencia && faturaAtiva.anoReferencia
                            ? `${faturaAtiva.mesReferencia}/${faturaAtiva.anoReferencia}`
                            : "—"
                        }
                      />
                      <Detail
                        label="Vencimento"
                        value={formatDate(new Date(faturaAtiva.dataVencimento))}
                      />
                      <Detail
                        label="Valor total"
                        value={formatCurrency(Number(faturaAtiva.valorTotal))}
                      />
                      <Detail
                        label="Valor pago"
                        value={formatCurrency(Number(faturaAtiva.valorPago))}
                      />
                      <Detail label="Status" value={faturaAtiva.status} />
                    </div>
                    {faturaAtiva.observacoes && (
                      <p className="mt-3 text-xs text-slate-500">
                        Observações: {faturaAtiva.observacoes}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className="font-semibold text-slate-800">{value}</p>
    </div>
  );
}

