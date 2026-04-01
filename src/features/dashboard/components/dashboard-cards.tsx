import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  FileText,
  Package,
  PackageCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { formatarMoeda } from "@/lib/utils/formatters/currency";

interface DashboardCardsProps {
  data: {
    contratos: {
      ativos: number;
      pendentes: number;
      vencendoEstaSemana: number;
      receitaTotal: number;
      receitaMesAtual: number;
    };
    equipamentos: {
      total: number;
      disponiveis: number;
      emUso: number;
      quantidadeTotal: number;
    };
    devolucoes: {
      pendentes: number;
      atrasadas: number;
      vencendoEstaSemana: number;
    };
    faturas: {
      pendentes: number;
      vencidas: number;
      receitaTotal: number;
      valorAPagar: number;
    };
    clientes: {
      total: number;
      ativos: number;
    };
  };
}

export function DashboardCards({ data }: DashboardCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
      {/* Receita Total */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatarMoeda(data.contratos.receitaTotal)}
          </div>
          <p className="text-xs text-muted-foreground">
            {formatarMoeda(data.contratos.receitaMesAtual)} este mês
          </p>
        </CardContent>
      </Card>

      {/* Contratos Ativos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Contratos Ativos
          </CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.contratos.ativos}</div>
          <p className="text-xs text-muted-foreground">
            {data.contratos.pendentes} pendentes de assinatura
          </p>
        </CardContent>
      </Card>

      {/* Equipamentos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Equipamentos</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.equipamentos.disponiveis}/{data.equipamentos.total}
          </div>
          <p className="text-xs text-muted-foreground">
            {data.equipamentos.emUso} em uso
          </p>
        </CardContent>
      </Card>

      {/* Devoluções */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Devoluções</CardTitle>
          <PackageCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.devolucoes.pendentes}</div>
          <p className="text-xs text-destructive">
            {data.devolucoes.atrasadas} atrasadas
          </p>
        </CardContent>
      </Card>

      {/* Faturas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">A Receber</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatarMoeda(data.faturas.valorAPagar)}
          </div>
          <p className="text-xs text-muted-foreground">
            {data.faturas.pendentes} faturas pendentes
          </p>
          {data.faturas.vencidas > 0 && (
            <p className="text-xs text-destructive">
              {data.faturas.vencidas} vencidas
            </p>
          )}
        </CardContent>
      </Card>

      {/* Clientes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clientes</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.clientes.total}</div>
          <p className="text-xs text-muted-foreground">
            {data.clientes.ativos} com contratos ativos
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

