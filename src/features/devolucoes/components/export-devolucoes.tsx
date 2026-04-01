"use client";

import { ExportButton } from "@/components/export/export-button";
import { type ExportColumn } from "@/lib/utils/export";
import { formatDate } from "@/lib/utils/formatters/date";

interface ExportDevolucoesProps {
  devolucoes: any[];
}

export function ExportDevolucoes({ devolucoes }: ExportDevolucoesProps) {
  const columns: ExportColumn[] = [
    { header: "ID", key: "id" },
    { header: "Número Devolução", key: "devNum" },
    { 
      header: "Contrato", 
      key: "contrato",
      format: (value) => value?.contratoNum || value?.id || ""
    },
    { 
      header: "Cliente", 
      key: "cliente",
      format: (value) => value?.contratante || ""
    },
    { 
      header: "Equipamento", 
      key: "equipamento",
      format: (value) => value?.nomeEquip || ""
    },
    { 
      header: "Data Prevista", 
      key: "dataDevolucaoPrevista",
      format: (value) => value ? formatDate(new Date(value)) : ""
    },
    { 
      header: "Data Efetiva", 
      key: "dataDevolucaoEfetiva",
      format: (value) => value ? formatDate(new Date(value)) : "Não devolvido"
    },
    { header: "Quantidade Contratada", key: "quantidadeContratada" },
    { header: "Quantidade Devolvida", key: "quantidadeDevolvida" },
    { header: "Status Devolução", key: "statusItemDevolucao" },
    { header: "Status Assinatura", key: "statusAssinatura" },
    { 
      header: "Data Assinatura", 
      key: "dataAssinatura",
      format: (value) => value ? formatDate(new Date(value)) : "Não assinado"
    },
    { header: "Observações", key: "observacaoItemDevolucao" },
  ];

  return (
    <ExportButton
      data={devolucoes}
      columns={columns}
      filename={`devolucoes-${new Date().toISOString().split("T")[0]}`}
      label="Exportar Devoluções"
    />
  );
}

