"use client";

import { ExportButton } from "@/components/export/export-button";
import { type ExportColumn } from "@/lib/utils/export";
import { formatCurrency } from "@/lib/utils/formatters/currency";
import { formatDate } from "@/lib/utils/formatters/date";

interface ExportContratosProps {
  contratos: any[];
}

export function ExportContratos({ contratos }: ExportContratosProps) {
  const columns: ExportColumn[] = [
    { header: "ID", key: "id" },
    { header: "Número", key: "contratoNum" },
    { 
      header: "Cliente", 
      key: "cliente",
      format: (value) => value?.contratante || ""
    },
    { header: "Status", key: "statusContrato" },
    { header: "Período", key: "contratoPeriodo" },
    { 
      header: "Data Emissão", 
      key: "dataHoraEmissao",
      format: (value) => value ? formatDate(new Date(value)) : ""
    },
    { 
      header: "Data Vencimento", 
      key: "dataVenc",
      format: (value) => value ? formatDate(new Date(value)) : ""
    },
    { 
      header: "Valor Total", 
      key: "valorTotal",
      format: (value) => formatCurrency(Number(value))
    },
    { header: "Local da Obra", key: "obraLocal" },
    { header: "Responsável", key: "respPedido" },
    { header: "Observações", key: "observacoes" },
  ];

  return (
    <ExportButton
      data={contratos}
      columns={columns}
      filename={`contratos-${new Date().toISOString().split("T")[0]}`}
      label="Exportar Contratos"
    />
  );
}

