"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateClienteDialog } from "./create-cliente-dialog";

export function CreateClienteButton() {
  return (
    <CreateClienteDialog>
      <Button>
        <Plus className="mr-2 h-4 w-4" />
        Novo Cliente
      </Button>
    </CreateClienteDialog>
  );
}

