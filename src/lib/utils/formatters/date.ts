/**
 * Formatadores de data
 */

import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatarData(
  data: Date | string,
  formato = "dd/MM/yyyy",
): string {
  const dataObj = typeof data === "string" ? parseISO(data) : data;
  return format(dataObj, formato, { locale: ptBR });
}

export function formatarDataHora(
  data: Date | string,
  formato = "dd/MM/yyyy HH:mm",
): string {
  const dataObj = typeof data === "string" ? parseISO(data) : data;
  return format(dataObj, formato, { locale: ptBR });
}

export function formatarDataCompleta(data: Date | string): string {
  const dataObj = typeof data === "string" ? parseISO(data) : data;
  return format(dataObj, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
}

export function calcularDiferencaDias(
  dataInicio: Date | string,
  dataFim: Date | string,
): number {
  const inicio =
    typeof dataInicio === "string" ? parseISO(dataInicio) : dataInicio;
  const fim = typeof dataFim === "string" ? parseISO(dataFim) : dataFim;

  const diff = fim.getTime() - inicio.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Alias para formatarData (usado nas páginas)
export const formatDate = formatarData;

