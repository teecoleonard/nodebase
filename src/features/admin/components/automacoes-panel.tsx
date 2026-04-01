"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar, FileText, AlertTriangle, Loader2 } from "lucide-react";

export function AutomacoesPanel() {
  const { toast } = useToast();

  const gerarFaturasMutation = trpc.admin.gerarFaturasManual.useMutation({
    onSuccess: (data) => {
      toast({
        title: "✅ Sucesso!",
        description: data.mensagem,
      });
    },
    onError: (error) => {
      toast({
        title: "❌ Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const verificarContratosMutation = trpc.admin.verificarContratosManual.useMutation({
    onSuccess: (data) => {
      toast({
        title: "✅ Sucesso!",
        description: data.mensagem,
      });
    },
    onError: (error) => {
      toast({
        title: "❌ Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const verificarDevolucoesMutation = trpc.admin.verificarDevolucoesManual.useMutation({
    onSuccess: (data) => {
      toast({
        title: "✅ Sucesso!",
        description: data.mensagem,
      });
    },
    onError: (error) => {
      toast({
        title: "❌ Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Faturamento Automático */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-500" />
            <CardTitle>Faturamento Automático</CardTitle>
          </div>
          <CardDescription>
            Gera faturas para contratos do mês anterior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>📅 <strong>Agendado:</strong> Dia 1 de cada mês às 00:00</p>
            <p>📊 <strong>Função:</strong> Agrupa contratos por cliente e gera faturas</p>
            <p>💰 <strong>Ação:</strong> Calcula valores e vincula contratos</p>
          </div>
          <Button
            className="w-full"
            onClick={() => gerarFaturasMutation.mutate()}
            disabled={gerarFaturasMutation.isPending}
          >
            {gerarFaturasMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Executando...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Executar Agora
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Alertas de Contratos */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <CardTitle>Alertas de Contratos</CardTitle>
          </div>
          <CardDescription>
            Verifica contratos próximos do vencimento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>📅 <strong>Agendado:</strong> Diariamente às 09:00</p>
            <p>🚨 <strong>Críticos:</strong> Vencendo em 3 dias</p>
            <p>⚠️ <strong>Avisos:</strong> Vencendo em 7 dias</p>
            <p>🔴 <strong>Vencidos:</strong> Já passaram da data</p>
          </div>
          <Button
            className="w-full"
            variant="outline"
            onClick={() => verificarContratosMutation.mutate()}
            disabled={verificarContratosMutation.isPending}
          >
            {verificarContratosMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Verificar Agora
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Alertas de Devoluções */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            <CardTitle>Alertas de Devoluções</CardTitle>
          </div>
          <CardDescription>
            Monitora devoluções pendentes há mais de 7 dias
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>📅 <strong>Agendado:</strong> Diariamente às 10:00</p>
            <p>⏳ <strong>Pendentes:</strong> Ainda não iniciadas (7+ dias)</p>
            <p>🔄 <strong>Em Andamento:</strong> Parciais não concluídas (7+ dias)</p>
          </div>
          <Button
            className="w-full"
            variant="outline"
            onClick={() => verificarDevolucoesMutation.mutate()}
            disabled={verificarDevolucoesMutation.isPending}
          >
            {verificarDevolucoesMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Verificar Agora
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Card de Informações */}
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>📊 Painel de Monitoramento Inngest</CardTitle>
          <CardDescription>
            Acompanhe execuções, logs e histórico completo das automações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm mb-3">
              O Inngest Dev Server permite visualizar:
            </p>
            <ul className="text-sm space-y-1 ml-4 list-disc text-muted-foreground">
              <li>Todas as funções registradas e seus horários</li>
              <li>Histórico completo de execuções</li>
              <li>Logs detalhados de cada execução</li>
              <li>Erros e stack traces para debugging</li>
              <li>Testar funções manualmente com dados customizados</li>
            </ul>
          </div>
          <Button
            className="w-full"
            variant="secondary"
            onClick={() => window.open("http://localhost:8288", "_blank")}
          >
            Abrir Painel Inngest →
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

