"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/trpc/client";
import { useToast } from "@/hooks/use-toast";
import { AssinaturaCanvas } from "@/features/contratos/components/assinatura-canvas";
import { Badge } from "@/components/ui/badge";

interface DevolucaoFormProps {
  contratoId: number;
  contrato: any; // Tipo do contrato vindo do getById
}

interface EquipamentoDevolucao {
  equipamentoId: number;
  nome: string;
  codigo: string;
  quantidadeContratada: number;
  quantidadeDevolvida: number;
  observacao: string;
}

export function DevolucaoForm({ contratoId, contrato }: DevolucaoFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [etapa, setEtapa] = useState<"quantidades" | "assinatura">("quantidades");
  const [assinaturaBase64, setAssinaturaBase64] = useState<string | null>(null);

  // Inicializar equipamentos para devolução
  const [equipamentos, setEquipamentos] = useState<EquipamentoDevolucao[]>(
    contrato.equipamentos.map((item: any) => ({
      equipamentoId: item.equipamento.id,
      nome: item.equipamento.nomeEquip,
      codigo: item.equipamento.codigoEquip || "S/C",
      quantidadeContratada: item.quantidadeEquip,
      quantidadeDevolvida: item.quantidadeEquip, // Por padrão, devolver tudo
      observacao: "",
    }))
  );

  const registrarDevolucaoMutation = trpc.devolucoes.registrar.useMutation({
    onSuccess: () => {
      toast({
        title: "Devolução registrada!",
        description: "Os equipamentos foram devolvidos com sucesso.",
      });
      router.push(`/contratos/${contratoId}`);
      router.refresh();
    },
    onError: (error) => {
      toast({
        title: "Erro ao registrar devolução",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const atualizarQuantidade = (equipamentoId: number, quantidade: number) => {
    setEquipamentos(
      equipamentos.map((eq) =>
        eq.equipamentoId === equipamentoId
          ? { ...eq, quantidadeDevolvida: quantidade }
          : eq
      )
    );
  };

  const atualizarObservacao = (equipamentoId: number, observacao: string) => {
    setEquipamentos(
      equipamentos.map((eq) =>
        eq.equipamentoId === equipamentoId
          ? { ...eq, observacao }
          : eq
      )
    );
  };

  const validarQuantidades = () => {
    for (const eq of equipamentos) {
      if (eq.quantidadeDevolvida < 0) {
        toast({
          title: "Quantidade inválida",
          description: `A quantidade devolvida de ${eq.nome} não pode ser negativa.`,
          variant: "destructive",
        });
        return false;
      }
      if (eq.quantidadeDevolvida > eq.quantidadeContratada) {
        toast({
          title: "Quantidade excedida",
          description: `A quantidade devolvida de ${eq.nome} não pode ser maior que a contratada.`,
          variant: "destructive",
        });
        return false;
      }
    }
    return true;
  };

  const handleAvancarParaAssinatura = () => {
    if (!validarQuantidades()) return;
    setEtapa("assinatura");
  };

  const handleSalvarAssinatura = (assinatura: string) => {
    setAssinaturaBase64(assinatura);

    // Registrar devolução
    registrarDevolucaoMutation.mutate({
      contratoId,
      equipamentos: equipamentos.map((eq) => ({
        equipamentoId: eq.equipamentoId,
        quantidadeDevolvida: eq.quantidadeDevolvida,
        observacao: eq.observacao || null,
      })),
      assinaturaBase64: assinatura,
    });
  };

  const totalDevolvido = equipamentos.reduce(
    (sum, eq) => sum + eq.quantidadeDevolvida,
    0
  );
  const totalContratado = equipamentos.reduce(
    (sum, eq) => sum + eq.quantidadeContratada,
    0
  );
  const devolucaoParcial = totalDevolvido < totalContratado;

  if (etapa === "assinatura") {
    return (
      <div className="space-y-6">
        {/* Resumo da Devolução */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo da Devolução</CardTitle>
            <CardDescription>
              Confirme os itens antes de assinar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {equipamentos.map((eq) => (
                <div
                  key={eq.equipamentoId}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{eq.nome}</p>
                    <p className="text-sm text-muted-foreground">
                      Código: {eq.codigo}
                    </p>
                    {eq.observacao && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Obs: {eq.observacao}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      {eq.quantidadeDevolvida} / {eq.quantidadeContratada}
                    </p>
                    <p className="text-xs text-muted-foreground">devolvido</p>
                    {eq.quantidadeDevolvida < eq.quantidadeContratada && (
                      <Badge variant="outline" className="mt-1">Parcial</Badge>
                    )}
                    {eq.quantidadeDevolvida === eq.quantidadeContratada && (
                      <Badge className="mt-1">Completo</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {devolucaoParcial && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900">Devolução Parcial</p>
                  <p className="text-sm text-yellow-700">
                    Nem todos os equipamentos foram devolvidos. O contrato permanecerá ativo.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Canvas de Assinatura */}
        <AssinaturaCanvas
          onSave={handleSalvarAssinatura}
          isLoading={registrarDevolucaoMutation.isPending}
        />

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setEtapa("quantidades")}
            disabled={registrarDevolucaoMutation.isPending}
            className="flex-1"
          >
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Registro de Devolução
        </CardTitle>
        <CardDescription>
          Informe as quantidades devolvidas de cada equipamento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {equipamentos.map((eq) => (
          <div key={eq.equipamentoId} className="space-y-3 p-4 border rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold">{eq.nome}</h4>
                <p className="text-sm text-muted-foreground">
                  Código: {eq.codigo}
                </p>
                <p className="text-sm font-medium mt-1">
                  Quantidade Contratada: {eq.quantidadeContratada}
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor={`quantidade-${eq.equipamentoId}`}>
                  Quantidade Devolvida *
                </Label>
                <Input
                  id={`quantidade-${eq.equipamentoId}`}
                  type="number"
                  min="0"
                  max={eq.quantidadeContratada}
                  value={eq.quantidadeDevolvida}
                  onChange={(e) =>
                    atualizarQuantidade(eq.equipamentoId, Number(e.target.value))
                  }
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Máximo: {eq.quantidadeContratada}
                </p>
              </div>

              <div>
                <Label htmlFor={`observacao-${eq.equipamentoId}`}>
                  Observações
                </Label>
                <Textarea
                  id={`observacao-${eq.equipamentoId}`}
                  placeholder="Ex: Item com avaria, faltando acessório..."
                  value={eq.observacao}
                  onChange={(e) =>
                    atualizarObservacao(eq.equipamentoId, e.target.value)
                  }
                  className="mt-1"
                  rows={2}
                />
              </div>
            </div>

            {eq.quantidadeDevolvida < eq.quantidadeContratada && (
              <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-900">
                ⚠️ Devolução parcial: Faltam {eq.quantidadeContratada - eq.quantidadeDevolvida} unidade(s)
              </div>
            )}
          </div>
        ))}

        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Total de Itens</p>
            <p className="text-2xl font-bold">
              {totalDevolvido} / {totalContratado}
            </p>
          </div>
          <Button
            onClick={handleAvancarParaAssinatura}
            disabled={totalDevolvido === 0}
          >
            Avançar para Assinatura
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

