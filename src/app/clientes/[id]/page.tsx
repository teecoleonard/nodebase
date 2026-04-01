import { notFound } from "next/navigation";
import { ArrowLeft, Edit, Trash2, Mail, Phone, MapPin, FileText, DollarSign } from "lucide-react";
import Link from "next/link";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils/formatters/date";
import { formatCurrency } from "@/lib/utils/formatters/currency";

export default async function ClienteDetalhesPage({
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
    const stats = await caller.clientes.stats({ id: clienteId });

    return (
      <div className="flex flex-col gap-8 p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/clientes">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{cliente.contratante}</h1>
              <p className="text-muted-foreground">
                Cliente desde {formatDate(cliente.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/clientes/${clienteId}/editar`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
            </Link>
            <Button variant="destructive" disabled>
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          {/* Estatísticas */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contratos Ativos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.contratosAtivos}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contratos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalContratos}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.valorTotal)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Devoluções Pendentes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.devolucoesPendentes}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Informações do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Cliente</CardTitle>
              <CardDescription>Dados cadastrais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">CPF/CNPJ</p>
                <p className="text-base font-semibold">{cliente.cpfCnpj}</p>
              </div>

              {cliente.rgIe && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">RG / Inscrição Estadual</p>
                  <p className="text-base">{cliente.rgIe}</p>
                </div>
              )}

              <Separator />

              {cliente.telefone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p className="text-base">{cliente.telefone}</p>
                </div>
              )}

              {cliente.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="text-base">{cliente.email}</p>
                </div>
              )}

              {(cliente.endereco || cliente.cidade || cliente.estado) && (
                <>
                  <Separator />
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      {cliente.endereco && <p className="text-base">{cliente.endereco}</p>}
                      {cliente.bairro && <p className="text-sm text-muted-foreground">{cliente.bairro}</p>}
                      {cliente.cep && <p className="text-sm text-muted-foreground">CEP: {cliente.cep}</p>}
                      {(cliente.cidade || cliente.estado) && (
                        <p className="text-sm text-muted-foreground">
                          {cliente.cidade && cliente.estado 
                            ? `${cliente.cidade}/${cliente.estado}`
                            : cliente.cidade || cliente.estado}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Histórico de Contratos */}
          <Card>
            <CardHeader>
              <CardTitle>Contratos Recentes</CardTitle>
              <CardDescription>Últimos 5 contratos do cliente</CardDescription>
            </CardHeader>
            <CardContent>
              {cliente.contratos && cliente.contratos.length > 0 ? (
                <div className="space-y-4">
                  {cliente.contratos.slice(0, 5).map((contrato) => (
                    <Link
                      key={contrato.id}
                      href={`/contratos/${contrato.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                    >
                      <div>
                        <p className="font-medium">#{contrato.contratoNum}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(contrato.dataHoraEmissao)}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          contrato.statusContrato === "EM_ANDAMENTO" ? "default" :
                          contrato.statusContrato === "FINALIZADO" ? "secondary" :
                          "outline"
                        }>
                          {contrato.statusContrato}
                        </Badge>
                        <p className="text-sm font-semibold mt-1">
                          {formatCurrency(Number(contrato.valorTotal))}
                        </p>
                      </div>
                    </Link>
                  ))}
                  
                  {cliente.contratos.length > 5 && (
                    <Link href={`/contratos?cliente=${clienteId}`}>
                      <Button variant="outline" className="w-full">
                        Ver todos os contratos
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhum contrato encontrado</p>
                  <Link href="/contratos/novo">
                    <Button className="mt-4">Criar Primeiro Contrato</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    notFound();
  }
}

