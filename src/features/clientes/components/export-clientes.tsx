"use client";

import { ExportButton } from "@/components/export/export-button";
import { type ExportColumn } from "@/lib/utils/export";
import { formatDate } from "@/lib/utils/formatters/date";

interface ExportClientesProps {
  clientes: any[];
}

export function ExportClientes({ clientes }: ExportClientesProps) {
  const columns: ExportColumn[] = [
    { header: "ID", key: "id" },
    { header: "Nome/Razão Social", key: "contratante" },
    { header: "CPF/CNPJ", key: "cpfCnpj" },
    { header: "Email", key: "email" },
    { header: "Telefone", key: "telefone" },
    { header: "CEP", key: "cep" },
    { header: "Endereço", key: "endereco" },
    { header: "Número", key: "numero" },
    { header: "Bairro", key: "bairro" },
    { header: "Cidade", key: "cidade" },
    { header: "Estado", key: "estado" },
    { 
      header: "Data de Cadastro", 
      key: "dataHoraCadastro",
      format: (value) => value ? formatDate(new Date(value)) : ""
    },
  ];

  return (
    <ExportButton
      data={clientes}
      columns={columns}
      filename={`clientes-${new Date().toISOString().split("T")[0]}`}
      label="Exportar Clientes"
    />
  );
}

