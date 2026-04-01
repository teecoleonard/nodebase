"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { formatDate } from "@/lib/utils/formatters/date";
import { formatCurrency } from "@/lib/utils/formatters/currency";

// Estilos do PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottom: "2pt solid #000",
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
  },
  section: {
    marginTop: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
  },
  label: {
    width: "30%",
    fontWeight: "bold",
  },
  value: {
    width: "70%",
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    padding: 8,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottom: "1pt solid #e0e0e0",
  },
  tableCol1: {
    width: "50%",
  },
  tableCol2: {
    width: "25%",
    textAlign: "right",
  },
  tableCol3: {
    width: "25%",
    textAlign: "right",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 9,
    color: "#666",
    borderTop: "1pt solid #e0e0e0",
    paddingTop: 10,
  },
  totalBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
  statusBadge: {
    padding: 5,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    fontSize: 10,
    textAlign: "center",
  },
});

interface FaturaPDFProps {
  fatura: any;
}

export function FaturaPDF({ fatura }: FaturaPDFProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAGA":
        return "#4ade80";
      case "PENDENTE":
        return "#fbbf24";
      case "VENCIDA":
        return "#f87171";
      default:
        return "#e0e0e0";
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.title}>FATURA</Text>
          <Text style={styles.subtitle}>Nº {fatura.numeroFatura}</Text>
        </View>

        {/* Status */}
        <View style={{ ...styles.statusBadge, backgroundColor: getStatusColor(fatura.status) }}>
          <Text>{fatura.status}</Text>
        </View>

        {/* Informações da Fatura */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DADOS DA FATURA</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Data de Emissão:</Text>
            <Text style={styles.value}>
              {formatDate(new Date(fatura.dataEmissao))}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Data de Vencimento:</Text>
            <Text style={styles.value}>
              {formatDate(new Date(fatura.dataVencimento))}
            </Text>
          </View>
          {fatura.dataPagamento && (
            <View style={styles.row}>
              <Text style={styles.label}>Data de Pagamento:</Text>
              <Text style={styles.value}>
                {formatDate(new Date(fatura.dataPagamento))}
              </Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Referência:</Text>
            <Text style={styles.value}>
              {fatura.mesReferencia}/{fatura.anoReferencia}
            </Text>
          </View>
        </View>

        {/* Informações do Cliente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CLIENTE</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nome/Razão Social:</Text>
            <Text style={styles.value}>{fatura.cliente?.contratante}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>CPF/CNPJ:</Text>
            <Text style={styles.value}>{fatura.cliente?.cpfCnpj}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Endereço:</Text>
            <Text style={styles.value}>
              {fatura.cliente?.endereco}, {fatura.cliente?.numero}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Cidade/UF:</Text>
            <Text style={styles.value}>
              {fatura.cliente?.cidade} - {fatura.cliente?.estado}
            </Text>
          </View>
        </View>

        {/* Contratos Incluídos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONTRATOS INCLUÍDOS</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableCol1}>Contrato</Text>
              <Text style={styles.tableCol2}>Período</Text>
              <Text style={styles.tableCol3}>Valor</Text>
            </View>
            {fatura.contratos?.map((fc: any, index: number) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCol1}>
                  Nº {fc.contrato?.contratoNum}
                </Text>
                <Text style={styles.tableCol2}>
                  {fc.contrato?.contratoPeriodo}
                </Text>
                <Text style={styles.tableCol3}>
                  {formatCurrency(Number(fc.contrato?.valorTotal || 0))}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Totais */}
        <View style={styles.totalBox}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Valor Total:</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(Number(fatura.valorTotal))}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Valor Pago:</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(Number(fatura.valorPago))}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Saldo:</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(Number(fatura.valorTotal) - Number(fatura.valorPago))}
            </Text>
          </View>
        </View>

        {/* Observações */}
        {fatura.observacoes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>OBSERVAÇÕES</Text>
            <Text>{fatura.observacoes}</Text>
          </View>
        )}

        {/* Rodapé */}
        <Text style={styles.footer}>
          ALG Gestão - Sistema de Locação de Equipamentos
          {"\n"}
          Gerado em: {formatDate(new Date())}
        </Text>
      </Page>
    </Document>
  );
}

