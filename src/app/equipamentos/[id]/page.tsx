import { notFound } from "next/navigation";
import { ArrowLeft, Edit, Trash2, Package, TrendingUp, FileText } from "lucide-react";
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
import { formatCurrency } from "@/lib/utils/formatters/currency";

export default async function EquipamentoDetalhesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();
  
  const { id } = await params;
  const equipamentoId = Number(id);

  if (isNaN(equipamentoId)) {
    notFound();
  }

  try {
    const equipamento = await caller.equipamentos.getById({ id: equipamentoId });

    return (
      <div className="flex flex-col gap-8 p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/equipamentos">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">{equipamento.nomeEquip}</h1>
                <Badge variant={equipamento.quantidadeDisp > 0 ? "default" : "destructive"}>
                  {equipamento.quantidadeDisp > 0 ? "Disponível" : "Indisponível"}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Código: {equipamento.codigoEquip || "N/A"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/equipamentos/${equipamentoId}/editar`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
            </Link>
            <Button variant="destructive" disabled>
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-5">
          {/* Estatísticas */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Estoque</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{equipamento.quantidadeDisp} un.</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Uso</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {equipamento._count?.equipamentosContratos || 0} un.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Preço Diária</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(Number(equipamento.precoDiaria))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Patrimônio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {equipamento.valorPatrimonio 
                  ? formatCurrency(Number(equipamento.valorPatrimonio))
                  : "N/A"}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Informações do Equipamento */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Equipamento</CardTitle>
              <CardDescription>Dados e especificações</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Código</p>
                <p className="text-base font-semibold">{equipamento.codigoEquip || "Não definido"}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Quantidade Disponível</p>
                <p className="text-base font-semibold">{equipamento.quantidadeDisp} unidades</p>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Tabela de Preços</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Diária:</span>
                    <span className="font-medium">{formatCurrency(Number(equipamento.precoDiaria))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Semanal:</span>
                    <span className="font-medium">{formatCurrency(Number(equipamento.precoSemanal))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Quinzenal:</span>
                    <span className="font-medium">{formatCurrency(Number(equipamento.precoQuinzenal))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Mensal:</span>
                    <span className="font-medium">{formatCurrency(Number(equipamento.precoMensal))}</span>
                  </div>
                </div>
              </div>

              {equipamento.valorPatrimonio && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Valor Patrimonial</p>
                    <p className="text-base font-semibold">
                      {formatCurrency(Number(equipamento.valorPatrimonio))}
                    </p>
                  </div>
                </>
              )}

              <Separator />

              <div className="text-xs text-muted-foreground">
                <p>Cadastrado em: {formatDate(equipamento.createdAt)}</p>
                <p>Última atualização: {formatDate(equipamento.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Histórico de Uso */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Uso</CardTitle>
              <CardDescription>Contratos recentes com este equipamento</CardDescription>
            </CardHeader>
            <CardContent>
              {equipamento.equipamentosContratos && equipamento.equipamentosContratos.length > 0 ? (
                <div className="space-y-4">
                  {equipamento.equipamentosContratos.slice(0, 5).map((ec) => (
                    <Link
                      key={ec.id}
                      href={`/contratos/${ec.contrato.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                    >
                      <div>
                        <p className="font-medium">#{ec.contrato.contratoNum}</p>
                        <p className="text-sm text-muted-foreground">
                          {ec.contrato.cliente?.contratante || "Cliente não encontrado"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(ec.contrato.dataHoraEmissao)}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          ec.contrato.statusContrato === "EM_ANDAMENTO" ? "default" :
                          ec.contrato.statusContrato === "FINALIZADO" ? "secondary" :
                          "outline"
                        }>
                          {ec.contrato.statusContrato}
                        </Badge>
                        <p className="text-sm font-semibold mt-1">
                          {ec.quantidadeEquip} un.
                        </p>
                      </div>
                    </Link>
                  ))}
                  
                  {equipamento.equipamentosContratos.length > 5 && (
                    <Button variant="outline" className="w-full" disabled>
                      Ver todo o histórico
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhum uso registrado</p>
                  <p className="text-sm mt-2">
                    Este equipamento ainda não foi utilizado em contratos
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    notFound();
  }
}

