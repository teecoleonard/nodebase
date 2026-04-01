import { FileText, Download, TrendingUp, Users, Package, Receipt } from "lucide-react";
import { requireAuth } from "@/lib/auth-utils";
import { caller } from "@/trpc/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/formatters/currency";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function RelatoriosPage() {
  await requireAuth();

  // Buscar dados para os relatórios
  const [resumo, topClientes, topEquipamentos, receitaMensal] = await Promise.all([
    caller.dashboard.resumo(),
    caller.dashboard.topClientes(),
    caller.dashboard.topEquipamentos(),
    caller.dashboard.receitaMensal(),
  ]);

  return (
    <div className="flex flex-col gap-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">
            Análises e relatórios detalhados do sistema
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Exportar Relatório Completo
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(Number(resumo.contratos.receitaTotal))}
            </div>
            <p className="text-xs text-muted-foreground">
              {resumo.contratos.ativos} contratos ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resumo.clientes.ativos}</div>
            <p className="text-xs text-muted-foreground">
              {resumo.clientes.total} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equipamentos em Uso</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resumo.equipamentos.emUso}</div>
            <p className="text-xs text-muted-foreground">
              {resumo.equipamentos.disponiveis} disponíveis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturas Pendentes</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(Number(resumo.faturas.totalPendente))}
            </div>
            <p className="text-xs text-muted-foreground">
              {resumo.faturas.pendentes} fatura(s)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Relatórios */}
      <Tabs defaultValue="clientes" className="w-full">
        <TabsList>
          <TabsTrigger value="clientes">Top Clientes</TabsTrigger>
          <TabsTrigger value="equipamentos">Top Equipamentos</TabsTrigger>
          <TabsTrigger value="receita">Receita Mensal</TabsTrigger>
        </TabsList>

        {/* Top Clientes */}
        <TabsContent value="clientes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Clientes por Receita</CardTitle>
              <CardDescription>
                Clientes que mais geraram receita no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topClientes.map((cliente: any, index: number) => (
                  <div
                    key={cliente.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="text-lg w-10 h-10 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{cliente.contratante}</p>
                        <p className="text-sm text-muted-foreground">
                          {cliente._count.contratos} contrato(s)
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {formatCurrency(Number(cliente.valorTotal || 0))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Equipamentos */}
        <TabsContent value="equipamentos" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Equipamentos Mais Alugados</CardTitle>
              <CardDescription>
                Equipamentos com maior número de locações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topEquipamentos.map((equipamento: any, index: number) => (
                  <div
                    key={equipamento.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="text-lg w-10 h-10 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{equipamento.nomeEquip}</p>
                        <p className="text-sm text-muted-foreground">
                          Código: {equipamento.codigoEquip}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {equipamento._count.contratos} locações
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {equipamento.quantidadeDisp} disponível(is)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Receita Mensal */}
        <TabsContent value="receita" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Receita dos Últimos 12 Meses</CardTitle>
              <CardDescription>
                Evolução da receita mensal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {receitaMensal.map((mes: any) => (
                  <div
                    key={`${mes.ano}-${mes.mes}`}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div>
                      <p className="font-medium">
                        {new Date(mes.ano, mes.mes - 1).toLocaleDateString("pt-BR", {
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {mes.contratos} contrato(s)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {formatCurrency(Number(mes.receita))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Relatórios Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle>Relatórios Personalizados</CardTitle>
          <CardDescription>
            Gere relatórios específicos para suas necessidades
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Button variant="outline" className="justify-start h-auto p-4" disabled>
            <div className="text-left">
              <p className="font-medium">Relatório de Contratos</p>
              <p className="text-xs text-muted-foreground">
                Exportar todos os contratos com filtros personalizados
              </p>
            </div>
          </Button>

          <Button variant="outline" className="justify-start h-auto p-4" disabled>
            <div className="text-left">
              <p className="font-medium">Relatório Financeiro</p>
              <p className="text-xs text-muted-foreground">
                Análise completa de receitas e pagamentos
              </p>
            </div>
          </Button>

          <Button variant="outline" className="justify-start h-auto p-4" disabled>
            <div className="text-left">
              <p className="font-medium">Relatório de Equipamentos</p>
              <p className="text-xs text-muted-foreground">
                Utilização e disponibilidade de equipamentos
              </p>
            </div>
          </Button>

          <Button variant="outline" className="justify-start h-auto p-4" disabled>
            <div className="text-left">
              <p className="font-medium">Relatório de Devoluções</p>
              <p className="text-xs text-muted-foreground">
                Histórico de devoluções e atrasos
              </p>
            </div>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

