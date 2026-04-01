"use client";

import { useRouter } from "next/navigation";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Package, DollarSign, MapPin, User, Edit, Eye, FileText, Archive } from "lucide-react";
import { formatCurrency } from "@/lib/utils/formatters/currency";
import { formatDate } from "@/lib/utils/formatters/date";

interface ContratoCardActionsProps {
  contrato: any;
}

export function ContratoCardActions({ contrato }: ContratoCardActionsProps) {
  const router = useRouter();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "EM_ANDAMENTO":
        return <Badge variant="default">Em Andamento</Badge>;
      case "PENDENTE":
        return <Badge variant="outline">Pendente</Badge>;
      case "FINALIZADO":
        return <Badge variant="secondary">Finalizado</Badge>;
      case "ARQUIVADO":
        return <Badge>Arquivado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <HoverCard openDelay={300}>
          <HoverCardTrigger asChild>
            <div
              role="button"
              tabIndex={0}
              onClick={() => router.push(`/contratos/${contrato.id}`)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  router.push(`/contratos/${contrato.id}`);
                }
              }}
            >
              <Card className="surface-card card-hover cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-6 xl:flex-row">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <CardTitle className="text-lg leading-tight">
                            Contrato #{contrato.contratoNum}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {contrato.cliente?.contratante || "Cliente não encontrado"}
                          </CardDescription>
                        </div>
                        {getStatusBadge(contrato.statusContrato)}
                      </div>

                      <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 space-y-3">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>Emissão</span>
                          <span className="font-medium text-foreground">
                            {formatDate(contrato.dataHoraEmissao)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>Vencimento</span>
                          <span className="font-semibold text-primary">
                            {formatDate(contrato.dataVenc)}
                          </span>
                        </div>
                        {contrato.obraLocal && (
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Obra</span>
                            <span className="font-medium text-right text-foreground line-clamp-1">
                              {contrato.obraLocal}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>Valor Total</span>
                          <span className="font-bold text-foreground">
                            {formatCurrency(Number(contrato.valorTotal))}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span className="data-chip">
                          <FileText className="chip-icon" />
                          {contrato.contratoPeriodo}
                        </span>
                        {contrato.respPedido && (
                          <span className="data-chip">
                            <User className="chip-icon" />
                            {contrato.respPedido}
                          </span>
                        )}
                        {contrato.equipamentos?.length ? (
                          <span className="data-chip">
                            <Package className="chip-icon" />
                            {contrato.equipamentos.length} equipamentos
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="xl:w-1/3 space-y-4 rounded-2xl border border-border/50 bg-muted/30 p-4">
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p className="uppercase text-xs tracking-wider font-semibold">
                          Resumo
                        </p>
                        <div className="flex items-center justify-between">
                          <span>Cliente</span>
                          <span className="font-medium text-right text-foreground line-clamp-1">
                            {contrato.cliente?.contratante}
                          </span>
                        </div>
                        {contrato.equipamentos?.[0]?.equipamento?.nomeEquip && (
                          <div className="flex items-center justify-between">
                            <span>Equipamento principal</span>
                            <span className="font-medium text-right text-foreground line-clamp-1">
                              {contrato.equipamentos[0].equipamento.nomeEquip}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span>Status</span>
                          {getStatusBadge(contrato.statusContrato)}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          className="w-full"
                          onClick={(event) => {
                            event.stopPropagation();
                            router.push(`/contratos/${contrato.id}`);
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Contrato
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={(event) => {
                            event.stopPropagation();
                            router.push(`/contratos/${contrato.id}/editar`);
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar Contrato
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </HoverCardTrigger>

          <HoverCardContent className="w-80" side="right">
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-semibold">Contrato #{contrato.contratoNum}</h4>
                <p className="text-xs text-muted-foreground">{contrato.cliente?.contratante}</p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs">
                    Emissão: {formatDate(new Date(contrato.dataHoraEmissao))}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs">
                    Vencimento: {formatDate(new Date(contrato.dataVenc))}
                  </span>
                </div>

                {contrato.obraLocal && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3 w-3 text-muted-foreground mt-0.5" />
                    <span className="text-xs">{contrato.obraLocal}</span>
                  </div>
                )}

                {contrato.respPedido && (
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs">Resp: {contrato.respPedido}</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-muted-foreground">Período:</span>
                  <Badge variant="outline">{contrato.contratoPeriodo}</Badge>
                </div>

                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-semibold">Valor Total:</span>
                  <span className="font-bold text-lg">{formatCurrency(Number(contrato.valorTotal))}</span>
                </div>

                {contrato.equipamentos && contrato.equipamentos.length > 0 && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-semibold">Equipamentos ({contrato.equipamentos.length})</span>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      {contrato.equipamentos.slice(0, 3).map((eq: any, idx: number) => (
                        <div key={idx}>
                          • {eq.equipamento?.nomeEquip} ({eq.quantidade}x)
                        </div>
                      ))}
                      {contrato.equipamentos.length > 3 && (
                        <div className="text-xs">+ {contrato.equipamentos.length - 3} mais...</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-56">
        <ContextMenuItem
          onClick={(e) => {
            e.preventDefault();
            router.push(`/contratos/${contrato.id}`);
          }}
        >
          <Eye className="mr-2 h-4 w-4" />
          Ver Detalhes
        </ContextMenuItem>

        {contrato.statusContrato === "PENDENTE" && (
          <ContextMenuItem
            onClick={(e) => {
              e.preventDefault();
              router.push(`/contratos/${contrato.id}/assinar`);
            }}
          >
            <Edit className="mr-2 h-4 w-4" />
            Assinar Contrato
          </ContextMenuItem>
        )}

        {contrato.statusContrato === "EM_ANDAMENTO" && (
          <ContextMenuItem
            onClick={(e) => {
              e.preventDefault();
              router.push(`/contratos/${contrato.id}/devolver`);
            }}
          >
            <Package className="mr-2 h-4 w-4" />
            Registrar Devolução
          </ContextMenuItem>
        )}

        <ContextMenuSeparator />

        <ContextMenuItem
          onClick={(e) => {
            e.preventDefault();
            // Gerar PDF - implementar
          }}
        >
          <FileText className="mr-2 h-4 w-4" />
          Gerar PDF
        </ContextMenuItem>

        {contrato.statusContrato === "FINALIZADO" && !contrato.arquivado && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={(e) => {
                e.preventDefault();
                // Arquivar - implementar
              }}
            >
              <Archive className="mr-2 h-4 w-4" />
              Arquivar Contrato
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}

