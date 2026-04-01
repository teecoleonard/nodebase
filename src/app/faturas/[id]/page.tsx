import { ArrowLeft, Calendar, User, FileText, DollarSign, CheckCircle2, XCircle, Clock } from "lucide-react";
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
import { GerarPDFButton } from "@/features/faturas/components/gerar-pdf-button";
import { EditarFaturaDialog } from "@/features/faturas/components/editar-fatura-dialog";
import { ExcluirFaturaButton } from "@/features/faturas/components/excluir-fatura-button";
import { FaturaDetailsClient } from "./fatura-details-client";

export default async function FaturaDetailsPage({
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

    const getStatusBadge = (status: string) => {
      switch (status) {
        case "PAGA":
          return <Badge className="bg-green-600">Paga</Badge>;
        case "PENDENTE":
          return <Badge variant="outline">Pendente</Badge>;
        case "VENCIDA":
          return <Badge variant="destructive">Vencida</Badge>;
        case "CANCELADA":
          return <Badge variant="secondary">Cancelada</Badge>;
        default:
          return <Badge variant="outline">{status}</Badge>;
      }
    };

    const saldo = Number(fatura.valorTotal) - Number(fatura.valorPago);

    return (
      <div className="flex flex-col gap-8 p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/faturas">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">
                  Fatura {fatura.numeroFatura}
                </h1>
                {getStatusBadge(fatura.status)}
              </div>
              <p className="text-muted-foreground mt-1">
                Cliente: {fatura.cliente.contratante}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <GerarPDFButton fatura={fatura} size="sm" />
            {fatura.status !== "PAGA" && (
              <EditarFaturaDialog fatura={fatura} />
            )}
            {fatura.status === "PENDENTE" && (
              <Link href={`/faturas/${faturaId}/pagar`}>
                <Button size="sm">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Registrar Pagamento
                </Button>
              </Link>
            )}
            {fatura.status !== "PAGA" && (
              <ExcluirFaturaButton
                faturaId={fatura.id}
                numeroFatura={fatura.numeroFatura}
              />
            )}
          </div>
        </div>

        {/* Informações do Cliente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Nome/Razão Social</p>
              <p className="font-medium">{fatura.cliente.contratante}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">CPF/CNPJ</p>
              <p className="font-medium">{fatura.cliente.cpfCnpj}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Telefone</p>
              <p className="font-medium">{fatura.cliente.telefone}</p>
            </div>
            {fatura.cliente.email && (
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{fatura.cliente.email}</p>
              </div>
            )}
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">Endereço</p>
              <p className="font-medium">
                {fatura.cliente.endereco}, {fatura.cliente.numero} - {fatura.cliente.bairro}
                <br />
                {fatura.cliente.cidade} - {fatura.cliente.estado}, CEP: {fatura.cliente.cep}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Dados da Fatura */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Dados da Fatura
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Data de Emissão</p>
              <p className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(new Date(fatura.dataEmissao))}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Data de Vencimento</p>
              <p className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(new Date(fatura.dataVencimento))}
              </p>
            </div>
            {fatura.dataPagamento && (
              <div>
                <p className="text-sm text-muted-foreground">Data de Pagamento</p>
                <p className="font-medium flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  {formatDate(new Date(fatura.dataPagamento))}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Mês de Referência</p>
              <p className="font-medium">
                {String(fatura.mesReferencia).padStart(2, '0')}/{fatura.anoReferencia}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Componente Cliente com Funcionalidades Interativas */}
        <FaturaDetailsClient fatura={fatura} />

        {/* Valores */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Valores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center text-lg">
              <span className="text-muted-foreground">Valor Total:</span>
              <span className="font-bold">
                {formatCurrency(Number(fatura.valorTotal))}
              </span>
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center text-lg">
              <span className="text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Valor Pago:
              </span>
              <span className="font-bold text-green-600">
                {formatCurrency(Number(fatura.valorPago))}
              </span>
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center text-xl">
              <span className="font-semibold flex items-center gap-2">
                {saldo > 0 ? (
                  <>
                    <Clock className="h-5 w-5 text-orange-600" />
                    Saldo Devedor:
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Pago Integralmente
                  </>
                )}
              </span>
              <span className={`font-bold text-2xl ${saldo > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                {formatCurrency(saldo)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Observações */}
        {fatura.observacoes && (
          <Card>
            <CardHeader>
              <CardTitle>Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {fatura.observacoes}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  } catch (error) {
    console.error("Erro ao carregar fatura:", error);
    notFound();
  }
}

