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
import { formatDate } from "@/lib/utils/formatters/date";
import {
  Calendar,
  Package,
  User,
  ClipboardList,
  Eye,
} from "lucide-react";

interface DevolucoesListViewProps {
  devolucoes: any[];
}

export function DevolucoesListView({ devolucoes }: DevolucoesListViewProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    if (devolucoes.length > 0) {
      setSelectedId((prev) => {
        if (prev && devolucoes.some((item) => item.id === prev)) {
          return prev;
        }
        return devolucoes[0].id;
      });
    } else {
      setSelectedId(null);
    }
  }, [devolucoes]);

  const devolucaoAtiva = devolucoes.find((dev) => dev.id === selectedId) || null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDENTE":
        return <Badge variant="outline">Pendente</Badge>;
      case "PARCIAL":
        return <Badge variant="secondary">Parcial</Badge>;
      default:
        return <Badge variant="default">Concluída</Badge>;
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_1fr]">
      <Card className="surface-card h-full">
        <CardHeader>
          <CardTitle>Devoluções</CardTitle>
          <CardDescription>Selecione um item para ver os detalhes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 max-h-[65vh] overflow-auto pr-2">
          {devolucoes.map((devolucao) => (
            <button
              key={devolucao.id}
              onClick={() => setSelectedId(devolucao.id)}
              className={cn(
                "w-full rounded-2xl border px-4 py-3 text-left transition-all",
                selectedId === devolucao.id
                  ? "border-primary bg-primary/10 shadow-sm"
                  : "border-transparent bg-muted/30 hover:bg-muted/60"
              )}
            >
              <p className="text-sm font-semibold leading-tight">{devolucao.devNum}</p>
              <p className="text-xs text-muted-foreground">
                {devolucao.cliente?.contratante || "Cliente não encontrado"}
              </p>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  {devolucao.equipamento?.nomeEquip || "Equipamento"}
                </span>
                {getStatusBadge(devolucao.statusItemDevolucao)}
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="surface-card min-h-[440px]">
        <CardHeader>
          {devolucaoAtiva ? (
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>Devolução {devolucaoAtiva.devNum}</CardTitle>
                <CardDescription>
                  {devolucaoAtiva.cliente?.contratante || "Cliente não encontrado"}
                </CardDescription>
              </div>
              {getStatusBadge(devolucaoAtiva.statusItemDevolucao)}
            </div>
          ) : (
            <CardTitle>Selecione uma devolução</CardTitle>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {!devolucaoAtiva ? (
            <div className="flex h-64 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
              <ClipboardList className="h-10 w-10" />
              <p>Escolha uma devolução na lista para visualizar as informações.</p>
            </div>
          ) : (
            <>
              <div className="rounded-2xl bg-muted/20 p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  {devolucaoAtiva.equipamento?.nomeEquip || "Equipamento não encontrado"}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  {devolucaoAtiva.cliente?.contratante}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Prevista: {formatDate(devolucaoAtiva.dataDevolucaoPrevista)}
                </div>
                {devolucaoAtiva.dataDevolucaoEfetiva && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Efetiva: {formatDate(devolucaoAtiva.dataDevolucaoEfetiva)}
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border p-4">
                  <p className="text-xs font-medium uppercase text-muted-foreground">Contratada</p>
                  <p className="text-2xl font-semibold">
                    {devolucaoAtiva.quantidadeContratada} un.
                  </p>
                </div>
                <div className="rounded-2xl border p-4">
                  <p className="text-xs font-medium uppercase text-muted-foreground">Devolvida</p>
                  <p className="text-2xl font-semibold">
                    {devolucaoAtiva.quantidadeDevolvida} un.
                  </p>
                </div>
              </div>

              {devolucaoAtiva.observacaoItemDevolucao && (
                <div className="rounded-2xl border bg-muted/20 p-4 text-sm text-muted-foreground">
                  {devolucaoAtiva.observacaoItemDevolucao}
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <Link href={`/devolucoes/${devolucaoAtiva.id}`} className="w-full">
                  <Button className="w-full">
                    <Eye className="mr-2 h-4 w-4" />
                    Ver devolução
                  </Button>
                </Link>
                <Link href={`/contratos/${devolucaoAtiva.contratoId}`} className="w-full">
                  <Button variant="outline" className="w-full">
                    <User className="mr-2 h-4 w-4" />
                    Ver contrato
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

