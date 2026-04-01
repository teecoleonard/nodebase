"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FiltroSelect } from "@/components/filtros/filtro-select";
import { FiltroData } from "@/components/filtros/filtro-data";
import { FiltrosMobileDrawer } from "@/components/filtros/filtros-mobile-drawer";
import { X, Filter } from "lucide-react";

export function ClientesFiltros() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [tipo, setTipo] = useState(searchParams.get("tipo") || "all");
  const [cidade, setCidade] = useState(searchParams.get("cidade") || "");
  const [estado, setEstado] = useState(searchParams.get("estado") || "all");
  const [dataCadastroInicio, setDataCadastroInicio] = useState<Date | undefined>(
    searchParams.get("dataCadastroInicio") ? new Date(searchParams.get("dataCadastroInicio")!) : undefined
  );
  const [dataCadastroFim, setDataCadastroFim] = useState<Date | undefined>(
    searchParams.get("dataCadastroFim") ? new Date(searchParams.get("dataCadastroFim")!) : undefined
  );

  // Abre automaticamente se houver filtros aplicados
  const temFiltrosAplicados = 
    query !== "" || 
    tipo !== "all" || 
    cidade !== "" || 
    estado !== "all" || 
    dataCadastroInicio !== undefined || 
    dataCadastroFim !== undefined;
  
  const [mostrarFiltros, setMostrarFiltros] = useState(temFiltrosAplicados);

  useEffect(() => {
    const temFiltros = 
      query !== "" || 
      tipo !== "all" || 
      cidade !== "" || 
      estado !== "all" || 
      dataCadastroInicio !== undefined || 
      dataCadastroFim !== undefined;
    setMostrarFiltros(temFiltros);
  }, [query, tipo, cidade, estado, dataCadastroInicio, dataCadastroFim]);

  const aplicarFiltros = () => {
    const params = new URLSearchParams();
    
    if (query) params.set("query", query);
    if (tipo !== "all") params.set("tipo", tipo);
    if (cidade) params.set("cidade", cidade);
    if (estado !== "all") params.set("estado", estado);
    if (dataCadastroInicio) params.set("dataCadastroInicio", dataCadastroInicio.toISOString());
    if (dataCadastroFim) params.set("dataCadastroFim", dataCadastroFim.toISOString());

    router.push(`/clientes?${params.toString()}`);
  };

  const limparFiltros = () => {
    setQuery("");
    setTipo("all");
    setCidade("");
    setEstado("all");
    setDataCadastroInicio(undefined);
    setDataCadastroFim(undefined);
    router.push("/clientes");
  };

  const tipoOptions = [
    { value: "pf", label: "Pessoa Física" },
    { value: "pj", label: "Pessoa Jurídica" },
  ];

  const estadoOptions = [
    { value: "AC", label: "Acre" },
    { value: "AL", label: "Alagoas" },
    { value: "AP", label: "Amapá" },
    { value: "AM", label: "Amazonas" },
    { value: "BA", label: "Bahia" },
    { value: "CE", label: "Ceará" },
    { value: "DF", label: "Distrito Federal" },
    { value: "ES", label: "Espírito Santo" },
    { value: "GO", label: "Goiás" },
    { value: "MA", label: "Maranhão" },
    { value: "MT", label: "Mato Grosso" },
    { value: "MS", label: "Mato Grosso do Sul" },
    { value: "MG", label: "Minas Gerais" },
    { value: "PA", label: "Pará" },
    { value: "PB", label: "Paraíba" },
    { value: "PR", label: "Paraná" },
    { value: "PE", label: "Pernambuco" },
    { value: "PI", label: "Piauí" },
    { value: "RJ", label: "Rio de Janeiro" },
    { value: "RN", label: "Rio Grande do Norte" },
    { value: "RS", label: "Rio Grande do Sul" },
    { value: "RO", label: "Rondônia" },
    { value: "RR", label: "Roraima" },
    { value: "SC", label: "Santa Catarina" },
    { value: "SP", label: "São Paulo" },
    { value: "SE", label: "Sergipe" },
    { value: "TO", label: "Tocantins" },
  ];

  return (
    <div className="space-y-4">
      {/* Desktop: toggle button */}
      <div className="hidden md:block">
        <Button
          variant="outline"
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className="w-full sm:w-auto"
        >
          <Filter className="mr-2 h-4 w-4" />
          {mostrarFiltros ? "Ocultar Filtros" : "Mostrar Filtros"}
        </Button>
      </div>

      {/* Mobile: usar drawer */}
      <div className="md:hidden">
        <FiltrosMobileDrawer title="Filtros de Clientes">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Filtros Avançados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-1 block">Buscar por Nome, CPF/CNPJ, Email ou Telefone</label>
                  <Input
                    placeholder="Nome, CPF/CNPJ, email ou telefone..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Tipo de Cliente</label>
                  <FiltroSelect
                    label="Selecione o tipo"
                    value={tipo}
                    onChange={setTipo}
                    options={tipoOptions}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Cidade</label>
                  <Input
                    placeholder="Nome da cidade..."
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Estado</label>
                  <FiltroSelect
                    label="Selecione o estado"
                    value={estado}
                    onChange={setEstado}
                    options={estadoOptions}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Cadastro a partir de</label>
                  <FiltroData
                    label="Selecione a data"
                    value={dataCadastroInicio}
                    onChange={setDataCadastroInicio}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Cadastro até</label>
                  <FiltroData
                    label="Selecione a data"
                    value={dataCadastroFim}
                    onChange={setDataCadastroFim}
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
        </FiltrosMobileDrawer>
      </div>

      {/* Desktop: mostrar filtros com toggle */}
      {mostrarFiltros && (
        <div className="hidden md:block">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Filtros Avançados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-1 block">Buscar por Nome, CPF/CNPJ, Email ou Telefone</label>
                <Input
                  placeholder="Nome, CPF/CNPJ, email ou telefone..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Tipo de Cliente</label>
                <FiltroSelect
                  label="Selecione o tipo"
                  value={tipo}
                  onChange={setTipo}
                  options={tipoOptions}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Cidade</label>
                <Input
                  placeholder="Nome da cidade..."
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Estado</label>
                <FiltroSelect
                  label="Selecione o estado"
                  value={estado}
                  onChange={setEstado}
                  options={estadoOptions}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Cadastro a partir de</label>
                <FiltroData
                  label="Selecione a data"
                  value={dataCadastroInicio}
                  onChange={setDataCadastroInicio}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Cadastro até</label>
                <FiltroData
                  label="Selecione a data"
                  value={dataCadastroFim}
                  onChange={setDataCadastroFim}
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
        </div>
      )}
    </div>
  );
}

