"use client";

import { useState } from "react";
import { ArrowLeft, Package, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { trpc } from "@/trpc/client";
import { useToast } from "@/hooks/use-toast";
import { DevolucaoForm } from "@/features/devolucoes/components/devolucao-form";
import { formatDate } from "@/lib/utils/formatters/date";
import { formatCurrency } from "@/lib/utils/formatters/currency";

export default function DevolverContratoPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const contratoId = parseInt(params.id as string);

  const { data: contrato, isLoading } = trpc.contratos.getById.useQuery(
    { id: contratoId },
    { enabled: !isNaN(contratoId) }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Carregando contrato...</p>
      </div>
    );
  }

  if (!contrato) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Contrato não encontrado</p>
      </div>
    );
  }

  if (contrato.statusContrato !== "EM_ANDAMENTO") {
    return (
      <div className="flex flex-col gap-8 p-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href={`/contratos/${contratoId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Devolução de Equipamentos
            </h1>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-semibold">Contrato não está em andamento</p>
              <p className="text-muted-foreground mt-2">
                Apenas contratos em andamento podem ter devoluções registradas.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Status atual: <strong>{contrato.statusContrato}</strong>
              </p>
              <Link href={`/contratos/${contratoId}`}>
                <Button className="mt-4">Voltar ao Contrato</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getPeriodoLabel = (periodo: string) => {
    const periodos: Record<string, string> = {
      DIARIA: "Diária",
      SEMANAL: "Semanal",
      QUINZENAL: "Quinzenal",
      MENSAL: "Mensal",
    };
    return periodos[periodo] || periodo;
  };

  return (
    <div className="flex flex-col gap-8 p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/contratos/${contratoId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Devolução de Equipamentos
          </h1>
          <p className="text-muted-foreground">
            Contrato #{contrato.contratoNum} - {contrato.cliente.contratante}
          </p>
        </div>
      </div>

      {/* Resumo do Contrato */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo do Contrato</CardTitle>
          <CardDescription>Informações do contrato para devolução</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Número do Contrato</p>
              <p className="font-semibold">{contrato.contratoNum}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Data de Emissão</p>
              <p className="font-semibold">{formatDate(contrato.dataHoraEmissao)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Período</p>
              <p className="font-semibold">{getPeriodoLabel(contrato.contratoPeriodo)}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground mb-2">Equipamentos Contratados</p>
            <div className="space-y-2">
              {contrato.equipamentos.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{item.equipamento.nomeEquip}</p>
                    <p className="text-sm text-muted-foreground">
                      Código: {item.equipamento.codigoEquip || "N/A"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Quantidade</p>
                    <p className="text-lg font-bold">{item.quantidadeEquip}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Valor Total</p>
              <p className="text-2xl font-bold">
                {formatCurrency(Number(contrato.valorTotal))}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulário de Devolução */}
      <DevolucaoForm contratoId={contratoId} contrato={contrato} />
    </div>
  );
}

