"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/formatters/currency";
import { Package, ShoppingCart, TrendingUp } from "lucide-react";

interface EquipamentosListViewProps {
  equipamentos: any[];
}

export function EquipamentosListView({ equipamentos }: EquipamentosListViewProps) {
  const [selecionado, setSelecionado] = useState<number | null>(null);

  useEffect(() => {
    if (equipamentos.length > 0) {
      setSelecionado((prev) => {
        if (prev && equipamentos.some((eq) => eq.id === prev)) {
          return prev;
        }
        return equipamentos[0].id;
      });
    } else {
      setSelecionado(null);
    }
  }, [equipamentos]);

  const equipamentoAtivo = equipamentos.find((eq) => eq.id === selecionado) || null;

  const getStatusBadge = (item: any) => {
    const disponivel = (item?.quantidadeDisp ?? 0) > 0;
    if (disponivel) {
      return <Badge className="bg-emerald-600 text-white">Disponível</Badge>;
    }
    return <Badge variant="outline">Sem estoque</Badge>;
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_1fr]">
      <Card className="surface-card h-full">
        <CardHeader>
          <CardTitle>Equipamentos</CardTitle>
          <CardDescription>Selecione um item para ver os detalhes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 max-h-[65vh] overflow-auto pr-2">
          {equipamentos.map((equipamento) => (
            <button
              key={equipamento.id}
              onClick={() => setSelecionado(equipamento.id)}
              className={cn(
                "w-full rounded-2xl border px-4 py-3 text-left transition-all",
                selecionado === equipamento.id
                  ? "border-primary bg-primary/10 shadow-sm"
                  : "border-transparent bg-muted/30 hover:bg-muted/60"
              )}
            >
              <p className="text-sm font-semibold leading-tight">{equipamento.nomeEquip}</p>
              <p className="text-xs text-muted-foreground">
                {equipamento.codigoEquip ? `Código: ${equipamento.codigoEquip}` : "Sem código"}
              </p>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  {equipamento.quantidadeDisp} un. disponíveis
                </span>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="surface-card min-h-[420px]">
        <CardHeader>
          {equipamentoAtivo ? (
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>{equipamentoAtivo.nomeEquip}</CardTitle>
                <CardDescription>
                  {equipamentoAtivo.codigoEquip || "Sem código"}
                </CardDescription>
              </div>
              {getStatusBadge(equipamentoAtivo)}
            </div>
          ) : (
            <CardTitle>Selecione um equipamento</CardTitle>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {!equipamentoAtivo ? (
            <div className="flex h-64 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
              <Package className="h-10 w-10" />
              <p>Escolha um equipamento na lista para visualizar as informações detalhadas.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: "Diária", value: equipamentoAtivo.precoDiaria },
                  { label: "Semanal", value: equipamentoAtivo.precoSemanal },
                  { label: "Quinzenal", value: equipamentoAtivo.precoQuinzenal },
                  { label: "Mensal", value: equipamentoAtivo.precoMensal },
                ].map((preco) => (
                  <div key={preco.label} className="rounded-2xl bg-muted/20 p-4">
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                      {preco.label}
                    </p>
                    <p className="text-xl font-semibold">
                      {formatCurrency(preco.value ?? 0)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Tabela {preco.label.toLowerCase()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border p-4">
                  <p className="text-xs font-medium uppercase text-muted-foreground">Estoque</p>
                  <p className="text-2xl font-semibold">
                    {equipamentoAtivo.quantidadeDisp}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {equipamentoAtivo.quantidadeDisp > 0 ? "Disponível" : "Sem itens"}
                  </p>
                </div>
                <div className="rounded-2xl border p-4">
                  <p className="text-xs font-medium uppercase text-muted-foreground">Utilizações</p>
                  <p className="text-2xl font-semibold">
                    {equipamentoAtivo._count?.equipamentosContratos ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Contratos registrados</p>
                </div>
              </div>

              <div className="rounded-2xl border bg-muted/20 p-4 flex items-center gap-4">
                <TrendingUp className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Valor estimado do ativo</p>
                  <p className="text-xl font-semibold">
                    {equipamentoAtivo.valorPatrimonio
                      ? formatCurrency(equipamentoAtivo.valorPatrimonio)
                      : "Não informado"}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Link href={`/equipamentos/${equipamentoAtivo.id}`} className="w-full">
                  <Button className="w-full">
                    <Package className="mr-2 h-4 w-4" />
                    Ver detalhes
                  </Button>
                </Link>
                <Link href={`/equipamentos/${equipamentoAtivo.id}/editar`} className="w-full">
                  <Button variant="outline" className="w-full">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Editar equipamento
                  </Button>
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

