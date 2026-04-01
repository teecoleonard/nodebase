"use client";

import { useState } from "react";
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
import { Pencil } from "lucide-react";
import { atualizarValorContratoFaturaSchema, type AtualizarValorContratoFaturaInput } from "@/features/faturas/schemas/fatura.schema";

interface EditarValorContratoDialogProps {
  faturaContrato: any;
  trigger?: React.ReactNode;
}

export function EditarValorContratoDialog({ faturaContrato, trigger }: EditarValorContratoDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<AtualizarValorContratoFaturaInput>({
    resolver: zodResolver(atualizarValorContratoFaturaSchema),
    defaultValues: {
      faturaContratoId: faturaContrato.id,
      valorContrato: Number(faturaContrato.valorContrato),
    },
  });

  const atualizarValor = trpc.faturas.atualizarValorContrato.useMutation({
    onSuccess: () => {
      toast({
        title: "Valor atualizado!",
        description: "O valor do contrato foi atualizado com sucesso.",
      });
      setOpen(false);
      router.refresh();
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar valor",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  async function onSubmit(data: AtualizarValorContratoFaturaInput) {
    await atualizarValor.mutateAsync(data);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm">
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Editar Valor do Contrato</DialogTitle>
          <DialogDescription>
            Altere o valor do contrato nesta fatura.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-medium">Contrato #{faturaContrato.contrato.contratoNum}</p>
              <p className="text-xs text-muted-foreground">
                Valor Original: R$ {Number(faturaContrato.contrato.valorTotal).toFixed(2)}
              </p>
            </div>
            <FormField
              control={form.control}
              name="valorContrato"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Novo Valor (R$)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={atualizarValor.isPending}>
                {atualizarValor.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

