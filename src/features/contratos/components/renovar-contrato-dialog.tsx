"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@/trpc/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, RotateCcw, Plus, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { renovarContratoSchema, type RenovarContratoInput } from "@/features/contratos/schemas/contrato.schema";
import { formatCurrency } from "@/lib/utils/formatters/currency";
import { EquipamentoSelector } from "./equipamento-selector";

interface RenovarContratoDialogProps {
  contrato: any;
  trigger?: React.ReactNode;
}

export function RenovarContratoDialog({ contrato, trigger }: RenovarContratoDialogProps) {
  const [open, setOpen] = useState(false);
  const [equipamentos, setEquipamentos] = useState<Array<{
    equipamentoId: number;
    nome: string;
    codigo: string;
    quantidadeEquip: number;
    quantidadeDisp: number;
    valorUnitario: number;
    valorTotal: number;
    valorFrete: number;
  }>>([]);
  const router = useRouter();
  const { toast } = useToast();

  // Inicializar equipamentos do contrato atual
  useEffect(() => {
    if (open && contrato.equipamentos) {
      const equipamentosIniciais = contrato.equipamentos.map((ec: any) => ({
        equipamentoId: ec.equipamentoId,
        nome: ec.equipamento.nomeEquip,
        codigo: ec.equipamento.codigoEquip || "",
        quantidadeEquip: ec.quantidadeEquip,
        quantidadeDisp: ec.equipamento.quantidadeDisp,
        valorUnitario: Number(ec.valorUnitario),
        valorTotal: Number(ec.valorTotal),
        valorFrete: Number(ec.valorFrete),
      }));
      setEquipamentos(equipamentosIniciais);
    }
  }, [open, contrato]);

  const form = useForm<RenovarContratoInput>({
    resolver: zodResolver(renovarContratoSchema),
    defaultValues: {
      contratoId: contrato.id,
      dataVenc: new Date(contrato.dataVenc),
      valorTotal: Number(contrato.valorTotal),
      obraLocal: contrato.obraLocal || undefined,
      entregaLocal: contrato.entregaLocal || undefined,
      respPedido: contrato.respPedido || undefined,
      equipamentos: [],
    },
  });

  // Atualizar valor total quando equipamentos mudam
  useEffect(() => {
    const total = equipamentos.reduce((sum, eq) => sum + eq.valorTotal, 0);
    form.setValue("valorTotal", total);
  }, [equipamentos, form]);

  const renovarContrato = trpc.contratos.renovar.useMutation({
    onSuccess: () => {
      toast({
        title: "Contrato renovado!",
        description: "O contrato foi renovado com sucesso.",
      });
      setOpen(false);
      router.refresh();
    },
    onError: (error) => {
      toast({
        title: "Erro ao renovar contrato",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  async function onSubmit(data: RenovarContratoInput) {
    const equipamentosData = equipamentos.map((eq) => ({
      equipamentoId: eq.equipamentoId,
      quantidadeEquip: eq.quantidadeEquip,
      valorUnitario: eq.valorUnitario,
      valorTotal: eq.valorTotal,
      valorFrete: eq.valorFrete,
    }));

    await renovarContrato.mutateAsync({
      ...data,
      equipamentos: equipamentosData,
    });
  }

  const valorTotal = equipamentos.reduce((sum, eq) => sum + eq.valorTotal, 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <RotateCcw className="mr-2 h-4 w-4" />
            Renovar Contrato
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Renovar Contrato #{contrato.contratoNum}</DialogTitle>
          <DialogDescription>
            Atualize a data de vencimento, equipamentos e valores do contrato.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="dataVenc"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Nova Data de Vencimento</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="obraLocal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Local da Obra</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="entregaLocal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Local de Entrega</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="respPedido"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsável pelo Pedido</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Equipamentos */}
            <div className="space-y-2">
              <FormLabel>Equipamentos</FormLabel>
              <div className="space-y-2">
                {equipamentos.map((eq, index) => (
                  <div key={index} className="p-3 border rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{eq.nome}</p>
                        <p className="text-xs text-muted-foreground">Código: {eq.codigo}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const novos = equipamentos.filter((_, i) => i !== index);
                          setEquipamentos(novos);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs">Quantidade</Label>
                        <Input
                          type="number"
                          min="1"
                          value={eq.quantidadeEquip}
                          onChange={(e) => {
                            const novos = [...equipamentos];
                            novos[index].quantidadeEquip = parseInt(e.target.value) || 1;
                            novos[index].valorTotal = novos[index].valorUnitario * novos[index].quantidadeEquip;
                            setEquipamentos(novos);
                          }}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Valor Unitário</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={eq.valorUnitario}
                          onChange={(e) => {
                            const novos = [...equipamentos];
                            novos[index].valorUnitario = parseFloat(e.target.value) || 0;
                            novos[index].valorTotal = novos[index].valorUnitario * novos[index].quantidadeEquip;
                            setEquipamentos(novos);
                          }}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Valor Total</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={eq.valorTotal}
                          readOnly
                          className="bg-muted"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <EquipamentoSelector
                  periodo="MENSAL"
                  onAdd={(equipamento) => {
                    const existe = equipamentos.find(eq => eq.equipamentoId === equipamento.id);
                    if (existe) {
                      toast({
                        title: "Equipamento já adicionado",
                        description: "Este equipamento já está na lista",
                        variant: "destructive",
                      });
                      return;
                    }
                    const valorTotal = equipamento.valorUnitario * equipamento.quantidade;
                    setEquipamentos([
                      ...equipamentos,
                      {
                        equipamentoId: equipamento.id,
                        nome: equipamento.nome,
                        codigo: equipamento.codigo,
                        quantidadeEquip: equipamento.quantidade,
                        quantidadeDisp: equipamento.quantidadeDisp,
                        valorUnitario: equipamento.valorUnitario,
                        valorTotal: valorTotal,
                        valorFrete: 0,
                      },
                    ]);
                  }}
                />
              </div>
            </div>

            {/* Resumo do Valor Total */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Valor Total:</span>
                <span className="text-2xl font-bold">{formatCurrency(valorTotal)}</span>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  form.reset();
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={renovarContrato.isPending || equipamentos.length === 0}
              >
                {renovarContrato.isPending ? "Renovando..." : "Renovar Contrato"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

