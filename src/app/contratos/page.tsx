import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { requireAuth } from "@/lib/auth-utils";
import { caller } from "@/trpc/server";
import { ContratosFiltros } from "@/features/contratos/components/contratos-filtros";
import { ExportContratos } from "@/features/contratos/components/export-contratos";
import { ContratosListView } from "@/features/contratos/components/contratos-list-view";

export default async function ContratosPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    periodo?: string;
    cliente?: string;
    dataInicio?: string;
    dataFim?: string;
  }>;
}) {
  await requireAuth();
  const params = await searchParams;
  
  // Preparar filtros comuns
  const filtrosComuns: any = {
    limit: 200,
    offset: 0,
  };
  
  // Aplicar filtro de cliente (busca por nome)
  if (params.cliente) {
    filtrosComuns.query = params.cliente;
  }
  
  // Aplicar filtros de data
  if (params.dataInicio && params.dataFim) {
    filtrosComuns.dataInicio = new Date(params.dataInicio);
    filtrosComuns.dataFim = new Date(params.dataFim);
  }
  
  // Função para filtrar por período
  const filtrarPorPeriodo = (contratos: any[]) => {
    if (!params.periodo || params.periodo === "all") return contratos;
    return contratos.filter((c) => c.contratoPeriodo === params.periodo);
  };
  
  // Buscar contratos por status com filtros aplicados
  // Se status específico foi selecionado, buscar apenas esse status; caso contrário, buscar todos
  const buscarContratosPorStatus = async (status: string) => {
    // Se um status específico foi selecionado, buscar apenas se corresponder
    if (params.status && params.status !== "all" && params.status !== status) {
      return { contratos: [], total: 0 };
    }
    
    const resultado = await caller.contratos.list({ 
      ...filtrosComuns,
      status: status as any, 
    });
    
    return {
      contratos: filtrarPorPeriodo(resultado.contratos),
      total: resultado.total,
    };
  };
  
  const [ativos, pendentes, finalizados] = await Promise.all([
    buscarContratosPorStatus("EM_ANDAMENTO"),
    buscarContratosPorStatus("PENDENTE"),
    buscarContratosPorStatus("FINALIZADO"),
  ]);
  
  const ativosFiltrados = ativos.contratos;
  const pendentesFiltrados = pendentes.contratos;
  const finalizadosFiltrados = finalizados.contratos;

  function ContratosList({ contratos }: { contratos: any[] }) {
    if (contratos.length === 0) {
      return (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          <p>Nenhum contrato encontrado</p>
          {(params.cliente || params.periodo || params.dataInicio || params.status) && (
            <p className="mt-2 text-sm">
              Tente ajustar os filtros para encontrar mais resultados
            </p>
          )}
        </div>
      );
    }

    return <ContratosListView contratos={contratos} />;
  }
  
  return (
    <div className="flex flex-col gap-5 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contratos</h1>
          <p className="text-muted-foreground">
            Gerencie contratos de locação ({ativosFiltrados.length + pendentesFiltrados.length + finalizadosFiltrados.length} {params.cliente || params.periodo || params.dataInicio ? "filtrado(s)" : "total"})
          </p>
        </div>
        <div className="flex gap-2">
          <ExportContratos 
            contratos={[...ativosFiltrados, ...pendentesFiltrados, ...finalizadosFiltrados]} 
          />
          <Link href="/contratos/novo">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Contrato
            </Button>
          </Link>
        </div>
      </div>

      <ContratosFiltros />

      <Tabs defaultValue="ativos" className="w-full">
        <TabsList>
          <TabsTrigger value="ativos">Ativos ({ativosFiltrados.length})</TabsTrigger>
          <TabsTrigger value="pendentes">Pendentes ({pendentesFiltrados.length})</TabsTrigger>
          <TabsTrigger value="finalizados">Finalizados ({finalizadosFiltrados.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="ativos" className="mt-2 space-y-4">
          <ContratosList contratos={ativosFiltrados} />
        </TabsContent>

        <TabsContent value="pendentes" className="mt-2 space-y-4">
          <ContratosList contratos={pendentesFiltrados} />
        </TabsContent>

        <TabsContent value="finalizados" className="mt-2 space-y-4">
          <ContratosList contratos={finalizadosFiltrados} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

