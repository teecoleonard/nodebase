"use client";

import { ExportButton } from "@/components/export/export-button";
import { type ExportColumn } from "@/lib/utils/export";
import { formatCurrency } from "@/lib/utils/formatters/currency";
import { formatDate } from "@/lib/utils/formatters/date";

interface ExportEquipamentosProps {
  equipamentos: any[];
}

export function ExportEquipamentos({ equipamentos }: ExportEquipamentosProps) {
  const columns: ExportColumn[] = [
    { header: "ID", key: "id" },
    { header: "Nome", key: "nomeEquip" },
    { header: "Código", key: "codigoEquip" },
    { header: "Categoria", key: "categoria" },
    { 
      header: "Preço Diária", 
      key: "precoDiaria",
      format: (value) => formatCurrency(Number(value))
    },
    { 
      header: "Preço Semanal", 
      key: "precoSemanal",
      format: (value) => formatCurrency(Number(value))
    },
    { 
      header: "Preço Quinzenal", 
      key: "precoQuinzenal",
      format: (value) => formatCurrency(Number(value))
    },
    { 
      header: "Preço Mensal", 
      key: "precoMensal",
      format: (value) => formatCurrency(Number(value))
    },
    { header: "Quantidade Disponível", key: "quantidadeDisp" },
    { 
      header: "Valor Patrimônio", 
      key: "valorPatrimonio",
      format: (value) => value ? formatCurrency(Number(value)) : ""
    },
    { 
      header: "Data de Cadastro", 
      key: "dataHoraCadastro",
      format: (value) => value ? formatDate(new Date(value)) : ""
    },
  ];

  return (
    <ExportButton
      data={equipamentos}
      columns={columns}
      filename={`equipamentos-${new Date().toISOString().split("T")[0]}`}
      label="Exportar Equipamentos"
    />
  );
}

