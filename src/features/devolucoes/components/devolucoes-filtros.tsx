"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FiltroSelect } from "@/components/filtros/filtro-select";
import { FiltroData } from "@/components/filtros/filtro-data";
import { Filter, X } from "lucide-react";

export function DevolucoesFiltros() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [dataInicio, setDataInicio] = useState<Date | undefined>(
    searchParams.get("dataInicio") ? new Date(searchParams.get("dataInicio")!) : undefined,
  );
  const [dataFim, setDataFim] = useState<Date | undefined>(
    searchParams.get("dataFim") ? new Date(searchParams.get("dataFim")!) : undefined,
  );

  const aplicarFiltros = () => {
    const params = new URLSearchParams();

    if (status !== "all") params.set("status", status);
    if (query) params.set("query", query);
    if (dataInicio) params.set("dataInicio", dataInicio.toISOString());
    if (dataFim) params.set("dataFim", dataFim.toISOString());

    router.push(`/devolucoes?${params.toString()}`);
  };

  const limparFiltros = () => {
    setStatus("all");
    setQuery("");
    setDataInicio(undefined);
    setDataFim(undefined);
    router.push("/devolucoes");
  };

  const statusOptions = [
    { value: "PENDENTE", label: "Pendentes" },
    { value: "PARCIAL", label: "Parciais" },
    { value: "DEVOLVIDO", label: "Concluídas" },
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
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-1 block">Busca Geral</label>
                <Input
                  placeholder="Número da devolução, cliente ou equipamento..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
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
                <label className="text-sm font-medium mb-1 block">Data Inicial</label>
                <FiltroData
                  label="Selecione a data"
                  value={dataInicio}
                  onChange={setDataInicio}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Data Final</label>
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

