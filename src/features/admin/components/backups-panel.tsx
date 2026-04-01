"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/trpc/client";
import { useToast } from "@/hooks/use-toast";
import { formatarDataHora } from "@/lib/utils/formatters/date";
import { Loader2, Trash2, RotateCcw, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

function formatBytes(bytes: number | bigint | null | undefined): string {
  if (!bytes) return "0 B";
  const numBytes = typeof bytes === "bigint" ? Number(bytes) : bytes;
  if (numBytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(numBytes) / Math.log(k));
  return `${(numBytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

export function BackupsPanel() {
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [backupType, setBackupType] = useState<"FULL" | "PARTIAL" | "AUTOMATIC">("FULL");
  const [description, setDescription] = useState("");

  const { data: backupsData, isLoading, refetch } = trpc.backup.list.useQuery({
    limit: 100,
    offset: 0,
  });

  const { data: stats } = trpc.backup.stats.useQuery();

  const createBackupMutation = trpc.backup.create.useMutation({
    onSuccess: () => {
      toast({
        title: "✅ Backup criado!",
        description: "O backup foi criado com sucesso.",
      });
      setCreateDialogOpen(false);
      setDescription("");
      refetch();
    },
    onError: (error) => {
      toast({
        title: "❌ Erro ao criar backup",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const restoreBackupMutation = trpc.backup.restore.useMutation({
    onSuccess: () => {
      toast({
        title: "✅ Backup restaurado!",
        description: "O backup foi restaurado com sucesso.",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "❌ Erro ao restaurar backup",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteBackupMutation = trpc.backup.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "✅ Backup deletado!",
        description: "O backup foi removido com sucesso.",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "❌ Erro ao deletar backup",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const cleanupMutation = trpc.backup.cleanup.useMutation({
    onSuccess: (data) => {
      toast({
        title: "✅ Limpeza concluída!",
        description: `${data.deleted} backups antigos foram removidos.`,
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "❌ Erro na limpeza",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateBackup = () => {
    createBackupMutation.mutate({
      type: backupType,
      description: description || undefined,
    });
  };

  const handleRestoreBackup = (backupId: number) => {
    restoreBackupMutation.mutate({
      backupId,
      confirm: true,
    });
  };

  const handleDeleteBackup = (backupId: number) => {
    deleteBackupMutation.mutate({ id: backupId });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return <Badge className="bg-green-500">Sucesso</Badge>;
      case "FAILED":
        return <Badge variant="destructive">Falhou</Badge>;
      case "IN_PROGRESS":
        return <Badge className="bg-yellow-500">Em Progresso</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "FULL":
        return "Completo";
      case "PARTIAL":
        return "Parcial";
      case "AUTOMATIC":
        return "Automático";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Backups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Sucessos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.successful}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Falhas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{stats.failed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Tamanho Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatBytes(stats.totalSize)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Ações */}
      <Card>
        <CardHeader>
          <CardTitle>Ações</CardTitle>
          <CardDescription>Gerencie os backups do sistema</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Criar Backup
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Backup</DialogTitle>
                <DialogDescription>
                  Crie um backup completo do banco de dados
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Backup</Label>
                  <Select value={backupType} onValueChange={(value) => setBackupType(value as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FULL">Completo</SelectItem>
                      <SelectItem value="PARTIAL">Parcial</SelectItem>
                      <SelectItem value="AUTOMATIC">Automático</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva o propósito deste backup..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateBackup}
                  disabled={createBackupMutation.isPending}
                >
                  {createBackupMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    "Criar Backup"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            onClick={() => cleanupMutation.mutate()}
            disabled={cleanupMutation.isPending}
          >
            {cleanupMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Limpando...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Limpar Antigos
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Lista de Backups */}
      <Card>
        <CardHeader>
          <CardTitle>Backups Disponíveis</CardTitle>
          <CardDescription>
            {backupsData?.total ? `${backupsData.total} backups encontrados` : "Carregando..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : !backupsData?.backups.length ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum backup encontrado
            </div>
          ) : (
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Arquivo</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Tamanho</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backupsData.backups.map((backup) => (
                    <TableRow key={backup.id}>
                      <TableCell>{formatarDataHora(backup.createdAt)}</TableCell>
                      <TableCell className="font-mono text-sm">{backup.fileName}</TableCell>
                      <TableCell>{getTypeLabel(backup.backupType)}</TableCell>
                      <TableCell>{formatBytes(backup.fileSize)}</TableCell>
                      <TableCell>{getStatusBadge(backup.status)}</TableCell>
                      <TableCell>{backup.userEmail || backup.userId || "Sistema"}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {backup.description || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {backup.status === "SUCCESS" && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={restoreBackupMutation.isPending}
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Restaurar Backup</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    <div className="space-y-2">
                                      <p>
                                        Esta ação irá substituir TODOS os dados atuais do sistema
                                        pelos dados deste backup.
                                      </p>
                                      <p className="font-semibold text-destructive">
                                        Esta ação não pode ser desfeita!
                                      </p>
                                      <p>Backup: {backup.fileName}</p>
                                      <p>Data: {formatarDataHora(backup.createdAt)}</p>
                                    </div>
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleRestoreBackup(backup.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Confirmar Restauração
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={deleteBackupMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Deletar Backup</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja deletar este backup? Esta ação não pode
                                  ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteBackup(backup.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Deletar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

