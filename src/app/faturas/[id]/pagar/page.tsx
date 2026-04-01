import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
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
import { PagamentoForm } from "@/features/faturas/components/pagamento-form";

export default async function PagarFaturaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();
  
  const { id } = await params;
  const faturaId = parseInt(id);

  if (isNaN(faturaId)) {
    notFound();
  }

  try {
    const fatura = await caller.faturas.getById({ id: faturaId });

    if (!fatura) {
      notFound();
    }

    if (fatura.status === "PAGA") {
      // Redirecionar se já foi paga
      return (
        <div className="flex flex-col gap-8 p-8 max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Fatura já foi paga</CardTitle>
              <CardDescription>
                Esta fatura já está com o status PAGA.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/faturas/${faturaId}`}>
                <Button>Ver Detalhes da Fatura</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (fatura.status === "CANCELADA") {
      return (
        <div className="flex flex-col gap-8 p-8 max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Fatura cancelada</CardTitle>
              <CardDescription>
                Esta fatura foi cancelada e não pode receber pagamentos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/faturas/${faturaId}`}>
                <Button>Ver Detalhes da Fatura</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-8 p-8 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={`/faturas/${faturaId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Registrar Pagamento
            </h1>
            <p className="text-muted-foreground mt-1">
              Fatura {fatura.numeroFatura} - {fatura.cliente.contratante}
            </p>
          </div>
        </div>

        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle>Dados do Pagamento</CardTitle>
            <CardDescription>
              Preencha as informações do pagamento recebido
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PagamentoForm fatura={fatura} />
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error("Erro ao carregar fatura:", error);
    notFound();
  }
}

