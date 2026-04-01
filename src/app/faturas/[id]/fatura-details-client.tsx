"use client";

import { EditarFaturaDialog } from "@/features/faturas/components/editar-fatura-dialog";
import { AdicionarContratoDialog } from "@/features/faturas/components/adicionar-contrato-dialog";
import { EditarValorContratoDialog } from "@/features/faturas/components/editar-valor-contrato-dialog";
import { ContratosMesList } from "@/features/faturas/components/contratos-mes-list";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/formatters/date";
import { formatCurrency } from "@/lib/utils/formatters/currency";
import Link from "next/link";

interface FaturaDetailsClientProps {
  fatura: any;
}

export function FaturaDetailsClient({ fatura }: FaturaDetailsClientProps) {
  const getContratoStatusBadge = (status: string) => {
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

  return (
    <>
      {/* Contratos Vinculados */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Contratos Incluídos nesta Fatura</CardTitle>
              <CardDescription>
                {fatura.contratos.length} contrato(s) vinculado(s)
              </CardDescription>
            </div>
            {fatura.status !== "PAGA" && (
              <AdicionarContratoDialog fatura={fatura} />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {fatura.contratos.map((fc: any) => (
              <div
                key={fc.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">Contrato #{fc.contrato.contratoNum}</p>
                    <Badge variant="outline" className="text-xs">
                      {fc.contrato.contratoPeriodo}
                    </Badge>
                    {getContratoStatusBadge(fc.contrato.statusContrato)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Local: {fc.contrato.obraLocal || "Não informado"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Emissão: {formatDate(new Date(fc.contrato.dataHoraEmissao))} • 
                    Vencimento: {formatDate(new Date(fc.contrato.dataVenc))}
                  </p>
                </div>
                <div className="text-right mr-4">
                  <p className="font-bold text-lg">
                    {formatCurrency(Number(fc.valorContrato))}
                  </p>
                  {Number(fc.valorContrato) !== Number(fc.contrato.valorTotal) && (
                    <p className="text-xs text-muted-foreground line-through">
                      {formatCurrency(Number(fc.contrato.valorTotal))}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  {fatura.status !== "PAGA" && (
                    <EditarValorContratoDialog faturaContrato={fc} />
                  )}
                  <Link href={`/contratos/${fc.contrato.id}`}>
                    <Button variant="ghost" size="sm">
                      Ver Detalhes
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contratos do Mês */}
      <ContratosMesList
        clienteId={fatura.clienteId}
        mesReferencia={fatura.mesReferencia}
        anoReferencia={fatura.anoReferencia}
      />
    </>
  );
}

