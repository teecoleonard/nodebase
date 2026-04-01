"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText, FileJson } from "lucide-react";
import { exportToExcel, exportToCSV, downloadJSON, type ExportColumn } from "@/lib/utils/export";

interface ExportButtonProps<T extends Record<string, any>> {
  data: T[];
  columns: ExportColumn[];
  filename: string;
  label?: string;
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

export function ExportButton<T extends Record<string, any>>({
  data,
  columns,
  filename,
  label = "Exportar",
  variant = "outline",
  size = "default",
}: ExportButtonProps<T>) {
  const handleExportExcel = () => {
    exportToExcel(data, columns, filename);
  };

  const handleExportCSV = () => {
    exportToCSV(data, columns, filename);
  };

  const handleExportJSON = () => {
    downloadJSON(data, filename);
  };

  if (data.length === 0) {
    return (
      <Button variant={variant} size={size} disabled>
        <Download className="mr-2 h-4 w-4" />
        {label}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size}>
          <Download className="mr-2 h-4 w-4" />
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportExcel}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Exportar como Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportCSV}>
          <FileText className="mr-2 h-4 w-4" />
          Exportar como CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportJSON}>
          <FileJson className="mr-2 h-4 w-4" />
          Exportar como JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

