/**
 * Formatadores de moeda
 * Equivalente ao CurrencyUtils do Android
 */

export function formatarMoeda(valor: number | string): string {
  const numero = typeof valor === "string" ? Number.parseFloat(valor) : valor;

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numero);
}

export function parseMoeda(valorFormatado: string): number {
  // Remove todos os caracteres exceto números, vírgula e ponto
  const valorLimpo = valorFormatado
    .replace(/[R$\s]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  return Number.parseFloat(valorLimpo) || 0;
}

export function formatarDecimal(
  valor: number | string,
  casasDecimais = 2,
): string {
  const numero = typeof valor === "string" ? Number.parseFloat(valor) : valor;

  return numero.toFixed(casasDecimais).replace(".", ",");
}

// Alias para formatarMoeda (usado nas páginas)
export const formatCurrency = formatarMoeda;

