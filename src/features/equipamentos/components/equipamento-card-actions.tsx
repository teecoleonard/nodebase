"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Package, Edit, Eye, Trash2, DollarSign, Calendar, TrendingUp } from "lucide-react";
import { trpc } from "@/trpc/client";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils/formatters/currency";
import { formatDate } from "@/lib/utils/formatters/date";

interface EquipamentoCardActionsProps {
  equipamento: any;
  onDelete?: () => void;
}

export function EquipamentoCardActions({ equipamento, onDelete }: EquipamentoCardActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const deleteEquipamento = trpc.equipamentos.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Equipamento deletado",
        description: "O equipamento foi removido com sucesso.",
      });
      onDelete?.();
      router.refresh();
    },
    onError: (error) => {
      toast({
        title: "Erro ao deletar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    deleteEquipamento.mutate({ id: equipamento.id });
    setShowDeleteDialog(false);
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>
          <HoverCard openDelay={300}>
            <HoverCardTrigger asChild>
              <Link href={`/equipamentos/${equipamento.id}`}>
                <Card className="surface-card card-hover cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-1">
                        <CardTitle className="text-lg leading-tight">{equipamento.nomeEquip}</CardTitle>
                        {equipamento.codigoEquip && (
                          <CardDescription className="text-xs uppercase tracking-wide">
                            {equipamento.codigoEquip}
                          </CardDescription>
                        )}
                      </div>
                      <Badge
                        variant={equipamento.quantidadeDisp > 0 ? "default" : "destructive"}
                        className="rounded-full"
                      >
                        {equipamento.quantidadeDisp} disp.
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <span className="data-chip">
                        <DollarSign className="chip-icon" />
                        {formatCurrency(Number(equipamento.precoDiaria))}/dia
                      </span>
                      <span className="data-chip">
                        <DollarSign className="chip-icon" />
                        {formatCurrency(Number(equipamento.precoMensal))}/mês
                      </span>
                      {equipamento.valorPatrimonio && (
                        <span className="data-chip">
                          <TrendingUp className="chip-icon" />
                          {formatCurrency(Number(equipamento.valorPatrimonio))}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="pill-muted">Estoque</span>
                      <span className="font-semibold text-foreground">{equipamento.quantidadeDisp} un.</span>
                      {equipamento.createdAt && (
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(new Date(equipamento.createdAt))}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </HoverCardTrigger>

            <HoverCardContent className="w-80" side="right">
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold">{equipamento.nomeEquip}</h4>
                  {equipamento.codigoEquip && (
                    <p className="text-xs text-muted-foreground">Código: {equipamento.codigoEquip}</p>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Estoque:</span>
                    <Badge variant={equipamento.quantidadeDisp > 0 ? "default" : "destructive"}>
                      {equipamento.quantidadeDisp} disponível(is)
                    </Badge>
                  </div>

                  <div className="pt-2 border-t space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Diária:</span>
                      <span className="font-medium">{formatCurrency(Number(equipamento.precoDiaria))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Semanal:</span>
                      <span className="font-medium">{formatCurrency(Number(equipamento.precoSemanal))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Quinzenal:</span>
                      <span className="font-medium">{formatCurrency(Number(equipamento.precoQuinzenal))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mensal:</span>
                      <span className="font-medium">{formatCurrency(Number(equipamento.precoMensal))}</span>
                    </div>
                  </div>

                  {equipamento.valorPatrimonio && (
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Valor Patrimonial:
                      </span>
                      <span className="font-semibold">{formatCurrency(Number(equipamento.valorPatrimonio))}</span>
                    </div>
                  )}

                  {equipamento.createdAt && (
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Cadastrado em {formatDate(new Date(equipamento.createdAt))}
                      </span>
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
              router.push(`/equipamentos/${equipamento.id}`);
            }}
          >
            <Eye className="mr-2 h-4 w-4" />
            Ver Detalhes
          </ContextMenuItem>

          <ContextMenuItem
            onClick={(e) => {
              e.preventDefault();
              router.push(`/equipamentos/${equipamento.id}/editar`);
            }}
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar Equipamento
          </ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuItem
            onClick={(e) => {
              e.preventDefault();
              router.push(`/contratos/novo?equipamentoId=${equipamento.id}`);
            }}
          >
            <Package className="mr-2 h-4 w-4" />
            Criar Contrato
          </ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuItem
            className="text-destructive focus:text-destructive"
            onClick={(e) => {
              e.preventDefault();
              setShowDeleteDialog(true);
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Deletar Equipamento
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso irá deletar permanentemente o
              equipamento <strong>{equipamento.nomeEquip}</strong> e remover os dados dos servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

