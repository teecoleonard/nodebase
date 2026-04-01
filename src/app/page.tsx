import { DashboardCards } from "@/features/dashboard/components/dashboard-cards";
import { ReceitaChart } from "@/features/dashboard/components/receita-chart";
import { EquipamentosChart } from "@/features/dashboard/components/equipamentos-chart";
import { caller } from "@/trpc/server";
import { requireAuth } from "@/lib/auth-utils";

export default async function DashboardPage() {
  await requireAuth();
  const [resumo, receitaMensal, equipamentosChart] = await Promise.all([
    caller.dashboard.resumo(),
    caller.dashboard.receitaMensal(),
    caller.dashboard.equipamentosChart(),
  ]);

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do sistema de locação ALG
          </p>
        </div>
      </div>

      <DashboardCards data={resumo} />

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-7">
        <ReceitaChart data={receitaMensal} />
        <EquipamentosChart data={equipamentosChart} />
      </div>
    </div>
  );
}