"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/formatters/date";
import { formatCurrency } from "@/lib/utils/formatters/currency";
import {
  Calendar,
  DollarSign,
  Edit,
  Eye,
  MapPin,
  Package,
  User,
} from "lucide-react";

interface ContratosListViewProps {
  contratos: any[];
}

export function ContratosListView({ contratos }: ContratosListViewProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const selectedContrato = contratos.find(
    (contrato) => contrato.id === selectedId,
  );

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "EM_ANDAMENTO":
        return <Badge variant="default">Em andamento</Badge>;
      case "PENDENTE":
        return <Badge variant="outline">Pendente</Badge>;
      case "FINALIZADO":
        return <Badge variant="secondary">Finalizado</Badge>;
      case "ARQUIVADO":
        return <Badge>Arquivado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
      <Card className="surface-card">
        <CardHeader>
          <CardTitle>Contratos</CardTitle>
          <CardDescription>
            Clique em um contrato para ver os detalhes
          </CardDescription>
        </CardHeader>
        <CardContent className="max-h-[70vh] space-y-2 overflow-y-auto pr-2">
          {contratos.map((contrato) => (
            <button
              key={contrato.id}
              className={cn(
                "w-full rounded-2xl border px-4 py-3 text-left transition-colors",
                selectedId === contrato.id
                  ? "border-primary bg-primary/10"
                  : "border-transparent bg-muted/40 hover:bg-muted/70",
              )}
              onClick={() => setSelectedId(contrato.id)}
            >
              <p className="text-sm font-semibold">
                Contrato #{contrato.contratoNum}
              </p>
              <p className="text-xs text-muted-foreground">
                {contrato.cliente?.contratante || "Cliente não encontrado"}
              </p>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="surface-card min-h-[360px]">
        <CardContent className="flex h-full flex-col gap-6 p-6">
          {!selectedContrato ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
              <p className="text-lg font-medium">
                Clique em um contrato para visualizar informações
              </p>
              <p className="text-sm">
                Selecione um item na lista ao lado para ver detalhes completos
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">
                    Contrato #{selectedContrato.contratoNum}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {selectedContrato.cliente?.contratante ||
                      "Cliente não encontrado"}
                  </CardDescription>
                </div>
                {renderStatusBadge(selectedContrato.statusContrato)}
              </div>

              <div className="rounded-2xl bg-muted/30 p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Emissão
                    </p>
                    <p className="font-semibold text-foreground">
                      {formatDate(selectedContrato.dataHoraEmissao)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Vencimento
                    </p>
                    <p className="font-semibold text-primary">
                      {formatDate(selectedContrato.dataVenc)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Período
                    </p>
                    <p className="flex items-center gap-1 font-semibold">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {selectedContrato.contratoPeriodo}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Valor Total
                    </p>
                    <p className="flex items-center gap-1 text-lg font-bold text-primary">
                      <DollarSign className="h-4 w-4" />
                      {formatCurrency(Number(selectedContrato.valorTotal))}
                    </p>
                  </div>
                </div>

                {selectedContrato.obraLocal && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {selectedContrato.obraLocal}
                  </div>
                )}
              </div>

              <div className="space-y-3 rounded-2xl border border-dashed border-muted-foreground/40 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <Package className="h-4 w-4" />
                  Equipamentos
                </div>
                {selectedContrato.equipamentos?.length ? (
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {selectedContrato.equipamentos.slice(0, 4).map((item: any) => (
                      <li key={item.id} className="flex items-center justify-between">
                        <span className="line-clamp-1">
                          {item.equipamento?.nomeEquip || "Equipamento"}
                        </span>
                        <span className="font-medium text-foreground">
                          {item.quantidade} un.
                        </span>
                      </li>
                    ))}
                    {selectedContrato.equipamentos.length > 4 && (
                      <li className="text-xs italic">
                        + {selectedContrato.equipamentos.length - 4} equipamentos
                      </li>
                    )}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nenhum equipamento vinculado.
                  </p>
                )}
              </div>

              <div className="mt-auto flex flex-col gap-2 sm:flex-row sm:gap-3">
                <Link href={`/contratos/${selectedContrato.id}`} className="flex-1">
                  <Button className="w-full">
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Contrato
                  </Button>
                </Link>
                <Link
                  href={`/contratos/${selectedContrato.id}/editar`}
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full">
                    <Edit className="mr-2 h-4 w-4" />
                    Editar Contrato
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

