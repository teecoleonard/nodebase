import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth-utils";
import { caller } from "@/trpc/server";
import { Button } from "@/components/ui/button";
import { ClienteForm } from "@/features/clientes/components/cliente-form";

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();
  
  const { id } = await params;
  const clienteId = Number(id);

  if (isNaN(clienteId)) {
    notFound();
  }

  try {
    const cliente = await caller.clientes.getById({ id: clienteId });

    return (
      <div className="flex flex-col gap-8 p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={`/clientes/${clienteId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Editar Cliente</h1>
            <p className="text-muted-foreground">
              Atualize os dados de {cliente.contratante}
            </p>
          </div>
        </div>

        {/* Formulário */}
        <ClienteForm
          clienteId={clienteId}
          defaultValues={{
            contratante: cliente.contratante,
            cpfCnpj: cliente.cpfCnpj,
            rgIe: cliente.rgIe || undefined,
            endereco: cliente.endereco || undefined,
            bairro: cliente.bairro || undefined,
            cep: cliente.cep || undefined,
            cidade: cliente.cidade || undefined,
            estado: cliente.estado || undefined,
            telefone: cliente.telefone || undefined,
            email: cliente.email || undefined,
          }}
        />
      </div>
    );
  } catch (error) {
    notFound();
  }
}

