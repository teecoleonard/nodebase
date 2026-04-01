"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FiltroSelect } from "@/components/filtros/filtro-select";
import { FiltroData } from "@/components/filtros/filtro-data";
import { Filter, X } from "lucide-react";

export function ContratosFiltros() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [periodo, setPeriodo] = useState(searchParams.get("periodo") || "all");
  const [cliente, setCliente] = useState(searchParams.get("cliente") || "");
  const [dataInicio, setDataInicio] = useState<Date | undefined>(
    searchParams.get("dataInicio") ? new Date(searchParams.get("dataInicio")!) : undefined
  );
  const [dataFim, setDataFim] = useState<Date | undefined>(
    searchParams.get("dataFim") ? new Date(searchParams.get("dataFim")!) : undefined
  );

  // Abre automaticamente se houver filtros aplicados
  const temFiltrosAplicados = 
    status !== "all" || 
    periodo !== "all" || 
    cliente !== "" || 
    dataInicio !== undefined || 
    dataFim !== undefined;
  
  const [mostrarFiltros, setMostrarFiltros] = useState(temFiltrosAplicados);

  useEffect(() => {
    const temFiltros = 
      status !== "all" || 
      periodo !== "all" || 
      cliente !== "" || 
      dataInicio !== undefined || 
      dataFim !== undefined;
    setMostrarFiltros(temFiltros);
  }, [status, periodo, cliente, dataInicio, dataFim]);

  const aplicarFiltros = () => {
    const params = new URLSearchParams();
    
    if (status !== "all") params.set("status", status);
    if (periodo !== "all") params.set("periodo", periodo);
    if (cliente) params.set("cliente", cliente);
    if (dataInicio) params.set("dataInicio", dataInicio.toISOString());
    if (dataFim) params.set("dataFim", dataFim.toISOString());

    router.push(`/contratos?${params.toString()}`);
  };

  const limparFiltros = () => {
    setStatus("all");
    setPeriodo("all");
    setCliente("");
    setDataInicio(undefined);
    setDataFim(undefined);
    router.push("/contratos");
  };

  const statusOptions = [
    { value: "PENDENTE", label: "Pendente" },
    { value: "EM_ANDAMENTO", label: "Em Andamento" },
    { value: "FINALIZADO", label: "Finalizado" },
    { value: "ARQUIVADO", label: "Arquivado" },
  ];

  const periodoOptions = [
    { value: "DIARIA", label: "Diária" },
    { value: "SEMANAL", label: "Semanal" },
    { value: "QUINZENAL", label: "Quinzenal" },
    { value: "MENSAL", label: "Mensal" },
  ];

  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        onClick={() => setMostrarFiltros(!mostrarFiltros)}
        className="w-full sm:w-auto"
      >
        <Filter className="mr-2 h-4 w-4" />
        {mostrarFiltros ? "Ocultar Filtros" : "Mostrar Filtros"}
      </Button>

      {mostrarFiltros && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Filtros Avançados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Cliente</label>
                <Input
                  placeholder="Nome do cliente..."
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <FiltroSelect
                  label="Selecione o status"
                  value={status}
                  onChange={setStatus}
                  options={statusOptions}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Período</label>
                <FiltroSelect
                  label="Selecione o período"
                  value={periodo}
                  onChange={setPeriodo}
                  options={periodoOptions}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Data Início</label>
                <FiltroData
                  label="Selecione a data"
                  value={dataInicio}
                  onChange={setDataInicio}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Data Fim</label>
                <FiltroData
                  label="Selecione a data"
                  value={dataFim}
                  onChange={setDataFim}
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t">
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

