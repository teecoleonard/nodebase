import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { requireAuth } from "@/lib/auth-utils";
import { caller } from "@/trpc/server";
import Link from "next/link";
import { EquipamentosFiltros } from "@/features/equipamentos/components/equipamentos-filtros";
import { ExportEquipamentos } from "@/features/equipamentos/components/export-equipamentos";
import { EquipamentosListView } from "@/features/equipamentos/components/equipamentos-list-view";

export default async function EquipamentosPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    query?: string;
    disponibilidade?: string;
    codigo?: string;
    precoMin?: string;
    precoMax?: string;
  }>;
}) {
  await requireAuth();
  
  const params = await searchParams;
  
  const filtrosBackend: any = {
    limit: 100,
    offset: 0,
    query: params.query,
    disponiveisApenas: params.disponibilidade === "disponivel",
  };
  
  const { equipamentos, total } = await caller.equipamentos.list(filtrosBackend);
  
  const precoMin = params.precoMin ? Number(params.precoMin) : undefined;
  const precoMax = params.precoMax ? Number(params.precoMax) : undefined;
  
  const equipamentosFiltrados = equipamentos.filter((equipamento) => {
    if (params.disponibilidade === "sem_estoque" && equipamento.quantidadeDisp > 0) {
      return false;
    }
    if (params.codigo && !equipamento.codigoEquip?.toLowerCase().includes(params.codigo.toLowerCase())) {
      return false;
    }
    const diaria = Number(equipamento.precoDiaria ?? 0);
    if (precoMin !== undefined && diaria < precoMin) {
      return false;
    }
    if (precoMax !== undefined && diaria > precoMax) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipamentos</h1>
          <p className="text-muted-foreground">
            Gerencie seu catálogo de equipamentos ({equipamentosFiltrados.length} {params.disponibilidade || params.codigo || params.precoMin || params.precoMax || params.query ? "filtrado(s)" : "itens"})
          </p>
        </div>
        <div className="flex gap-2">
          <ExportEquipamentos equipamentos={equipamentosFiltrados} />
          <Link href="/equipamentos/novo">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Equipamento
            </Button>
          </Link>
        </div>
      </div>

      <EquipamentosFiltros />

      {equipamentosFiltrados.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          <p>Nenhum equipamento encontrado</p>
          {(params.query || params.disponibilidade || params.codigo || params.precoMin || params.precoMax) && (
            <p className="mt-2 text-sm">
              Tente ajustar os filtros para encontrar mais resultados
            </p>
          )}
        </div>
      ) : (
        <EquipamentosListView equipamentos={equipamentosFiltrados} />
      )}
    </div>
  );
}

