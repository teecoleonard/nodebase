import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth-utils";
import { caller } from "@/trpc/server";
import { Button } from "@/components/ui/button";
import { EquipamentoForm } from "@/features/equipamentos/components/equipamento-form";

export default async function EditarEquipamentoPage({
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
      <div className="flex flex-col gap-8 p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={`/equipamentos/${equipamentoId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Editar Equipamento</h1>
            <p className="text-muted-foreground">
              Atualize os dados de {equipamento.nomeEquip}
            </p>
          </div>
        </div>

        {/* Formulário */}
        <EquipamentoForm
          equipamentoId={equipamentoId}
          defaultValues={{
            nomeEquip: equipamento.nomeEquip,
            codigoEquip: equipamento.codigoEquip || undefined,
            precoDiaria: Number(equipamento.precoDiaria),
            precoSemanal: Number(equipamento.precoSemanal),
            precoQuinzenal: Number(equipamento.precoQuinzenal),
            precoMensal: Number(equipamento.precoMensal),
            quantidadeDisp: equipamento.quantidadeDisp,
            valorPatrimonio: equipamento.valorPatrimonio 
              ? Number(equipamento.valorPatrimonio) 
              : undefined,
          }}
        />
      </div>
    );
  } catch (error) {
    notFound();
  }
}

