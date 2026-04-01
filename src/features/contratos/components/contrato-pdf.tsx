"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
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
    width: "40%",
  },
  tableCol2: {
    width: "20%",
    textAlign: "right",
  },
  tableCol3: {
    width: "20%",
    textAlign: "right",
  },
  tableCol4: {
    width: "20%",
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
  signature: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureBox: {
    width: "45%",
    borderTop: "1pt solid #000",
    paddingTop: 5,
    textAlign: "center",
  },
});

interface ContratoPDFProps {
  contrato: any;
}

export function ContratoPDF({ contrato }: ContratoPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.title}>CONTRATO DE LOCAÇÃO DE EQUIPAMENTOS</Text>
          <Text style={styles.subtitle}>Nº {contrato.contratoNum}</Text>
        </View>

        {/* Informações do Cliente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONTRATANTE</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nome/Razão Social:</Text>
            <Text style={styles.value}>{contrato.cliente?.contratante}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>CPF/CNPJ:</Text>
            <Text style={styles.value}>{contrato.cliente?.cpfCnpj}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Endereço:</Text>
            <Text style={styles.value}>
              {contrato.cliente?.endereco}, {contrato.cliente?.numero} - {contrato.cliente?.bairro}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Cidade/UF:</Text>
            <Text style={styles.value}>
              {contrato.cliente?.cidade} - {contrato.cliente?.estado}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Telefone:</Text>
            <Text style={styles.value}>{contrato.cliente?.telefone}</Text>
          </View>
          {contrato.cliente?.email && (
            <View style={styles.row}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{contrato.cliente?.email}</Text>
            </View>
          )}
        </View>

        {/* Dados do Contrato */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DADOS DO CONTRATO</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Data de Emissão:</Text>
            <Text style={styles.value}>
              {formatDate(new Date(contrato.dataHoraEmissao))}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Data de Vencimento:</Text>
            <Text style={styles.value}>
              {formatDate(new Date(contrato.dataVenc))}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Período:</Text>
            <Text style={styles.value}>{contrato.contratoPeriodo}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.value}>{contrato.statusContrato}</Text>
          </View>
          {contrato.obraLocal && (
            <View style={styles.row}>
              <Text style={styles.label}>Local da Obra:</Text>
              <Text style={styles.value}>{contrato.obraLocal}</Text>
            </View>
          )}
          {contrato.respPedido && (
            <View style={styles.row}>
              <Text style={styles.label}>Responsável:</Text>
              <Text style={styles.value}>{contrato.respPedido}</Text>
            </View>
          )}
        </View>

        {/* Equipamentos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EQUIPAMENTOS LOCADOS</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableCol1}>Equipamento</Text>
              <Text style={styles.tableCol2}>Qtd</Text>
              <Text style={styles.tableCol3}>Valor Unit.</Text>
              <Text style={styles.tableCol4}>Subtotal</Text>
            </View>
            {contrato.equipamentos?.map((eq: any, index: number) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCol1}>{eq.equipamento?.nomeEquip}</Text>
                <Text style={styles.tableCol2}>{eq.quantidade}</Text>
                <Text style={styles.tableCol3}>
                  {formatCurrency(Number(eq.valorUnitario))}
                </Text>
                <Text style={styles.tableCol4}>
                  {formatCurrency(Number(eq.valorSubtotal))}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Valor Total */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>VALOR TOTAL DO CONTRATO:</Text>
            <Text style={{ ...styles.value, fontSize: 14, fontWeight: "bold" }}>
              {formatCurrency(Number(contrato.valorTotal))}
            </Text>
          </View>
        </View>

        {/* Observações */}
        {contrato.observacoes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>OBSERVAÇÕES</Text>
            <Text>{contrato.observacoes}</Text>
          </View>
        )}

        {/* Assinaturas */}
        <View style={styles.signature}>
          <View style={styles.signatureBox}>
            <Text>CONTRATANTE</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text>CONTRATADO</Text>
          </View>
        </View>

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

