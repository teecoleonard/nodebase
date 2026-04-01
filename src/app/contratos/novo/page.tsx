import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth-utils";
import { Button } from "@/components/ui/button";
import { ContratoForm } from "@/features/contratos/components/contrato-form";

export default async function NovoContratoPage() {
  await requireAuth();

  return (
    <div className="flex flex-col gap-8 p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/contratos">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Novo Contrato</h1>
          <p className="text-muted-foreground">
            Crie um novo contrato de locação de equipamentos
          </p>
        </div>
      </div>

      {/* Formulário */}
      <ContratoForm />
    </div>
  );
}

