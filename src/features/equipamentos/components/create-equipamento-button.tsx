"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateEquipamentoDialog } from "./create-equipamento-dialog";

export function CreateEquipamentoButton() {
  return (
    <CreateEquipamentoDialog>
      <Button>
        <Plus className="mr-2 h-4 w-4" />
        Novo Equipamento
      </Button>
    </CreateEquipamentoDialog>
  );
}

