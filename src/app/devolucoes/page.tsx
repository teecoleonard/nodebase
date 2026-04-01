import { requireAuth } from "@/lib/auth-utils";
import { caller } from "@/trpc/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DevolucoesFiltros } from "@/features/devolucoes/components/devolucoes-filtros";
import { DevolucoesListView } from "@/features/devolucoes/components/devolucoes-list-view";
import { ExportDevolucoes } from "@/features/devolucoes/components/export-devolucoes";

export default async function DevolucoesPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    query?: string;
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

  if (params.query) filtrosComuns.query = params.query;
  if (params.dataInicio && params.dataFim) {
    filtrosComuns.dataInicio = new Date(params.dataInicio);
    filtrosComuns.dataFim = new Date(params.dataFim);
  }

  const buscarPorStatus = async (status: "PENDENTE" | "PARCIAL" | "DEVOLVIDO") => {
    if (params.status && params.status !== "all" && params.status !== status) {
      return { devolucoes: [], total: 0 };
    }

    const resultado = await caller.devolucoes.list({
      ...filtrosComuns,
      status,
    });

    return {
      devolucoes: resultado.devolucoes,
      total: resultado.total,
    };
  };

  const [pendentes, parciais, concluidas] = await Promise.all([
    buscarPorStatus("PENDENTE"),
    buscarPorStatus("PARCIAL"),
    buscarPorStatus("DEVOLVIDO"),
  ]);

  const defaultTab =
    params.status === "DEVOLVIDO"
      ? "concluidas"
      : params.status === "PARCIAL"
        ? "parciais"
        : "pendentes";

  const totalFiltrado =
    pendentes.devolucoes.length + parciais.devolucoes.length + concluidas.devolucoes.length;

  function DevolucoesList({ devolucoes }: { devolucoes: any[] }) {
    if (devolucoes.length === 0) {
      return (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          <p>Nenhuma devolução encontrada</p>
          {(params.query || params.dataInicio || params.status) && (
            <p className="mt-2 text-sm">
              Ajuste os filtros para visualizar outros resultados
            </p>
          )}
        </div>
      );
    }

    return <DevolucoesListView devolucoes={devolucoes} />;
  }

  const todasDevolucoes = [
    ...pendentes.devolucoes,
    ...parciais.devolucoes,
    ...concluidas.devolucoes,
  ];

  return (
    <div className="flex flex-col gap-5 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Devoluções</h1>
          <p className="text-muted-foreground">
            Gerencie devoluções ({totalFiltrado} {params.query || params.status || params.dataInicio ? "filtradas" : "total"})
          </p>
        </div>
        <div className="flex gap-2">
          <ExportDevolucoes devolucoes={todasDevolucoes} />
        </div>
      </div>

      <DevolucoesFiltros />

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList>
          <TabsTrigger value="pendentes">Pendentes ({pendentes.devolucoes.length})</TabsTrigger>
          <TabsTrigger value="parciais">Parciais ({parciais.devolucoes.length})</TabsTrigger>
          <TabsTrigger value="concluidas">Concluídas ({concluidas.devolucoes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pendentes" className="mt-2 space-y-4">
          <DevolucoesList devolucoes={pendentes.devolucoes} />
        </TabsContent>

        <TabsContent value="parciais" className="mt-2 space-y-4">
          <DevolucoesList devolucoes={parciais.devolucoes} />
        </TabsContent>

        <TabsContent value="concluidas" className="mt-2 space-y-4">
          <DevolucoesList devolucoes={concluidas.devolucoes} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
