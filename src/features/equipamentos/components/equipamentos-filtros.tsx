"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FiltroSelect } from "@/components/filtros/filtro-select";
import { Filter, X } from "lucide-react";

export function EquipamentosFiltros() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [disponibilidade, setDisponibilidade] = useState(searchParams.get("disponibilidade") || "all");
  const [codigo, setCodigo] = useState(searchParams.get("codigo") || "");
  const [precoMin, setPrecoMin] = useState(searchParams.get("precoMin") || "");
  const [precoMax, setPrecoMax] = useState(searchParams.get("precoMax") || "");

  // Abre automaticamente se houver filtros aplicados
  const temFiltrosAplicados = 
    query !== "" || 
    disponibilidade !== "all" || 
    codigo !== "" || 
    precoMin !== "" || 
    precoMax !== "";
  
  const [mostrarFiltros, setMostrarFiltros] = useState(temFiltrosAplicados);

  useEffect(() => {
    const temFiltros = 
      query !== "" || 
      disponibilidade !== "all" || 
      codigo !== "" || 
      precoMin !== "" || 
      precoMax !== "";
    setMostrarFiltros(temFiltros);
  }, [query, disponibilidade, codigo, precoMin, precoMax]);

  const aplicarFiltros = () => {
    const params = new URLSearchParams();
    
    if (query) params.set("query", query);
    if (disponibilidade !== "all") params.set("disponibilidade", disponibilidade);
    if (codigo) params.set("codigo", codigo);
    if (precoMin) params.set("precoMin", precoMin);
    if (precoMax) params.set("precoMax", precoMax);

    router.push(`/equipamentos?${params.toString()}`);
  };

  const limparFiltros = () => {
    setQuery("");
    setDisponibilidade("all");
    setCodigo("");
    setPrecoMin("");
    setPrecoMax("");
    router.push("/equipamentos");
  };

  const disponibilidadeOptions = [
    { value: "disponivel", label: "Disponíveis" },
    { value: "sem_estoque", label: "Sem estoque" },
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
                <label className="text-sm font-medium mb-1 block">Buscar por Nome ou Código</label>
                <Input
                  placeholder="Nome do equipamento ou código..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Código Específico</label>
                <Input
                  placeholder="Código do equipamento..."
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Situação de Estoque</label>
                <FiltroSelect
                  label="Selecione a situação"
                  value={disponibilidade}
                  onChange={setDisponibilidade}
                  options={disponibilidadeOptions}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Preço Mínimo (Diária)</label>
                <Input
                  type="number"
                  placeholder="R$ 0,00"
                  value={precoMin}
                  onChange={(e) => setPrecoMin(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Preço Máximo (Diária)</label>
                <Input
                  type="number"
                  placeholder="R$ 0,00"
                  value={precoMax}
                  onChange={(e) => setPrecoMax(e.target.value)}
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

