"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, Plus, Trash2, Calculator } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { trpc } from "@/trpc/client";
import { createContratoSchema } from "../schemas/contrato.schema";
import { ClienteCombobox } from "./cliente-combobox";
import { EquipamentoSelector } from "./equipamento-selector";
import { Badge } from "@/components/ui/badge";

type ContratoFormValues = z.infer<typeof createContratoSchema>;

export function ContratoForm() {
  const [selectedCliente, setSelectedCliente] = useState<number | null>(null);
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

  // Buscar próximo número de contrato
  const { data: proximoNumero } = trpc.contratos.gerarProximoNumero.useQuery(
    { clienteId: selectedCliente! },
    { enabled: !!selectedCliente }
  );

  const form = useForm<ContratoFormValues>({
    resolver: zodResolver(createContratoSchema),
    defaultValues: {
      clienteId: 0,
      contratoNum: "",
      dataHoraEmissao: new Date(),
      dataVenc: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 dias
      obraLocal: "",
      contratoPeriodo: "MENSAL",
      entregaLocal: "",
      respPedido: "",
      valorTotal: 0,
      equipamentos: [],
    },
  });

  // Atualizar número do contrato quando cliente é selecionado
  useEffect(() => {
    if (proximoNumero && selectedCliente) {
      form.setValue("contratoNum", proximoNumero.proximoNumero);
      form.setValue("clienteId", selectedCliente);
    }
  }, [proximoNumero, selectedCliente, form]);

  // Calcular valor total quando equipamentos mudam
  useEffect(() => {
    const total = equipamentos.reduce((sum, eq) => sum + eq.valorTotal, 0);
    form.setValue("valorTotal", total);
  }, [equipamentos, form]);

  const createMutation = trpc.contratos.create.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Contrato criado!",
        description: `Contrato #${data.contratoNum} foi criado com sucesso.`,
      });
      router.push(`/contratos/${data.id}`);
      router.refresh();
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar contrato",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContratoFormValues) => {
    if (!selectedCliente) {
      toast({
        title: "Cliente não selecionado",
        description: "Selecione um cliente para continuar",
        variant: "destructive",
      });
      return;
    }

    if (equipamentos.length === 0) {
      toast({
        title: "Nenhum equipamento selecionado",
        description: "Adicione pelo menos um equipamento ao contrato",
        variant: "destructive",
      });
      return;
    }

    const equipamentosData = equipamentos.map(eq => ({
      equipamentoId: eq.equipamentoId,
      quantidadeEquip: eq.quantidadeEquip,
      valorUnitario: eq.valorUnitario,
      valorTotal: eq.valorTotal,
      valorFrete: eq.valorFrete || 0,
    }));

    createMutation.mutate({
      ...data,
      clienteId: selectedCliente,
      equipamentos: equipamentosData,
    });
  };

  const adicionarEquipamento = (equipamento: {
    id: number;
    nome: string;
    codigo: string;
    quantidade: number;
    quantidadeDisp: number;
    valorUnitario: number;
  }) => {
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
  };

  const removerEquipamento = (equipamentoId: number) => {
    setEquipamentos(equipamentos.filter(eq => eq.equipamentoId !== equipamentoId));
  };

  const atualizarQuantidade = (equipamentoId: number, novaQuantidade: number) => {
    setEquipamentos(equipamentos.map(eq => {
      if (eq.equipamentoId === equipamentoId) {
        const valorTotal = eq.valorUnitario * novaQuantidade;
        return { ...eq, quantidadeEquip: novaQuantidade, valorTotal };
      }
      return eq;
    }));
  };

  const isLoading = createMutation.isPending;
  const valorTotal = equipamentos.reduce((sum, eq) => sum + eq.valorTotal, 0);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Seleção de Cliente */}
        <Card>
          <CardHeader>
            <CardTitle>Cliente</CardTitle>
            <CardDescription>Selecione o cliente para este contrato</CardDescription>
          </CardHeader>
          <CardContent>
            <ClienteCombobox
              value={selectedCliente}
              onChange={setSelectedCliente}
            />
            
            {selectedCliente && proximoNumero && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">Número do Contrato:</p>
                <p className="text-2xl font-bold">{proximoNumero.proximoNumero}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dados do Contrato */}
        {selectedCliente && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Informações do Contrato</CardTitle>
                <CardDescription>Datas e período de locação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="dataHoraEmissao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Emissão *</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            value={field.value instanceof Date 
                              ? field.value.toISOString().split('T')[0] 
                              : ''}
                            onChange={(e) => field.onChange(new Date(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dataVenc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Vencimento *</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            value={field.value instanceof Date 
                              ? field.value.toISOString().split('T')[0] 
                              : ''}
                            onChange={(e) => field.onChange(new Date(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contratoPeriodo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Período *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o período" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="DIARIA">Diária</SelectItem>
                            <SelectItem value="SEMANAL">Semanal</SelectItem>
                            <SelectItem value="QUINZENAL">Quinzenal</SelectItem>
                            <SelectItem value="MENSAL">Mensal</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="obraLocal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Local da Obra</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Endereço da obra..."
                            {...field}
                            value={field.value || ""}
                          />
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
                          <Input
                            placeholder="Nome do responsável..."
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="entregaLocal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Local de Entrega</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Endereço de entrega..."
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Seleção de Equipamentos */}
            <Card>
              <CardHeader>
                <CardTitle>Equipamentos</CardTitle>
                <CardDescription>
                  Adicione os equipamentos para este contrato
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <EquipamentoSelector
                  periodo={form.watch("contratoPeriodo")}
                  onAdd={adicionarEquipamento}
                />

                {equipamentos.length > 0 && (
                  <div className="space-y-3 mt-6">
                    <h3 className="font-semibold">Equipamentos Selecionados:</h3>
                    {equipamentos.map((eq) => (
                      <div
                        key={eq.equipamentoId}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{eq.nome}</p>
                          <p className="text-sm text-muted-foreground">
                            Código: {eq.codigo}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div>
                            <label className="text-xs text-muted-foreground">Quantidade</label>
                            <Input
                              type="number"
                              min="1"
                              max={eq.quantidadeDisp}
                              value={eq.quantidadeEquip}
                              onChange={(e) => atualizarQuantidade(
                                eq.equipamentoId, 
                                Number(e.target.value)
                              )}
                              className="w-20"
                            />
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Valor Unit.</p>
                            <p className="font-semibold">
                              R$ {eq.valorUnitario.toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Total</p>
                            <p className="font-bold">
                              R$ {eq.valorTotal.toFixed(2)}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removerEquipamento(eq.equipamentoId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {/* Valor Total */}
                    <div className="flex justify-end p-4 bg-muted rounded-lg">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground mb-1">
                          <Calculator className="inline h-4 w-4 mr-1" />
                          Valor Total do Contrato
                        </p>
                        <p className="text-3xl font-bold">
                          R$ {valorTotal.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Período: {form.watch("contratoPeriodo")}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Botões */}
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || !selectedCliente || equipamentos.length === 0}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Contrato
              </Button>
            </div>
          </>
        )}
      </form>
    </Form>
  );
}

