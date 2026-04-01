"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/trpc/client";
import { useToast } from "@/hooks/use-toast";
import { AuditAction, AuditEntity } from "@/generated/prisma/enums";
import { formatarDataHora } from "@/lib/utils/formatters/date";
import { Loader2, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function AuditoriaPanel() {
  const { toast } = useToast();
  const [filtros, setFiltros] = useState({
    entity: undefined as AuditEntity | undefined,
    action: undefined as AuditAction | undefined,
    userId: "",
    entityId: "",
    startDate: "",
    endDate: "",
  });
  const [offset, setOffset] = useState(0);
  const limit = 50;

  const { data, isLoading, refetch } = trpc.audit.list.useQuery({
    entity: filtros.entity,
    action: filtros.action,
    userId: filtros.userId || undefined,
    entityId: filtros.entityId || undefined,
    startDate: filtros.startDate ? new Date(filtros.startDate) : undefined,
    endDate: filtros.endDate ? new Date(filtros.endDate) : undefined,
    limit,
    offset,
  });

  const { data: stats } = trpc.audit.stats.useQuery();

  const handleFilter = () => {
    setOffset(0);
    refetch();
  };

  const handleClearFilters = () => {
    setFiltros({
      entity: undefined,
      action: undefined,
      userId: "",
      entityId: "",
      startDate: "",
      endDate: "",
    });
    setOffset(0);
  };

  const getActionBadgeVariant = (action: AuditAction) => {
    switch (action) {
      case "CREATE":
        return "default";
      case "UPDATE":
        return "secondary";
      case "DELETE":
        return "destructive";
      case "VIEW":
        return "outline";
      case "EXPORT":
        return "outline";
      default:
        return "outline";
    }
  };

  const getEntityLabel = (entity: AuditEntity) => {
    const labels: Record<AuditEntity, string> = {
      CLIENTE: "Cliente",
      EQUIPAMENTO: "Equipamento",
      CONTRATO: "Contrato",
      DEVOLUCAO: "Devolução",
      FATURA: "Fatura",
      USER: "Usuário",
      SYSTEM: "Sistema",
    };
    return labels[entity] || entity;
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLogs.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Logs Hoje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.logsToday.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Ações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.logsByAction.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Entidades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.logsByEntity.length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtre os logs de auditoria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="entity">Entidade</Label>
              <Select
                value={filtros.entity || undefined}
                onValueChange={(value) =>
                  setFiltros({ ...filtros, entity: value ? (value as AuditEntity) : undefined })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(AuditEntity).map((entity) => (
                    <SelectItem key={entity} value={entity}>
                      {getEntityLabel(entity)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="action">Ação</Label>
              <Select
                value={filtros.action || undefined}
                onValueChange={(value) =>
                  setFiltros({ ...filtros, action: value ? (value as AuditAction) : undefined })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(AuditAction).map((action) => (
                    <SelectItem key={action} value={action}>
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="userId">ID do Usuário</Label>
              <Input
                id="userId"
                placeholder="Filtrar por usuário"
                value={filtros.userId}
                onChange={(e) => setFiltros({ ...filtros, userId: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="entityId">ID da Entidade</Label>
              <Input
                id="entityId"
                placeholder="Filtrar por entidade"
                value={filtros.entityId}
                onChange={(e) => setFiltros({ ...filtros, entityId: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Data Inicial</Label>
              <Input
                id="startDate"
                type="date"
                value={filtros.startDate}
                onChange={(e) => setFiltros({ ...filtros, startDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Data Final</Label>
              <Input
                id="endDate"
                type="date"
                value={filtros.endDate}
                onChange={(e) => setFiltros({ ...filtros, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <Button onClick={handleFilter} className="w-full sm:w-auto">
              <Search className="mr-2 h-4 w-4" />
              Filtrar
            </Button>
            <Button variant="outline" onClick={handleClearFilters} className="w-full sm:w-auto">
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Logs de Auditoria</CardTitle>
          <CardDescription>
            {data?.total ? `${data.total} logs encontrados` : "Carregando..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : !data?.logs.length ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum log encontrado
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Entidade</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>ID Entidade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{formatarDataHora(log.createdAt)}</TableCell>
                        <TableCell>{log.userEmail || log.userId || "Sistema"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{getEntityLabel(log.entity)}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getActionBadgeVariant(log.action)}>
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-md truncate">{log.description}</TableCell>
                        <TableCell>{log.entityId || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Paginação */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Mostrando {offset + 1} a {Math.min(offset + limit, data.total)} de {data.total}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOffset(Math.max(0, offset - limit))}
                    disabled={offset === 0}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOffset(offset + limit)}
                    disabled={!data.hasMore}
                  >
                    Próximo
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

