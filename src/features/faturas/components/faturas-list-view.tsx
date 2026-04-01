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
  Eye,
  FileText,
  User,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

interface FaturasListViewProps {
  faturas: any[];
}

export function FaturasListView({ faturas }: FaturasListViewProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const selectedFatura = faturas.find((fatura) => fatura.id === selectedId);

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "PAGA":
        return (
          <Badge className="bg-green-600 text-white">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Paga
          </Badge>
        );
      case "VENCIDA":
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Vencida
          </Badge>
        );
      case "PENDENTE":
        return (
          <Badge variant="outline">
            <Clock className="mr-1 h-3 w-3" />
            Pendente
          </Badge>
        );
      case "CANCELADA":
        return <Badge variant="secondary">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
      <Card className="surface-card">
        <CardHeader>
          <CardTitle>Faturas</CardTitle>
          <CardDescription>
            Clique em uma fatura para ver os detalhes
          </CardDescription>
        </CardHeader>
        <CardContent className="max-h-[70vh] space-y-2 overflow-y-auto pr-2">
          {faturas.map((fatura) => (
            <button
              key={fatura.id}
              className={cn(
                "w-full rounded-2xl border px-4 py-3 text-left transition-colors",
                selectedId === fatura.id
                  ? "border-primary bg-primary/10"
                  : "border-transparent bg-muted/40 hover:bg-muted/70",
              )}
              onClick={() => setSelectedId(fatura.id)}
            >
              <p className="text-sm font-semibold">{fatura.numeroFatura}</p>
              <p className="text-xs text-muted-foreground">
                {fatura.cliente?.contratante || "Cliente não encontrado"}
              </p>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="surface-card min-h-[360px]">
        <CardContent className="flex h-full flex-col gap-6 p-6">
          {!selectedFatura ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
              <p className="text-lg font-medium">
                Clique em uma fatura para visualizar informações
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
                    {selectedFatura.numeroFatura}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {selectedFatura.cliente?.contratante ||
                      "Cliente não encontrado"}
                  </CardDescription>
                </div>
                {renderStatusBadge(selectedFatura.status)}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border bg-muted/20 p-4">
                  <p className="text-xs font-medium uppercase text-muted-foreground">
                    Valor Total
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(Number(selectedFatura.valorTotal))}
                  </p>
                </div>
                <div className="rounded-2xl border bg-muted/20 p-4">
                  <p className="text-xs font-medium uppercase text-muted-foreground">
                    Valor Pago
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(Number(selectedFatura.valorPago))}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Emissão</p>
                    <p className="font-medium">
                      {formatDate(new Date(selectedFatura.dataEmissao))}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Vencimento</p>
                    <p className="font-medium">
                      {formatDate(new Date(selectedFatura.dataVencimento))}
                    </p>
                  </div>
                </div>
                {selectedFatura.dataPagamento && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-xs text-muted-foreground">Pagamento</p>
                      <p className="font-medium text-green-600">
                        {formatDate(new Date(selectedFatura.dataPagamento))}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Referência
                    </p>
                    <p className="font-medium">
                      {selectedFatura.mesReferencia}/
                      {selectedFatura.anoReferencia}
                    </p>
                  </div>
                </div>
              </div>

              {selectedFatura.contratos && selectedFatura.contratos.length > 0 && (
                <div className="rounded-2xl border bg-muted/20 p-4">
                  <p className="text-xs font-medium uppercase text-muted-foreground mb-2">
                    Contratos Vinculados ({selectedFatura.contratos.length})
                  </p>
                  <div className="space-y-1">
                    {selectedFatura.contratos.slice(0, 3).map((fc: any) => (
                      <div
                        key={fc.id}
                        className="text-sm flex items-center justify-between"
                      >
                        <span>
                          Contrato #{fc.contrato?.contratoNum || "N/A"}
                        </span>
                        <span className="font-medium text-primary">
                          {formatCurrency(Number(fc.valorContrato))}
                        </span>
                      </div>
                    ))}
                    {selectedFatura.contratos.length > 3 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        +{selectedFatura.contratos.length - 3} mais...
                      </p>
                    )}
                  </div>
                </div>
              )}

              {selectedFatura.observacoes && (
                <div className="rounded-2xl border bg-muted/20 p-4">
                  <p className="text-xs font-medium uppercase text-muted-foreground mb-2">
                    Observações
                  </p>
                  <p className="text-sm">{selectedFatura.observacoes}</p>
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2 mt-auto">
                <Link href={`/faturas/${selectedFatura.id}`} className="w-full">
                  <Button className="w-full">
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Detalhes
                  </Button>
                </Link>
                {selectedFatura.status !== "PAGA" &&
                  selectedFatura.status !== "CANCELADA" && (
                    <Link
                      href={`/faturas/${selectedFatura.id}/pagar`}
                      className="w-full"
                    >
                      <Button variant="outline" className="w-full">
                        <DollarSign className="mr-2 h-4 w-4" />
                        Registrar Pagamento
                      </Button>
                    </Link>
                  )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

