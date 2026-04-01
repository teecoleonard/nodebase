import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth-utils";
import { Button } from "@/components/ui/button";
import { EquipamentoForm } from "@/features/equipamentos/components/equipamento-form";

export default async function NovoEquipamentoPage() {
  await requireAuth();

  return (
    <div className="flex flex-col gap-8 p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/equipamentos">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Novo Equipamento</h1>
          <p className="text-muted-foreground">
            Cadastre um novo equipamento no sistema
          </p>
        </div>
      </div>

      {/* Formulário */}
      <EquipamentoForm />
    </div>
  );
}

