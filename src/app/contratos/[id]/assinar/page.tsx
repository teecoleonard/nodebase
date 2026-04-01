"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
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
import { AssinaturaCanvas } from "@/features/contratos/components/assinatura-canvas";
import { trpc } from "@/trpc/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/formatters/date";
import { formatCurrency } from "@/lib/utils/formatters/currency";

export default function AssinarContratoPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [assinaturaData, setAssinaturaData] = useState<string | null>(null);

  const contratoId = parseInt(params.id as string);

  const { data: contrato, isLoading } = trpc.contratos.getById.useQuery(
    { id: contratoId },
    { enabled: !isNaN(contratoId) }
  );

  const assinarMutation = trpc.contratos.assinar.useMutation({
    onSuccess: () => {
      toast({
        title: "Contrato assinado!",
        description: "A assinatura foi registrada com sucesso.",
      });
      router.push(`/contratos/${contratoId}`);
      router.refresh();
    },
    onError: (error) => {
      toast({
        title: "Erro ao assinar contrato",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSaveAssinatura = (assinaturaBase64: string) => {
    setAssinaturaData(assinaturaBase64);
    
    // Salvar assinatura
    assinarMutation.mutate({
      id: contratoId,
      assinaturaBase64,
      tipoAssinatura: "CLIENTE",
    });
  };

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
            Assinar Contrato #{contrato.contratoNum}
          </h1>
          <p className="text-muted-foreground">
            Cliente: {contrato.cliente.contratante}
          </p>
        </div>
      </div>

      {/* Resumo do Contrato */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo do Contrato</CardTitle>
          <CardDescription>Verifique os dados antes de assinar</CardDescription>
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
            <p className="text-sm text-muted-foreground mb-2">Equipamentos</p>
            <div className="space-y-2">
              {contrato.equipamentos.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{item.equipamento.nomeEquip}</p>
                    <p className="text-sm text-muted-foreground">
                      Quantidade: {item.quantidadeEquip}
                    </p>
                  </div>
                  <p className="font-semibold">{formatCurrency(Number(item.valorTotal))}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Valor Total</p>
              <p className="text-3xl font-bold">
                {formatCurrency(Number(contrato.valorTotal))}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Canvas de Assinatura */}
      <AssinaturaCanvas
        onSave={handleSaveAssinatura}
        isLoading={assinarMutation.isPending}
      />

      {assinarMutation.isPending && (
        <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            Salvando assinatura...
          </p>
        </div>
      )}
    </div>
  );
}

