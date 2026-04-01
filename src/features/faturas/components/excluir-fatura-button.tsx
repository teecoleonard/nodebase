"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { useToast } from "@/hooks/use-toast";

type ExcluirFaturaButtonProps = {
  faturaId: number;
  numeroFatura: string;
  disabled?: boolean;
};

export function ExcluirFaturaButton({
  faturaId,
  numeroFatura,
  disabled,
}: ExcluirFaturaButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const deleteMutation = trpc.faturas.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Fatura excluída",
        description: `A fatura ${numeroFatura} foi removida com sucesso.`,
      });
      setOpen(false);
      router.push("/faturas");
      router.refresh();
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
      setOpen(false);
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate({ faturaId });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          disabled={disabled || deleteMutation.isPending}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Excluir
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir fatura?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. A fatura {numeroFatura} será removida
            permanentemente junto com seus vínculos. Prosseguir?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

