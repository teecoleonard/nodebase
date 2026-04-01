import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { requireAuth } from "@/lib/auth-utils";
import { caller } from "@/trpc/server";
import Link from "next/link";
import { ClientesFiltros } from "@/features/clientes/components/clientes-filtros";
import { ExportClientes } from "@/features/clientes/components/export-clientes";
import { ClienteCardActions } from "@/features/clientes/components/cliente-card-actions";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    query?: string;
    tipo?: string;
    cidade?: string;
    estado?: string;
    dataCadastroInicio?: string;
    dataCadastroFim?: string;
  }>;
}) {
  await requireAuth();
  
  // Await searchParams no Next.js 15
  const params = await searchParams;
  
  // Buscar clientes com filtro de busca
  const { clientes, total } = await caller.clientes.list({ 
    limit: 100, 
    offset: 0,
    query: params.query 
  });

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie sua base de clientes ({total} cadastrados)
          </p>
        </div>
        <div className="flex gap-2">
          <ExportClientes clientes={clientes} />
          <Link href="/clientes/novo">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          </Link>
        </div>
      </div>

      <ClientesFiltros />

      {clientes.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          <p>Nenhum cliente encontrado</p>
          {(params.query || params.tipo || params.cidade || params.estado || params.dataCadastroInicio) && (
            <p className="mt-2 text-sm">
              Tente ajustar os filtros para encontrar mais resultados
            </p>
          )}
          {!params.query && !params.tipo && !params.cidade && !params.estado && !params.dataCadastroInicio && (
            <p className="mt-2 text-sm">
              Clique em "Novo Cliente" para adicionar o primeiro cliente
            </p>
          )}
        </div>
      ) : (
        <div className="auto-grid">
          {clientes.map((cliente) => (
            <ClienteCardActions key={cliente.id} cliente={cliente} />
          ))}
        </div>
      )}
    </div>
  );
}

