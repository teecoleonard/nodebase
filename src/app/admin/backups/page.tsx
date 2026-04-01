import { requireAdmin } from "@/lib/auth-utils";
import { BackupsPanel } from "@/features/admin/components/backups-panel";

export default async function BackupsPage() {
  await requireAdmin();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">💾 Gerenciamento de Backups</h1>
        <p className="text-muted-foreground">
          Crie, restaure e gerencie backups do sistema
        </p>
      </div>

      <BackupsPanel />
    </div>
  );
}

