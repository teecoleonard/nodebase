"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { trpc } from "@/trpc/client";
import { registrarPagamentoSchema, type RegistrarPagamentoInput } from "../schemas/pagamento.schema";
import { formatCurrency } from "@/lib/utils/formatters/currency";

interface PagamentoFormProps {
  fatura: {
    id: number;
    numeroFatura: string;
    valorTotal: string | number;
    valorPago: string | number;
  };
}

export function PagamentoForm({ fatura }: PagamentoFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const saldoDevedor = Number(fatura.valorTotal) - Number(fatura.valorPago);

  const form = useForm<RegistrarPagamentoInput>({
    resolver: zodResolver(registrarPagamentoSchema),
    defaultValues: {
      id: fatura.id,
      valorPago: saldoDevedor,
      dataPagamento: new Date(),
      metodoPagamento: "",
      observacoes: "",
    },
  });

  const registrarPagamento = trpc.faturas.registrarPagamento.useMutation({
    onSuccess: () => {
      toast({
        title: "Pagamento registrado!",
        description: "O pagamento foi registrado com sucesso.",
      });
      router.push(`/faturas/${fatura.id}`);
      router.refresh();
    },
    onError: (error) => {
      toast({
        title: "Erro ao registrar pagamento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  async function onSubmit(data: RegistrarPagamentoInput) {
    await registrarPagamento.mutateAsync(data);
  }

  const valorPago = form.watch("valorPago");
  const isPagamentoTotal = Number(valorPago) >= saldoDevedor;
  const isPagamentoParcial = Number(valorPago) > 0 && Number(valorPago) < saldoDevedor;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Informações da Fatura */}
        <div className="rounded-lg border p-4 space-y-2 bg-muted/50">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Fatura:</span>
            <span className="font-medium">{fatura.numeroFatura}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Valor Total:</span>
            <span className="font-medium">{formatCurrency(Number(fatura.valorTotal))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Já Pago:</span>
            <span className="font-medium text-green-600">
              {formatCurrency(Number(fatura.valorPago))}
            </span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="font-semibold">Saldo Devedor:</span>
            <span className="font-bold text-lg text-orange-600">
              {formatCurrency(saldoDevedor)}
            </span>
          </div>
        </div>

        {/* Valor do Pagamento */}
        <FormField
          control={form.control}
          name="valorPago"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor do Pagamento *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormDescription>
                {isPagamentoTotal && (
                  <span className="text-green-600 font-medium">
                    ✓ Pagamento total - A fatura será marcada como PAGA
                  </span>
                )}
                {isPagamentoParcial && (
                  <span className="text-orange-600 font-medium">
                    ⚠ Pagamento parcial - Restará {formatCurrency(saldoDevedor - Number(valorPago))}
                  </span>
                )}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Data do Pagamento */}
        <FormField
          control={form.control}
          name="dataPagamento"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data do Pagamento *</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
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
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Método de Pagamento */}
        <FormField
          control={form.control}
          name="metodoPagamento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Método de Pagamento</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o método" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="DINHEIRO">Dinheiro</SelectItem>
                  <SelectItem value="PIX">PIX</SelectItem>
                  <SelectItem value="CARTAO_CREDITO">Cartão de Crédito</SelectItem>
                  <SelectItem value="CARTAO_DEBITO">Cartão de Débito</SelectItem>
                  <SelectItem value="BOLETO">Boleto</SelectItem>
                  <SelectItem value="TRANSFERENCIA">Transferência Bancária</SelectItem>
                  <SelectItem value="CHEQUE">Cheque</SelectItem>
                  <SelectItem value="OUTRO">Outro</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Observações */}
        <FormField
          control={form.control}
          name="observacoes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Observações sobre o pagamento..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Informações adicionais sobre este pagamento
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Botões */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => router.back()}
            disabled={registrarPagamento.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={registrarPagamento.isPending}
          >
            {registrarPagamento.isPending
              ? "Processando..."
              : isPagamentoTotal
              ? "Confirmar Pagamento Total"
              : "Confirmar Pagamento Parcial"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

