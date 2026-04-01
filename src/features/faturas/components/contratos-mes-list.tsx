"use client";

import { trpc } from "@/trpc/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/formatters/date";
import { formatCurrency } from "@/lib/utils/formatters/currency";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface ContratosMesListProps {
  clienteId: number;
  mesReferencia: number;
  anoReferencia: number;
}

export function ContratosMesList({ clienteId, mesReferencia, anoReferencia }: ContratosMesListProps) {
  const { data: contratos, isLoading } = trpc.faturas.contratosDoMes.useQuery({
    clienteId,
    mesReferencia,
    anoReferencia,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDENTE":
        return <Badge variant="outline">Pendente</Badge>;
      case "ASSINADO":
        return <Badge variant="secondary">Assinado</Badge>;
      case "EM_ANDAMENTO":
        return <Badge className="bg-blue-600">Em Andamento</Badge>;
      case "DEVOLVIDO_PARCIALMENTE":
        return <Badge className="bg-orange-600">Devolvido Parcialmente</Badge>;
      case "FINALIZADO":
        return <Badge className="bg-green-600">Finalizado</Badge>;
      case "CANCELADO":
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contratos do Mês</CardTitle>
          <CardDescription>
            Carregando contratos de {String(mesReferencia).padStart(2, "0")}/{anoReferencia}...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  if (!contratos || contratos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contratos do Mês</CardTitle>
          <CardDescription>
            Contratos de {String(mesReferencia).padStart(2, "0")}/{anoReferencia}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhum contrato encontrado para este mês.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contratos do Mês</CardTitle>
        <CardDescription>
          {contratos.length} contrato(s) em {String(mesReferencia).padStart(2, "0")}/{anoReferencia}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {contratos.map((contrato) => (
            <div
              key={contrato.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">Contrato #{contrato.contratoNum}</p>
                  {getStatusBadge(contrato.statusContrato)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Local: {contrato.obraLocal || "Não informado"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Emissão: {formatDate(new Date(contrato.dataHoraEmissao))} • 
                  Vencimento: {formatDate(new Date(contrato.dataVenc))}
                </p>
                {contrato.equipamentos && contrato.equipamentos.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {contrato.equipamentos.length} equipamento(s)
                  </p>
                )}
              </div>
              <div className="text-right mr-4">
                <p className="font-bold text-lg">
                  {formatCurrency(contrato.valorTotal)}
                </p>
              </div>
              <Link href={`/contratos/${contrato.id}`}>
                <Button variant="ghost" size="sm">
                  <FileText className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

