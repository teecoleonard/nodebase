import { ArrowLeft, Calendar, MapPin, User, Package, FileText, Printer } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils/formatters/date";
import { formatCurrency } from "@/lib/utils/formatters/currency";
import { GerarPDFButton } from "@/features/contratos/components/gerar-pdf-button";
import { RenovarContratoDialog } from "@/features/contratos/components/renovar-contrato-dialog";

export default async function ContratoDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();
  
  const { id } = await params;
  const contratoId = parseInt(id);

  if (isNaN(contratoId)) {
    notFound();
  }

  try {
    const contratoRaw = await caller.contratos.getById({ id: contratoId });

    const contrato = JSON.parse(
      JSON.stringify(contratoRaw, (_, value) => {
        if (
          value &&
          typeof value === "object" &&
          value.constructor?.name === "Decimal"
        ) {
          return Number(value);
        }
        return value;
      }),
    );

    if (!contrato) {
      notFound();
    }

    const getStatusBadge = (status: string) => {
      switch (status) {
        case "EM_ANDAMENTO":
          return <Badge variant="default">Em Andamento</Badge>;
        case "PENDENTE":
          return <Badge variant="outline">Pendente</Badge>;
        case "DEVOLVIDO_PARCIALMENTE":
          return <Badge className="bg-orange-600">Devolvido Parcialmente</Badge>;
        case "FINALIZADO":
          return <Badge variant="secondary">Finalizado</Badge>;
        case "CANCELADO":
          return <Badge variant="destructive">Cancelado</Badge>;
        case "ARQUIVADO":
          return <Badge>Arquivado</Badge>;
        default:
          return <Badge variant="outline">{status}</Badge>;
      }
    };

    const getPeriodoLabel = (periodo: string) => {
      const periodos: Record<string, string> = {
        DIARIA: "Diária",
        SEMANAL: "Semanal",
        QUINZENAL: "Quinzenal",
        MENSAL: "Mensal",
      };
      return periodos[periodo] || periodo;
    };

    return (
      <div className="flex flex-col gap-8 p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/contratos">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">
                  Contrato #{contrato.contratoNum}
                </h1>
                {getStatusBadge(contrato.statusContrato)}
              </div>
              <p className="text-muted-foreground mt-1">
                Cliente: {contrato.cliente.contratante}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <GerarPDFButton contrato={contrato} size="sm" />
            {contrato.statusContrato === "DEVOLVIDO_PARCIALMENTE" && (
              <RenovarContratoDialog contrato={contrato} />
            )}
          </div>
        </div>

        {/* Informações do Cliente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Dados do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Nome / Razão Social</p>
              <p className="font-semibold">{contrato.cliente.contratante}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">CPF / CNPJ</p>
              <p className="font-semibold">{contrato.cliente.cpfCnpj}</p>
            </div>
            {contrato.cliente.telefone && (
              <div>
                <p className="text-sm text-muted-foreground">Telefone</p>
                <p className="font-semibold">{contrato.cliente.telefone}</p>
              </div>
            )}
            {contrato.cliente.email && (
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-semibold">{contrato.cliente.email}</p>
              </div>
            )}
            {(contrato.cliente.endereco || contrato.cliente.cidade) && (
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground">Endereço</p>
                <p className="font-semibold">
                  {[
                    contrato.cliente.endereco,
                    contrato.cliente.bairro,
                    contrato.cliente.cidade && contrato.cliente.estado
                      ? `${contrato.cliente.cidade}/${contrato.cliente.estado}`
                      : contrato.cliente.cidade || contrato.cliente.estado,
                    contrato.cliente.cep && `CEP: ${contrato.cliente.cep}`,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informações do Contrato */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Informações do Contrato
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Data de Emissão</p>
              <p className="font-semibold">{formatDate(contrato.dataHoraEmissao)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Data de Vencimento</p>
              <p className="font-semibold">{formatDate(contrato.dataVenc)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Período</p>
              <p className="font-semibold">{getPeriodoLabel(contrato.contratoPeriodo)}</p>
            </div>
            {contrato.obraLocal && (
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground">Local da Obra</p>
                <p className="font-semibold">{contrato.obraLocal}</p>
              </div>
            )}
            {contrato.respPedido && (
              <div>
                <p className="text-sm text-muted-foreground">Responsável</p>
                <p className="font-semibold">{contrato.respPedido}</p>
              </div>
            )}
            {contrato.entregaLocal && (
              <div className="md:col-span-3">
                <p className="text-sm text-muted-foreground">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Local de Entrega
                </p>
                <p className="font-semibold">{contrato.entregaLocal}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Equipamentos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Equipamentos Locados
            </CardTitle>
            <CardDescription>
              {contrato.equipamentos.length} equipamento(s) neste contrato
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contrato.equipamentos.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-semibold">{item.equipamento.nomeEquip}</p>
                    <p className="text-sm text-muted-foreground">
                      Código: {item.equipamento.codigoEquip || "N/A"}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="flex items-center justify-end gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Quantidade</p>
                        <p className="font-semibold">{item.quantidadeEquip} un.</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Valor Unit.</p>
                        <p className="font-semibold">{formatCurrency(Number(item.valorUnitario))}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="text-lg font-bold">{formatCurrency(Number(item.valorTotal))}</p>
                      </div>
                    </div>
                    {item.valorFrete && Number(item.valorFrete) > 0 && (
                      <p className="text-xs text-muted-foreground">
                        + Frete: {formatCurrency(Number(item.valorFrete))}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              <Separator className="my-4" />

              {/* Valor Total */}
              <div className="flex justify-end p-4 bg-muted rounded-lg">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">
                    Valor Total do Contrato
                  </p>
                  <p className="text-3xl font-bold">
                    {formatCurrency(Number(contrato.valorTotal))}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Período: {getPeriodoLabel(contrato.contratoPeriodo)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex gap-4 justify-end">
          {contrato.statusContrato === "PENDENTE" && (
            <Link href={`/contratos/${contrato.id}/assinar`}>
              <Button>
                <FileText className="mr-2 h-4 w-4" />
                Coletar Assinatura
              </Button>
            </Link>
          )}
          {contrato.statusContrato === "EM_ANDAMENTO" && (
            <Link href={`/contratos/${contrato.id}/devolver`}>
              <Button>
                <Package className="mr-2 h-4 w-4" />
                Registrar Devolução
              </Button>
            </Link>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Erro ao carregar contrato:", error);
    notFound();
  }
}

