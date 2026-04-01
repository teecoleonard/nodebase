"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";

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
import { useToast } from "@/hooks/use-toast";
import { trpc } from "@/trpc/client";
import { createEquipamentoSchema } from "../schemas/equipamento.schema";

type EquipamentoFormValues = z.infer<typeof createEquipamentoSchema>;

interface EquipamentoFormProps {
  equipamentoId?: number;
  defaultValues?: Partial<EquipamentoFormValues>;
}

export function EquipamentoForm({ equipamentoId, defaultValues }: EquipamentoFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<EquipamentoFormValues>({
    resolver: zodResolver(createEquipamentoSchema),
    defaultValues: defaultValues || {
      nomeEquip: "",
      codigoEquip: "",
      precoDiaria: 0,
      precoSemanal: 0,
      precoQuinzenal: 0,
      precoMensal: 0,
      quantidadeDisp: 0,
      valorPatrimonio: undefined,
    },
  });

  const createMutation = trpc.equipamentos.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Equipamento criado!",
        description: "O equipamento foi cadastrado com sucesso.",
      });
      router.push("/equipamentos");
      router.refresh();
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar equipamento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = trpc.equipamentos.update.useMutation({
    onSuccess: () => {
      toast({
        title: "Equipamento atualizado!",
        description: "Os dados foram atualizados com sucesso.",
      });
      router.push(`/equipamentos/${equipamentoId}`);
      router.refresh();
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar equipamento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EquipamentoFormValues) => {
    if (equipamentoId) {
      updateMutation.mutate({ id: equipamentoId, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>Dados principais do equipamento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="nomeEquip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Equipamento *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Betoneira 400L, Martelete SDS Plus..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="codigoEquip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: BET-001, MT-002" 
                        {...field} 
                        value={field.value || ""} 
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormDescription>
                      Código único para identificação
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantidadeDisp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade em Estoque *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        placeholder="0" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Unidades disponíveis
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preços por Período</CardTitle>
            <CardDescription>Defina os valores de locação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="precoDiaria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Diária (R$) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0"
                        placeholder="0.00" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="precoSemanal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Semanal (R$) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0"
                        placeholder="0.00" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="precoQuinzenal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Quinzenal (R$) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0"
                        placeholder="0.00" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="precoMensal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Mensal (R$) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0"
                        placeholder="0.00" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="valorPatrimonio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Patrimonial (R$)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      min="0"
                      placeholder="0.00" 
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Valor de aquisição do equipamento (opcional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {equipamentoId ? "Atualizar Equipamento" : "Criar Equipamento"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

