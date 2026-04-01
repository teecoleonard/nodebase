import { notFound } from "next/navigation";
import { ArrowLeft, Package, Calendar, FileText, CheckCircle, User } from "lucide-react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth-utils";
import { caller } from "@/trpc/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils/formatters/date";
import { GerarPDFButton } from "@/features/devolucoes/components/gerar-pdf-button";

export default async function DevolucaoDetalhesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();
  
  const { id } = await params;
  const devolucaoId = parseInt(id);

  if (isNaN(devolucaoId)) {
    notFound();
  }

  try {
    const devolucao = await caller.devolucoes.getById({ id: devolucaoId });

    if (!devolucao) {
      notFound();
    }

    const getStatusBadge = (status: string) => {
      switch (status) {
        case "DEVOLVIDO":
          return <Badge>Devolvido</Badge>;
        case "PENDENTE":
          return <Badge variant="outline">Pendente</Badge>;
        case "PARCIAL":
          return <Badge variant="secondary">Parcial</Badge>;
        default:
          return <Badge variant="outline">{status}</Badge>;
      }
    };

    const porcentagemDevolvida = devolucao.quantidadeContratada > 0
      ? (devolucao.quantidadeDevolvida / devolucao.quantidadeContratada) * 100
      : 0;

    return (
      <div className="flex flex-col gap-8 p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/devolucoes">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">
                  Devolução {devolucao.devNum}
                </h1>
                {getStatusBadge(devolucao.statusItemDevolucao)}
              </div>
              <p className="text-muted-foreground mt-1">
                Contrato #{devolucao.contrato.contratoNum}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <GerarPDFButton devolucao={devolucao} size="sm" />
            <Link href={`/contratos/${devolucao.contratoId}`}>
              <Button variant="outline" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                Ver Contrato
              </Button>
            </Link>
          </div>
        </div>

        {/* Informações do Cliente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Nome / Razão Social</p>
                <p className="font-semibold">{devolucao.cliente.contratante}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CPF / CNPJ</p>
                <p className="font-semibold">{devolucao.cliente.cpfCnpj}</p>
              </div>
              {devolucao.cliente.telefone && (
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-semibold">{devolucao.cliente.telefone}</p>
                </div>
              )}
              {devolucao.cliente.email && (
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold">{devolucao.cliente.email}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Informações do Equipamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Equipamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Nome do Equipamento</p>
                <p className="font-semibold text-lg">{devolucao.equipamento.nomeEquip}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Código</p>
                <p className="font-semibold">{devolucao.equipamento.codigoEquip || "N/A"}</p>
              </div>
            </div>

            <Separator />

            {/* Quantidades */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Contratada</p>
                <p className="text-3xl font-bold">{devolucao.quantidadeContratada}</p>
              </div>
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Devolvida</p>
                <p className="text-3xl font-bold text-primary">{devolucao.quantidadeDevolvida}</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Faltando</p>
                <p className="text-3xl font-bold">
                  {devolucao.quantidadeContratada - devolucao.quantidadeDevolvida}
                </p>
              </div>
            </div>

            {/* Barra de Progresso */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progresso da Devolução</span>
                <span className="font-semibold">{porcentagemDevolvida.toFixed(0)}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${porcentagemDevolvida}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Datas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Datas
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Data Prevista</p>
              <p className="font-semibold">{formatDate(devolucao.dataDevolucaoPrevista)}</p>
            </div>
            {devolucao.dataDevolucaoEfetiva && (
              <div>
                <p className="text-sm text-muted-foreground">Data Efetiva</p>
                <p className="font-semibold text-green-600">
                  {formatDate(devolucao.dataDevolucaoEfetiva)}
                </p>
                {new Date(devolucao.dataDevolucaoEfetiva) > new Date(devolucao.dataDevolucaoPrevista) && (
                  <p className="text-xs text-red-600 mt-1">
                    ⚠️ Devolução atrasada
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Observações */}
        {devolucao.observacaoItemDevolucao && (
          <Card>
            <CardHeader>
              <CardTitle>Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {devolucao.observacaoItemDevolucao}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Assinatura */}
        {devolucao.statusAssinatura === "ASSINADO" && devolucao.dataAssinatura && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Assinatura
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">
                  Assinado em {formatDate(devolucao.dataAssinatura)}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  } catch (error) {
    console.error("Erro ao carregar devolução:", error);
    notFound();
  }
}

