import { requireAuth } from "@/lib/auth-utils";
import { AutomacoesPanel } from "@/features/admin/components/automacoes-panel";

export default async function AutomacoesPage() {
  await requireAuth();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🤖 Automações Inngest</h1>
        <p className="text-muted-foreground">
          Gerencie e teste as automações do sistema
        </p>
      </div>

      <AutomacoesPanel />
    </div>
  );
}

