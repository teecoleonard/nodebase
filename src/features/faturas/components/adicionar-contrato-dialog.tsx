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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils/formatters/currency";
import { adicionarContratoFaturaSchema, type AdicionarContratoFaturaInput } from "@/features/faturas/schemas/fatura.schema";

interface AdicionarContratoDialogProps {
  fatura: any;
  trigger?: React.ReactNode;
}

export function AdicionarContratoDialog({ fatura, trigger }: AdicionarContratoDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Buscar contratos do mês do cliente que ainda não estão na fatura
  const { data: contratosDoMes, isLoading } = trpc.faturas.contratosDoMes.useQuery(
    {
      clienteId: fatura.clienteId,
      mesReferencia: fatura.mesReferencia,
      anoReferencia: fatura.anoReferencia,
    },
    { enabled: open }
  );

  // Filtrar contratos que já estão na fatura
  const contratosDisponiveis = contratosDoMes?.filter(
    (contrato) =>
      !fatura.contratos.some((fc: any) => fc.contratoId === contrato.id)
  ) || [];

  const form = useForm<AdicionarContratoFaturaInput>({
    resolver: zodResolver(adicionarContratoFaturaSchema),
    defaultValues: {
      faturaId: fatura.id,
      contratoId: 0,
      valorContrato: undefined,
    },
  });

  const contratoSelecionado = form.watch("contratoId");
  const contrato = contratosDisponiveis.find((c) => c.id === contratoSelecionado);

  // Atualizar valor quando selecionar contrato
  useEffect(() => {
    if (contrato && form.getValues("valorContrato") === undefined) {
      form.setValue("valorContrato", contrato.valorTotal);
    }
  }, [contrato]);

  const adicionarContrato = trpc.faturas.adicionarContrato.useMutation({
    onSuccess: () => {
      toast({
        title: "Contrato adicionado!",
        description: "O contrato foi adicionado à fatura com sucesso.",
      });
      setOpen(false);
      form.reset();
      router.refresh();
    },
    onError: (error) => {
      toast({
        title: "Erro ao adicionar contrato",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  async function onSubmit(data: AdicionarContratoFaturaInput) {
    await adicionarContrato.mutateAsync(data);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Contrato
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Contrato à Fatura</DialogTitle>
          <DialogDescription>
            Selecione um contrato do mês para incluir nesta fatura.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="contratoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contrato</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(parseInt(value));
                      form.setValue("valorContrato", undefined);
                    }}
                    value={field.value?.toString()}
                    disabled={isLoading || contratosDisponiveis.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um contrato" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoading ? (
                        <SelectItem value="loading" disabled>
                          Carregando...
                        </SelectItem>
                      ) : contratosDisponiveis.length === 0 ? (
                        <SelectItem value="empty" disabled>
                          Nenhum contrato disponível
                        </SelectItem>
                      ) : (
                        contratosDisponiveis.map((contrato) => (
                          <SelectItem key={contrato.id} value={contrato.id.toString()}>
                            #{contrato.contratoNum} - {formatCurrency(contrato.valorTotal)}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {contrato && (
              <div className="p-3 bg-muted rounded-md space-y-1">
                <p className="text-sm font-medium">Informações do Contrato</p>
                <p className="text-xs text-muted-foreground">
                  Status: <span className="font-medium">{contrato.statusContrato}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Valor Original: {formatCurrency(contrato.valorTotal)}
                </p>
              </div>
            )}
            <FormField
              control={form.control}
              name="valorContrato"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor do Contrato na Fatura (R$)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseFloat(e.target.value) : undefined
                        )
                      }
                      placeholder={contrato ? formatCurrency(contrato.valorTotal) : "0.00"}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    Deixe em branco para usar o valor original do contrato
                  </p>
                </FormItem>
              )}
            />
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
                disabled={adicionarContrato.isPending || !contratoSelecionado}
              >
                {adicionarContrato.isPending ? "Adicionando..." : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

