"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FiltroSelect } from "@/components/filtros/filtro-select";
import { FiltroData } from "@/components/filtros/filtro-data";
import { Filter, X } from "lucide-react";
import { trpc } from "@/trpc/client";
import { cn } from "@/lib/utils";

type FaturasFiltrosProps = {
  variant?: "default" | "inline" | "compact";
};

export function FaturasFiltros({ variant = "default" }: FaturasFiltrosProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [cliente, setCliente] = useState(searchParams.get("cliente") || "");
  const [mesReferencia, setMesReferencia] = useState(
    searchParams.get("mesReferencia") || "all",
  );
  const [anoReferencia, setAnoReferencia] = useState(
    searchParams.get("anoReferencia") || "",
  );
  const [dataInicio, setDataInicio] = useState<Date | undefined>(
    searchParams.get("dataInicio")
      ? new Date(searchParams.get("dataInicio")!)
      : undefined,
  );
  const [dataFim, setDataFim] = useState<Date | undefined>(
    searchParams.get("dataFim")
      ? new Date(searchParams.get("dataFim")!)
      : undefined,
  );

  // Sincronizar estado com URL quando mudar
  useEffect(() => {
    const urlStatus = searchParams.get("status") || "all";
    const urlCliente = searchParams.get("cliente") || "";
    const urlMesReferencia = searchParams.get("mesReferencia") || "all";
    const urlAnoReferencia = searchParams.get("anoReferencia") || "";
    const urlDataInicio = searchParams.get("dataInicio");
    const urlDataFim = searchParams.get("dataFim");

    if (urlStatus !== status) setStatus(urlStatus);
    if (urlCliente !== cliente) setCliente(urlCliente);
    if (urlMesReferencia !== mesReferencia) setMesReferencia(urlMesReferencia);
    if (urlAnoReferencia !== anoReferencia) setAnoReferencia(urlAnoReferencia);
    
    const newDataInicio = urlDataInicio ? new Date(urlDataInicio) : undefined;
    const currentDataInicioTime = dataInicio?.getTime();
    const newDataInicioTime = newDataInicio?.getTime();
    if (currentDataInicioTime !== newDataInicioTime) {
      setDataInicio(newDataInicio);
    }

    const newDataFim = urlDataFim ? new Date(urlDataFim) : undefined;
    const currentDataFimTime = dataFim?.getTime();
    const newDataFimTime = newDataFim?.getTime();
    if (currentDataFimTime !== newDataFimTime) {
      setDataFim(newDataFim);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  // Abre automaticamente se houver filtros aplicados
  const temFiltrosAplicados =
    status !== "all" ||
    cliente !== "" ||
    mesReferencia !== "all" ||
    anoReferencia !== "" ||
    dataInicio !== undefined ||
    dataFim !== undefined;
  
  const isInline = variant === "inline" || variant === "compact";
  const isCompact = variant === "compact";

  const [mostrarFiltros, setMostrarFiltros] = useState(
    isInline ? true : temFiltrosAplicados,
  );

  useEffect(() => {
    if (isInline) {
      setMostrarFiltros(true);
      return;
    }

    const temFiltros =
      status !== "all" ||
      cliente !== "" ||
      mesReferencia !== "all" ||
      anoReferencia !== "" ||
      dataInicio !== undefined ||
      dataFim !== undefined;
    setMostrarFiltros(temFiltros);
  }, [status, cliente, mesReferencia, anoReferencia, dataInicio, dataFim, isInline]);

  // Buscar clientes para o select
  const { data: clientesData } = trpc.clientes.list.useQuery({
    limit: 100,
    offset: 0,
  });

  const aplicarFiltros = () => {
    const params = new URLSearchParams();

    if (status !== "all") params.set("status", status);
    if (cliente) params.set("cliente", cliente);
    if (mesReferencia !== "all") params.set("mesReferencia", mesReferencia);
    if (anoReferencia) params.set("anoReferencia", anoReferencia);
    if (dataInicio) params.set("dataInicio", dataInicio.toISOString());
    if (dataFim) params.set("dataFim", dataFim.toISOString());

    router.push(`/faturas?${params.toString()}`);
  };

  const limparFiltros = () => {
    setStatus("all");
    setCliente("");
    setMesReferencia("all");
    setAnoReferencia("");
    setDataInicio(undefined);
    setDataFim(undefined);
    router.push("/faturas");
  };

  const statusOptions = [
    { value: "PENDENTE", label: "Pendente" },
    { value: "PAGA", label: "Paga" },
    { value: "VENCIDA", label: "Vencida" },
    { value: "CANCELADA", label: "Cancelada" },
  ];

  const mesOptions = [
    { value: "1", label: "Janeiro" },
    { value: "2", label: "Fevereiro" },
    { value: "3", label: "Março" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Maio" },
    { value: "6", label: "Junho" },
    { value: "7", label: "Julho" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" },
  ];

  const clienteOptions =
    clientesData?.clientes.map((c) => ({
      value: c.id.toString(),
      label: c.contratante,
    })) || [];

  const gridClasses = useMemo(
    () =>
      cn(
        "grid gap-3",
        isCompact
          ? "grid-cols-1 sm:grid-cols-3 lg:grid-cols-4"
          : isInline
            ? "grid-cols-1 sm:grid-cols-2"
            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      ),
    [isInline, isCompact],
  );

  return (
    <div className="space-y-4">
      {!isInline && (
        <Button
          variant="outline"
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className="w-full sm:w-auto"
        >
          <Filter className="mr-2 h-4 w-4" />
          {mostrarFiltros ? "Ocultar Filtros" : "Mostrar Filtros"}
        </Button>
      )}

      {(isInline || mostrarFiltros) && (
        <Card
          className={cn(
            isInline && "border-none bg-transparent p-0 shadow-none",
            isCompact && "border-0 bg-transparent p-0 shadow-none",
          )}
        >
          {!isCompact && (
            <CardHeader className={cn("pb-3", isInline && "px-0")}>
              <CardTitle className="text-lg">Filtros Avançados</CardTitle>
            </CardHeader>
          )}
          <CardContent
            className={cn(
              "space-y-4 pt-0",
              isInline && "px-0",
              isCompact && "space-y-3 px-0",
            )}
          >
            <div className={gridClasses}>
              <div
                className={cn(
                  "col-span-full",
                  !isInline && "md:col-span-2 lg:col-span-3",
                  isCompact && "sm:col-span-3 lg:col-span-2",
                )}
              >
                <label className="mb-1 block text-sm font-medium">Cliente</label>
                <FiltroSelect
                  label="Selecione o cliente"
                  value={cliente || "all"}
                  onChange={(value) => setCliente(value === "all" ? "" : value)}
                  options={clienteOptions}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Status</label>
                <FiltroSelect
                  label="Selecione o status"
                  value={status}
                  onChange={setStatus}
                  options={statusOptions}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Mês de Referência
                </label>
                <FiltroSelect
                  label="Selecione o mês"
                  value={mesReferencia}
                  onChange={setMesReferencia}
                  options={mesOptions}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Ano de Referência
                </label>
                <Input
                  type="number"
                  placeholder="Ex: 2025"
                  value={anoReferencia}
                  onChange={(e) => setAnoReferencia(e.target.value)}
                  min="2020"
                  max="2099"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Data Inicial
                </label>
                <FiltroData
                  label="Selecione a data"
                  value={dataInicio}
                  onChange={setDataInicio}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Data Final
                </label>
                <FiltroData
                  label="Selecione a data"
                  value={dataFim}
                  onChange={setDataFim}
                />
              </div>
            </div>

            <div
              className={cn(
                "flex flex-col gap-2 border-t pt-3",
                !isInline && "sm:flex-row sm:justify-end",
                isCompact && "border-none pt-0 sm:flex-row sm:justify-end",
              )}
            >
              <Button variant="outline" onClick={limparFiltros}>
                <X className="mr-2 h-4 w-4" />
                Limpar
              </Button>
              <Button onClick={aplicarFiltros}>
                <Filter className="mr-2 h-4 w-4" />
                Aplicar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

