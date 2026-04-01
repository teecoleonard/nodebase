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
import { Phone, Mail, MapPin, Edit, Eye, Trash2, FileText, Calendar } from "lucide-react";
import { trpc } from "@/trpc/client";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils/formatters/date";

interface ClienteCardActionsProps {
  cliente: any;
  onDelete?: () => void;
}

export function ClienteCardActions({ cliente, onDelete }: ClienteCardActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const deleteCliente = trpc.clientes.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Cliente deletado",
        description: "O cliente foi removido com sucesso.",
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
    deleteCliente.mutate({ id: cliente.id });
    setShowDeleteDialog(false);
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>
          <HoverCard openDelay={300}>
            <HoverCardTrigger asChild>
              <Link href={`/clientes/${cliente.id}`}>
                <Card className="surface-card card-hover cursor-pointer h-full">
                  <CardHeader>
                    <div className="space-y-1">
                      <CardTitle className="text-lg leading-tight">{cliente.contratante}</CardTitle>
                      <CardDescription className="text-xs uppercase tracking-wide">
                        {cliente.cpfCnpj}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {cliente.telefone && (
                        <span className="data-chip">
                          <Phone className="chip-icon" />
                          {cliente.telefone}
                        </span>
                      )}
                      {cliente.email && (
                        <span className="data-chip">
                          <Mail className="chip-icon" />
                          {cliente.email}
                        </span>
                      )}
                      {(cliente.cidade || cliente.estado) && (
                        <span className="data-chip">
                          <MapPin className="chip-icon" />
                          {cliente.cidade && cliente.estado
                            ? `${cliente.cidade}/${cliente.estado}`
                            : cliente.cidade || cliente.estado}
                        </span>
                      )}
                    </div>
                    {cliente.createdAt && (
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="pill-muted">Desde</span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(new Date(cliente.createdAt))}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            </HoverCardTrigger>

            <HoverCardContent className="w-80" side="right">
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold">{cliente.contratante}</h4>
                  <p className="text-xs text-muted-foreground">{cliente.cpfCnpj}</p>
                </div>

                <div className="space-y-2 text-sm">
                  {cliente.telefone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span>{cliente.telefone}</span>
                    </div>
                  )}
                  
                  {cliente.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span className="truncate">{cliente.email}</span>
                    </div>
                  )}

                  {cliente.endereco && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-3 w-3 text-muted-foreground mt-0.5" />
                      <span className="text-xs">
                        {cliente.endereco}, {cliente.numero || "S/N"}
                        <br />
                        {cliente.bairro && `${cliente.bairro} - `}
                        {cliente.cidade}/{cliente.estado}
                        {cliente.cep && ` - CEP: ${cliente.cep}`}
                      </span>
                    </div>
                  )}

                  {cliente.createdAt && (
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Cadastrado em {formatDate(new Date(cliente.createdAt))}
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
              router.push(`/clientes/${cliente.id}`);
            }}
          >
            <Eye className="mr-2 h-4 w-4" />
            Ver Detalhes
          </ContextMenuItem>

          <ContextMenuItem
            onClick={(e) => {
              e.preventDefault();
              router.push(`/clientes/${cliente.id}/editar`);
            }}
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar Cliente
          </ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuItem
            onClick={(e) => {
              e.preventDefault();
              router.push(`/contratos/novo?clienteId=${cliente.id}`);
            }}
          >
            <FileText className="mr-2 h-4 w-4" />
            Novo Contrato
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
            Deletar Cliente
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso irá deletar permanentemente o
              cliente <strong>{cliente.contratante}</strong> e remover os dados dos servidores.
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

