"use client";

import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { ContratoPDF } from "./contrato-pdf";

interface GerarPDFButtonProps {
  contrato: any;
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

export function GerarPDFButton({ contrato, variant = "outline", size = "default" }: GerarPDFButtonProps) {
  const handleGerarPDF = async () => {
    try {
      // Gerar o PDF
      const blob = await pdf(<ContratoPDF contrato={contrato} />).toBlob();
      
      // Criar URL para download
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `contrato-${contrato.contratoNum}.pdf`;
      link.click();
      
      // Limpar URL
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
    }
  };

  return (
    <Button variant={variant} size={size} onClick={handleGerarPDF}>
      <FileText className="mr-2 h-4 w-4" />
      Gerar PDF
    </Button>
  );
}

