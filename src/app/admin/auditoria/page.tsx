import { requireAdmin } from "@/lib/auth-utils";
import { AuditoriaPanel } from "@/features/admin/components/auditoria-panel";

export default async function AuditoriaPage() {
  await requireAdmin();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">📋 Logs de Auditoria</h1>
        <p className="text-muted-foreground">
          Visualize e monitore todas as ações realizadas no sistema
        </p>
      </div>

      <AuditoriaPanel />
    </div>
  );
}

