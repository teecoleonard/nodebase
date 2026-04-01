"use client";

import * as XLSX from "xlsx";

export interface ExportColumn {
  header: string;
  key: string;
  format?: (value: any) => any;
}

export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  columns: ExportColumn[],
  filename: string
) {
  // Mapear dados conforme colunas
  const formattedData = data.map((item) => {
    const row: Record<string, any> = {};
    columns.forEach((col) => {
      const value = item[col.key];
      row[col.header] = col.format ? col.format(value) : value;
    });
    return row;
  });

  // Criar workbook
  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Dados");

  // Definir largura das colunas
  const maxWidths = columns.map((col) => col.header.length);
  formattedData.forEach((row) => {
    Object.values(row).forEach((value, idx) => {
      const valueLength = String(value).length;
      if (valueLength > maxWidths[idx]) {
        maxWidths[idx] = valueLength;
      }
    });
  });

  worksheet["!cols"] = maxWidths.map((w) => ({ wch: Math.min(w + 2, 50) }));

  // Baixar arquivo
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  columns: ExportColumn[],
  filename: string
) {
  // Criar header
  const headers = columns.map((col) => col.header).join(",");

  // Criar rows
  const rows = data.map((item) => {
    return columns
      .map((col) => {
        const value = item[col.key];
        const formatted = col.format ? col.format(value) : value;
        // Escapar vírgulas e aspas
        const escaped = String(formatted).replace(/"/g, '""');
        return `"${escaped}"`;
      })
      .join(",");
  });

  // Combinar tudo
  const csv = [headers, ...rows].join("\n");

  // Criar blob e baixar
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadJSON<T extends Record<string, any>>(
  data: T[],
  filename: string
) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.json`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

