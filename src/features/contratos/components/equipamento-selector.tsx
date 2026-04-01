"use client";

import { useState } from "react";
import { Plus, Package, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/trpc/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface EquipamentoSelectorProps {
  periodo: "DIARIA" | "SEMANAL" | "QUINZENAL" | "MENSAL";
  onAdd: (equipamento: {
    id: number;
    nome: string;
    codigo: string;
    quantidade: number;
    quantidadeDisp: number;
    valorUnitario: number;
  }) => void;
}

export function EquipamentoSelector({ periodo, onAdd }: EquipamentoSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedEquipamento, setSelectedEquipamento] = useState<number | null>(null);
  const [quantidade, setQuantidade] = useState(1);

  const { data, isLoading } = trpc.equipamentos.list.useQuery({
    limit: 50,
    offset: 0,
    query: search,
  });

  const equipamentos = data?.equipamentos || [];
  const equipamento = equipamentos.find((eq) => eq.id === selectedEquipamento);

  const getValorPorPeriodo = (eq: typeof equipamentos[0]) => {
    switch (periodo) {
      case "DIARIA":
        return Number(eq.precoDiaria);
      case "SEMANAL":
        return Number(eq.precoSemanal);
      case "QUINZENAL":
        return Number(eq.precoQuinzenal);
      case "MENSAL":
        return Number(eq.precoMensal);
      default:
        return 0;
    }
  };

  const handleAdd = () => {
    if (!equipamento) return;

    onAdd({
      id: equipamento.id,
      nome: equipamento.nomeEquip,
      codigo: equipamento.codigoEquip || "S/C",
      quantidade,
      quantidadeDisp: equipamento.quantidadeDisp,
      valorUnitario: getValorPorPeriodo(equipamento),
    });

    // Reset
    setSelectedEquipamento(null);
    setQuantidade(1);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Equipamento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Selecionar Equipamento</DialogTitle>
          <DialogDescription>
            Escolha um equipamento e defina a quantidade para adicionar ao contrato
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar equipamento por nome ou código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Lista de equipamentos */}
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              Carregando equipamentos...
            </div>
          ) : equipamentos.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              Nenhum equipamento encontrado
            </div>
          ) : (
            <div className="grid gap-2 max-h-[400px] overflow-y-auto">
              {equipamentos.map((eq) => {
                const valorPeriodo = getValorPorPeriodo(eq);
                const isSelected = selectedEquipamento === eq.id;
                const disponivel = eq.quantidadeDisp > 0;

                return (
                  <Card
                    key={eq.id}
                    className={`cursor-pointer transition-all ${
                      isSelected
                        ? "ring-2 ring-primary"
                        : "hover:bg-muted/50"
                    } ${!disponivel ? "opacity-60" : ""}`}
                    onClick={() => disponivel && setSelectedEquipamento(eq.id)}
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{eq.nomeEquip}</h4>
                          <Badge variant={disponivel ? "default" : "destructive"}>
                            {disponivel ? "Disponível" : "Indisponível"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Código: {eq.codigoEquip || "N/A"}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {eq.quantidadeDisp} unidades disponíveis
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Valor ({periodo.toLowerCase()})</p>
                        <p className="text-2xl font-bold">
                          R$ {valorPeriodo.toFixed(2)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Quantidade */}
          {selectedEquipamento && equipamento && (
            <div className="border-t pt-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="quantidade">Quantidade</Label>
                  <Input
                    id="quantidade"
                    type="number"
                    min="1"
                    max={equipamento.quantidadeDisp}
                    value={quantidade}
                    onChange={(e) => setQuantidade(Number(e.target.value))}
                    className="w-32"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Máximo: {equipamento.quantidadeDisp} unidades
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">
                      R$ {(getValorPorPeriodo(equipamento) * quantidade).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {quantidade}x R$ {getValorPorPeriodo(equipamento).toFixed(2)}
                    </p>
                  </div>
                  <Button
                    onClick={handleAdd}
                    disabled={quantidade < 1 || quantidade > equipamento.quantidadeDisp}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar ao Contrato
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

