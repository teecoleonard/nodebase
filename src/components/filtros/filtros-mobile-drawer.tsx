"use client";

import { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

interface FiltrosMobileDrawerProps {
  children: React.ReactNode;
  title?: string;
}

export function FiltrosMobileDrawer({ children, title = "Filtros" }: FiltrosMobileDrawerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop: mostrar filtros normalmente */}
      <div className="hidden md:block">
        {children}
      </div>

      {/* Mobile: mostrar em Drawer */}
      <div className="md:hidden">
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline" className="w-full">
              <Filter className="mr-2 h-4 w-4" />
              {title}
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{title}</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 pb-8 overflow-y-auto max-h-[70vh]">
              {children}
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
}

