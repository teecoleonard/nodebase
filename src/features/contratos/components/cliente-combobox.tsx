"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { trpc } from "@/trpc/client";

interface ClienteComboboxProps {
  value: number | null;
  onChange: (value: number | null) => void;
}

export function ClienteCombobox({ value, onChange }: ClienteComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data, isLoading } = trpc.clientes.list.useQuery({
    limit: 100,
    offset: 0,
    query: search,
  });

  const clientes = data?.clientes || [];
  const selectedCliente = clientes.find((c) => c.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedCliente ? (
            <span className="flex items-center gap-2">
              <span className="font-medium">{selectedCliente.contratante}</span>
              <span className="text-muted-foreground text-sm">
                {selectedCliente.cpfCnpj}
              </span>
            </span>
          ) : (
            <span className="text-muted-foreground">Selecione um cliente...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Buscar cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <CommandList>
            {isLoading ? (
              <div className="py-6 text-center text-sm">Carregando...</div>
            ) : clientes.length === 0 ? (
              <CommandEmpty>Nenhum cliente encontrado</CommandEmpty>
            ) : (
              <CommandGroup>
                {clientes.map((cliente) => (
                  <CommandItem
                    key={cliente.id}
                    value={cliente.id.toString()}
                    onSelect={() => {
                      onChange(cliente.id === value ? null : cliente.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === cliente.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{cliente.contratante}</span>
                      <span className="text-sm text-muted-foreground">
                        {cliente.cpfCnpj}
                        {cliente.telefone && ` • ${cliente.telefone}`}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

