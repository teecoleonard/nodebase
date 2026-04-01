"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { trpc } from "@/trpc/client";
import { createEquipamentoSchema } from "../schemas/equipamento.schema";

type CreateEquipamentoFormValues = z.infer<typeof createEquipamentoSchema>;

export function CreateEquipamentoDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<CreateEquipamentoFormValues>({
    resolver: zodResolver(createEquipamentoSchema),
    defaultValues: {
      nomeEquip: "",
      codigoEquip: "",
      precoDiaria: "0",
      precoSemanal: "0",
      precoQuinzenal: "0",
      precoMensal: "0",
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
      form.reset();
      setOpen(false);
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

  const onSubmit = (data: CreateEquipamentoFormValues) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Equipamento</DialogTitle>
          <DialogDescription>
            Cadastre um novo equipamento no sistema
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nomeEquip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Equipamento *</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome do equipamento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="codigoEquip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código</FormLabel>
                    <FormControl>
                      <Input placeholder="EX: BET-001" {...field} value={field.value || ""} />
                    </FormControl>
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
                        placeholder="0" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="precoDiaria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Diária (R$) *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
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
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="precoQuinzenal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Quinzenal (R$) *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
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
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
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
                  <FormLabel>Valor Patrimônio (R$)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00" 
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={createMutation.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Equipamento
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

