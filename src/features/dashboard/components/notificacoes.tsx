"use client";

import { useState } from "react";
import { Bell, AlertCircle, FileWarning, Package, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { trpc } from "@/trpc/client";
import { formatDate } from "@/lib/utils/formatters/date";

export function Notificacoes() {
  const [open, setOpen] = useState(false);

  const { data: alertas, isLoading } = trpc.dashboard.alertas.useQuery(undefined, {
    refetchInterval: 60000, // Atualiza a cada 1 minuto
  });

  const totalAlertas = alertas
    ? (alertas.contratosVencendo?.length || 0) +
      (alertas.devolucoesAtrasadas?.length || 0) +
      (alertas.faturasVencidas?.length || 0) +
      (alertas.equipamentosIndisponiveis?.length || 0)
    : 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {totalAlertas > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {totalAlertas > 9 ? "9+" : totalAlertas}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notificações</h3>
          {totalAlertas > 0 && (
            <Badge variant="secondary">{totalAlertas}</Badge>
          )}
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            Carregando notificações...
          </div>
        ) : totalAlertas === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>Nenhuma notificação</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="p-2">
              {/* Contratos Vencendo */}
              {alertas?.contratosVencendo && alertas.contratosVencendo.length > 0 && (
                <>
                  <div className="px-2 py-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">
                      Contratos Vencendo
                    </p>
                  </div>
                  {alertas.contratosVencendo.map((contrato: any) => (
                    <Link
                      key={contrato.id}
                      href={`/contratos/${contrato.id}`}
                      onClick={() => setOpen(false)}
                    >
                      <div className="flex gap-3 p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer">
                        <div className="flex-shrink-0 mt-0.5">
                          <Calendar className="h-4 w-4 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            Contrato #{contrato.contratoNum}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {contrato.cliente.contratante}
                          </p>
                          <p className="text-xs text-orange-600 mt-1">
                            Vence em {formatDate(new Date(contrato.dataVenc))}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                  <Separator className="my-2" />
                </>
              )}

              {/* Devoluções Atrasadas */}
              {alertas?.devolucoesAtrasadas && alertas.devolucoesAtrasadas.length > 0 && (
                <>
                  <div className="px-2 py-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">
                      Devoluções Atrasadas
                    </p>
                  </div>
                  {alertas.devolucoesAtrasadas.map((devolucao: any) => (
                    <Link
                      key={devolucao.id}
                      href={`/devolucoes/${devolucao.id}`}
                      onClick={() => setOpen(false)}
                    >
                      <div className="flex gap-3 p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer">
                        <div className="flex-shrink-0 mt-0.5">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            Devolução {devolucao.numeroDevolucao}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {devolucao.contrato?.cliente?.contratante}
                          </p>
                          <p className="text-xs text-red-600 mt-1">
                            Atrasada {devolucao.diasAtraso} dia(s)
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                  <Separator className="my-2" />
                </>
              )}

              {/* Faturas Vencidas */}
              {alertas?.faturasVencidas && alertas.faturasVencidas.length > 0 && (
                <>
                  <div className="px-2 py-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">
                      Faturas Vencidas
                    </p>
                  </div>
                  {alertas.faturasVencidas.map((fatura: any) => (
                    <Link
                      key={fatura.id}
                      href={`/faturas/${fatura.id}`}
                      onClick={() => setOpen(false)}
                    >
                      <div className="flex gap-3 p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer">
                        <div className="flex-shrink-0 mt-0.5">
                          <FileWarning className="h-4 w-4 text-red-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            Fatura {fatura.numeroFatura}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {fatura.cliente.contratante}
                          </p>
                          <p className="text-xs text-red-600 mt-1">
                            Vencida em {formatDate(new Date(fatura.dataVencimento))}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                  <Separator className="my-2" />
                </>
              )}

              {/* Equipamentos Indisponíveis */}
              {alertas?.equipamentosIndisponiveis && alertas.equipamentosIndisponiveis.length > 0 && (
                <>
                  <div className="px-2 py-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">
                      Equipamentos Indisponíveis
                    </p>
                  </div>
                  {alertas.equipamentosIndisponiveis.map((equipamento: any) => (
                    <Link
                      key={equipamento.id}
                      href={`/equipamentos/${equipamento.id}`}
                      onClick={() => setOpen(false)}
                    >
                      <div className="flex gap-3 p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer">
                        <div className="flex-shrink-0 mt-0.5">
                          <Package className="h-4 w-4 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {equipamento.nomeEquip}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Código: {equipamento.codigoEquip}
                          </p>
                          <p className="text-xs text-orange-600 mt-1">
                            Estoque: {equipamento.quantidadeDisp} disponível(is)
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </>
              )}
            </div>
          </ScrollArea>
        )}

        {totalAlertas > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Link href="/" onClick={() => setOpen(false)}>
                <Button variant="ghost" className="w-full text-xs">
                  Ver todos os alertas no dashboard
                </Button>
              </Link>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

