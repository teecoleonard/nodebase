"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  Pencil,
  Plus,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { updateFaturaSchema, type UpdateFaturaInput } from "@/features/faturas/schemas/fatura.schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditarFaturaDialogProps {
  fatura: any;
  trigger?: React.ReactNode;
}

type ParcelaFormState = {
  tempId: string;
  numero: number;
  dataVencimento: Date;
  valor: number;
  portador?: string;
  observacao?: string;
};

const statusOptions = [
  { value: "PENDENTE", label: "Pendente" },
  { value: "PAGA", label: "Paga" },
  { value: "VENCIDA", label: "Vencida" },
  { value: "CANCELADA", label: "Cancelada" },
];

function createTempId() {
  return Math.random().toString(36).slice(2, 9);
}

export function EditarFaturaDialog({ fatura, trigger }: EditarFaturaDialogProps) {
  const [open, setOpen] = useState(false);
  const [parcelas, setParcelas] = useState<ParcelaFormState[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<UpdateFaturaInput>({
    resolver: zodResolver(updateFaturaSchema),
    defaultValues: {
      id: fatura.id,
      dataVencimento: new Date(fatura.dataVencimento),
      valorTotal: Number(fatura.valorTotal),
      observacoes: fatura.observacoes || "",
      status: fatura.status,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        id: fatura.id,
        dataVencimento: new Date(fatura.dataVencimento),
        valorTotal: Number(fatura.valorTotal),
        observacoes: fatura.observacoes || "",
        status: fatura.status,
      });
      setParcelas(
        (fatura.parcelas && fatura.parcelas.length > 0
          ? fatura.parcelas
          : [
              {
                numero: 1,
                dataVencimento: fatura.dataVencimento,
                valor: Number(fatura.valorTotal) || 0,
                portador: "",
              },
            ]
        ).map((parcela: any, index: number) => ({
          tempId: createTempId(),
          numero: parcela.numero || index + 1,
          dataVencimento: new Date(parcela.dataVencimento ?? fatura.dataVencimento),
          valor: Number(parcela.valor ?? 0),
          portador: parcela.portador || "",
          observacao: parcela.observacao || "",
        })),
      );
    }
  }, [open, fatura, form]);

  const valorTotal = Number(form.watch("valorTotal") || 0);
  const parcelasTotal = useMemo(
    () => parcelas.reduce((sum, parcela) => sum + Number(parcela.valor || 0), 0),
    [parcelas],
  );
  const diferenca = Number((valorTotal - parcelasTotal).toFixed(2));
  const parcelasInvalidas = Math.abs(diferenca) > 0.01;

  const atualizarFatura = trpc.faturas.update.useMutation({
    onSuccess: () => {
      toast({
        title: "Fatura atualizada!",
        description: "A fatura foi atualizada com sucesso.",
      });
      setOpen(false);
      router.refresh();
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar fatura",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  async function onSubmit(data: UpdateFaturaInput) {
    await atualizarFatura.mutateAsync({
      ...data,
      parcelas: parcelas.map((parcela, index) => ({
        numero: parcela.numero || index + 1,
        dataVencimento: parcela.dataVencimento,
        valor: Number(parcela.valor) || 0,
        portador: parcela.portador || undefined,
        observacao: parcela.observacao || undefined,
      })),
    });
  }

  const updateParcela = (
    tempId: string,
    field: keyof ParcelaFormState,
    value: any,
  ) => {
    setParcelas((prev) =>
      prev.map((parcela) =>
        parcela.tempId === tempId ? { ...parcela, [field]: value } : parcela,
      ),
    );
  };

  const removeParcela = (tempId: string) => {
    setParcelas((prev) => prev.filter((parcela) => parcela.tempId !== tempId));
  };

  const addParcela = () => {
    setParcelas((prev) => [
      ...prev,
      {
        tempId: createTempId(),
        numero: prev.length + 1,
        dataVencimento: form.getValues("dataVencimento") || new Date(),
        valor: 0,
        portador: "",
        observacao: "",
      },
    ]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Pencil className="mr-2 h-4 w-4" />
            Editar Fatura
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Editar Fatura</DialogTitle>
          <DialogDescription>
            Ajuste datas, status e distribua valores por parcela. A soma das
            parcelas deve ser igual ao valor total.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="dataVencimento"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Vencimento</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="valorTotal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Total (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="observacoes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-3 rounded-2xl border border-border/70 p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold">Parcelas</p>
                  <p className="text-xs text-muted-foreground">
                    Distribua o valor por parcelas e informe portadores.
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addParcela}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar parcela
                </Button>
              </div>

              <div className="space-y-3">
                {parcelas.map((parcela, index) => (
                  <div
                    key={parcela.tempId}
                    className="grid gap-3 rounded-xl border border-border/60 p-3 md:grid-cols-[80px_1fr_1fr_1fr_auto]"
                  >
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">
                        Nº
                      </label>
                      <Input
                        type="number"
                        min="1"
                        value={parcela.numero}
                        onChange={(e) =>
                          updateParcela(parcela.tempId, "numero", Number(e.target.value) || 1)
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">
                        Vencimento
                      </label>
                      <Input
                        type="date"
                        value={format(parcela.dataVencimento, "yyyy-MM-dd")}
                        onChange={(e) =>
                          updateParcela(
                            parcela.tempId,
                            "dataVencimento",
                            e.target.value ? new Date(e.target.value) : new Date(),
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">
                        Valor (R$)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={parcela.valor}
                        onChange={(e) =>
                          updateParcela(
                            parcela.tempId,
                            "valor",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">
                        Portador
                      </label>
                      <Input
                        value={parcela.portador}
                        onChange={(e) =>
                          updateParcela(parcela.tempId, "portador", e.target.value)
                        }
                        placeholder="Banco/Conta"
                      />
                    </div>
                    <div className="flex items-end justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeParcela(parcela.tempId)}
                        disabled={parcelas.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="md:col-span-5">
                      <Input
                        value={parcela.observacao || ""}
                        onChange={(e) =>
                          updateParcela(parcela.tempId, "observacao", e.target.value)
                        }
                        placeholder="Observação da parcela (opcional)"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-muted/40 px-4 py-3 text-sm">
                <p>
                  Total das parcelas:{" "}
                  <span className="font-semibold">
                    R$ {parcelasTotal.toFixed(2)}
                  </span>
                </p>
                <p
                  className={cn(
                    "text-xs font-semibold",
                    parcelasInvalidas ? "text-destructive" : "text-emerald-600",
                  )}
                >
                  Diferença: R$ {diferenca.toFixed(2)}
                </p>
                {parcelasInvalidas && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    Ajuste os valores para igualar ao total da fatura.
                  </div>
                )}
              </div>
            </div>

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações adicionais</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
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
              <Button
                type="submit"
                disabled={atualizarFatura.isPending || parcelasInvalidas}
              >
                {atualizarFatura.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

