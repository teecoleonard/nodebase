"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { formatDate } from "@/lib/utils/formatters/date";

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
  statusBadge: {
    backgroundColor: "#f0f0f0",
    padding: 5,
    borderRadius: 3,
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 5,
  },
});

interface DevolucaoPDFProps {
  devolucao: any;
}

export function DevolucaoPDF({ devolucao }: DevolucaoPDFProps) {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "DEVOLVIDO":
        return "Devolvido";
      case "PARCIAL":
        return "Devolvido Parcialmente";
      case "PENDENTE":
        return "Pendente";
      default:
        return status;
    }
  };

  const porcentagemDevolvida = devolucao.quantidadeContratada > 0
    ? ((devolucao.quantidadeDevolvida / devolucao.quantidadeContratada) * 100).toFixed(1)
    : "0";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.title}>TERMO DE DEVOLUÇÃO DE EQUIPAMENTO</Text>
          <Text style={styles.subtitle}>Nº {devolucao.devNum}</Text>
        </View>

        {/* Informações do Cliente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONTRATANTE</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nome/Razão Social:</Text>
            <Text style={styles.value}>{devolucao.cliente?.contratante || "N/A"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>CPF/CNPJ:</Text>
            <Text style={styles.value}>{devolucao.cliente?.cpfCnpj || "N/A"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Endereço:</Text>
            <Text style={styles.value}>
              {devolucao.cliente?.endereco || "N/A"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Cidade/UF:</Text>
            <Text style={styles.value}>
              {devolucao.cliente?.cidade || "N/A"} - {devolucao.cliente?.estado || "N/A"}
            </Text>
          </View>
        </View>

        {/* Informações do Contrato */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONTRATO REFERENTE</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Número do Contrato:</Text>
            <Text style={styles.value}>
              {devolucao.contrato?.contratoNum || "N/A"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Data de Emissão:</Text>
            <Text style={styles.value}>
              {devolucao.contrato?.dataHoraEmissao
                ? formatDate(new Date(devolucao.contrato.dataHoraEmissao))
                : "N/A"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Data de Vencimento:</Text>
            <Text style={styles.value}>
              {devolucao.contrato?.dataVenc
                ? formatDate(new Date(devolucao.contrato.dataVenc))
                : "N/A"}
            </Text>
          </View>
        </View>

        {/* Informações do Equipamento */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EQUIPAMENTO DEVOLVIDO</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nome do Equipamento:</Text>
            <Text style={styles.value}>
              {devolucao.equipamento?.nomeEquip || "N/A"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Código:</Text>
            <Text style={styles.value}>
              {devolucao.equipamento?.codigoEquip || "N/A"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Quantidade Contratada:</Text>
            <Text style={styles.value}>{devolucao.quantidadeContratada}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Quantidade Devolvida:</Text>
            <Text style={styles.value}>{devolucao.quantidadeDevolvida}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.value}>{getStatusLabel(devolucao.statusItemDevolucao)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Percentual Devolvido:</Text>
            <Text style={styles.value}>{porcentagemDevolvida}%</Text>
          </View>
        </View>

        {/* Datas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DATAS</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Data Prevista de Devolução:</Text>
            <Text style={styles.value}>
              {devolucao.dataDevolucaoPrevista
                ? formatDate(new Date(devolucao.dataDevolucaoPrevista))
                : "N/A"}
            </Text>
          </View>
          {devolucao.dataDevolucaoEfetiva && (
            <View style={styles.row}>
              <Text style={styles.label}>Data Efetiva de Devolução:</Text>
              <Text style={styles.value}>
                {formatDate(new Date(devolucao.dataDevolucaoEfetiva))}
              </Text>
            </View>
          )}
        </View>

        {/* Observações */}
        {devolucao.observacaoItemDevolucao && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>OBSERVAÇÕES</Text>
            <Text style={styles.value}>{devolucao.observacaoItemDevolucao}</Text>
          </View>
        )}

        {/* Assinaturas */}
        <View style={styles.signature}>
          <View style={styles.signatureBox}>
            <Text>Assinatura do Cliente</Text>
            {devolucao.statusAssinatura === "ASSINADO" && (
              <Text style={styles.subtitle}>
                Assinado em: {devolucao.dataAssinatura
                  ? formatDate(new Date(devolucao.dataAssinatura))
                  : "N/A"}
              </Text>
            )}
          </View>
          <View style={styles.signatureBox}>
            <Text>Assinatura da Empresa</Text>
          </View>
        </View>

        {/* Rodapé */}
        <View style={styles.footer}>
          <Text>
            Documento gerado em {formatDate(new Date())} - Sistema ALG Gestão
          </Text>
        </View>
      </Page>
    </Document>
  );
}

