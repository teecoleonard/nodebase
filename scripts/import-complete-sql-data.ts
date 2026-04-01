import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import prisma from "../src/lib/db";

// Função auxiliar para parse de data MySQL
function parseDate(dateStr: string | null): Date | null {
  if (!dateStr || dateStr === "NULL") return null;
  try {
    return new Date(dateStr);
  } catch {
    return null;
  }
}

async function main() {
  console.log("🚀 Iniciando importação completa do banco de dados...\n");

  const sqlFile = path.join("C:\\Users\\leona\\Downloads\\localhost (1).sql");

  if (!fs.existsSync(sqlFile)) {
    console.error("❌ Arquivo SQL não encontrado!");
    return;
  }

  const sqlContent = fs.readFileSync(sqlFile, "utf-8");

  // ====================
  // 1. IMPORTAR CLIENTES
  // ====================
  console.log("📥 Importando Clientes...");
  const clienteMatches = sqlContent.matchAll(
    /INSERT INTO `Cliente`[^;]+VALUES\s*\((.*?)\);/gs,
  );

  let clientesImportados = 0;
  for (const match of clienteMatches) {
    const values = match[1];
    const rows = values.split(/\),\s*\(/);

    for (const row of rows) {
      const cleanRow = row.replace(/^\(|\)$/g, "");
      const fields = cleanRow.match(/(?:[^,']+|'[^']*')+/g);

      if (!fields || fields.length < 13) continue;

      const parseField = (field: string) => {
        const trimmed = field.trim();
        if (trimmed === "NULL") return null;
        return trimmed.replace(/^'|'$/g, "");
      };

      try {
        await prisma.cliente.upsert({
          where: { cpfCnpj: parseField(fields[2])! },
          update: {},
          create: {
            contratante: parseField(fields[1])!,
            cpfCnpj: parseField(fields[2])!,
            rgIe: parseField(fields[3]),
            endereco: parseField(fields[4]),
            bairro: parseField(fields[5]),
            cep: parseField(fields[6]),
            cidade: parseField(fields[7]),
            estado: parseField(fields[8]),
            telefone: parseField(fields[9]),
            email: parseField(fields[10]),
          },
        });
        clientesImportados++;
      } catch (error) {
        console.error(`Erro ao importar cliente:`, error);
      }
    }
  }
  console.log(`✅ ${clientesImportados} clientes importados\n`);

  // =======================
  // 2. IMPORTAR EQUIPAMENTOS
  // =======================
  console.log("📥 Importando Equipamentos...");
  const equipamentoMatches = sqlContent.matchAll(
    /INSERT INTO `Equipamento`[^;]+VALUES\s*\((.*?)\);/gs,
  );

  let equipamentosImportados = 0;
  for (const match of equipamentoMatches) {
    const values = match[1];
    const rows = values.split(/\),\s*\(/);

    for (const row of rows) {
      const cleanRow = row.replace(/^\(|\)$/g, "");
      const fields = cleanRow.match(/(?:[^,']+|'[^']*')+/g);

      if (!fields || fields.length < 10) continue;

      const parseField = (field: string) => {
        const trimmed = field.trim();
        if (trimmed === "NULL") return null;
        return trimmed.replace(/^'|'$/g, "");
      };

      const codigoEquip = parseField(fields[6]);

      try {
        const existing = await prisma.equipamento.findFirst({
          where: { codigoEquip: codigoEquip || undefined },
        });

        if (existing) {
          await prisma.equipamento.update({
            where: { id: existing.id },
            data: {
              nomeEquip: parseField(fields[1])!,
              precoDiaria: parseField(fields[2])!,
              precoSemanal: parseField(fields[3])!,
              precoQuinzenal: parseField(fields[4])!,
              precoMensal: parseField(fields[5])!,
              quantidadeDisp: parseInt(parseField(fields[7]) || "0"),
              valorPatrimonio: parseField(fields[8]),
            },
          });
        } else {
          await prisma.equipamento.create({
            data: {
              nomeEquip: parseField(fields[1])!,
              precoDiaria: parseField(fields[2])!,
              precoSemanal: parseField(fields[3])!,
              precoQuinzenal: parseField(fields[4])!,
              precoMensal: parseField(fields[5])!,
              codigoEquip: codigoEquip,
              quantidadeDisp: parseInt(parseField(fields[7]) || "0"),
              valorPatrimonio: parseField(fields[8]),
            },
          });
        }
        equipamentosImportados++;
      } catch (error) {
        console.error(`Erro ao importar equipamento:`, error);
      }
    }
  }
  console.log(`✅ ${equipamentosImportados} equipamentos importados\n`);

  // ====================
  // 3. IMPORTAR CONTRATOS
  // ====================
  console.log("📥 Importando Contratos...");
  const contratoMatches = sqlContent.matchAll(
    /INSERT INTO `Contrato`[^;]+VALUES\s*\((.*?)\);/gs,
  );

  let contratosImportados = 0;
  for (const match of contratoMatches) {
    const values = match[1];
    const rows = values.split(/\),\s*\(/);

    for (const row of rows) {
      const cleanRow = row.replace(/^\(|\)$/g, "");
      const fields = cleanRow.match(/(?:[^,']+|'[^']*')+/g);

      if (!fields || fields.length < 16) continue;

      const parseField = (field: string) => {
        const trimmed = field.trim();
        if (trimmed === "NULL") return null;
        return trimmed.replace(/^'|'$/g, "");
      };

      try {
        const clienteId = parseInt(parseField(fields[1])!);
        const contratoNum = parseField(fields[2])!;

        // Verificar se cliente existe
        const cliente = await prisma.cliente.findUnique({
          where: { id: clienteId },
        });

        if (!cliente) {
          console.log(
            `⚠️  Cliente ${clienteId} não encontrado, pulando contrato ${contratoNum}`,
          );
          continue;
        }

        // Verificar se contrato já existe (único por cliente + número)
        const existing = await prisma.contrato.findUnique({
          where: {
            clienteId_contratoNum: {
              clienteId: clienteId,
              contratoNum: contratoNum,
            },
          },
        });

        if (existing) {
          console.log(
            `⚠️  Contrato ${contratoNum} do cliente ${clienteId} já existe, pulando`,
          );
          continue;
        }

        await prisma.contrato.create({
          data: {
            clienteId: clienteId,
            contratoNum: contratoNum,
            dataHoraEmissao: parseDate(parseField(fields[3]))!,
            dataVenc: parseDate(parseField(fields[4]))!,
            obraLocal: parseField(fields[5]),
            contratoPeriodo: parseField(fields[6]) as any,
            entregaLocal: parseField(fields[7]),
            respPedido: parseField(fields[8]),
            valorTotal: parseField(fields[9])!,
            statusAssinatura: (parseField(fields[10]) as any) || "PENDENTE",
            statusContrato: (parseField(fields[11]) as any) || "PENDENTE",
            dataAssinatura: parseDate(parseField(fields[12])),
            assinaturaId: parseField(fields[13])
              ? parseInt(parseField(fields[13])!)
              : null,
            arquivado: parseField(fields[14]) === "1",
            dataArquivamento: parseDate(parseField(fields[15])),
          },
        });
        contratosImportados++;
      } catch (error: any) {
        console.error(`Erro ao importar contrato:`, error.message);
      }
    }
  }
  console.log(`✅ ${contratosImportados} contratos importados\n`);

  // ===============================
  // 4. IMPORTAR EQUIPAMENTO_CONTRATO
  // ===============================
  console.log("📥 Importando Equipamento_Contrato...");
  const equipContratoMatches = sqlContent.matchAll(
    /INSERT INTO `Equipamento_Contrato`[^;]+VALUES\s*\((.*?)\);/gs,
  );

  let equipContratosImportados = 0;
  for (const match of equipContratoMatches) {
    const values = match[1];
    const rows = values.split(/\),\s*\(/);

    for (const row of rows) {
      const cleanRow = row.replace(/^\(|\)$/g, "");
      const fields = cleanRow.match(/(?:[^,']+|'[^']*')+/g);

      if (!fields || fields.length < 7) continue;

      const parseField = (field: string) => {
        const trimmed = field.trim();
        if (trimmed === "NULL") return null;
        return trimmed.replace(/^'|'$/g, "");
      };

      try {
        const contratoId = parseInt(parseField(fields[1])!);
        const equipamentoId = parseInt(parseField(fields[2])!);

        // Verificar se contrato e equipamento existem
        const [contrato, equipamento] = await Promise.all([
          prisma.contrato.findUnique({ where: { id: contratoId } }),
          prisma.equipamento.findUnique({ where: { id: equipamentoId } }),
        ]);

        if (!contrato || !equipamento) {
          continue;
        }

        await prisma.equipamentoContrato.create({
          data: {
            contratoId: contratoId,
            equipamentoId: equipamentoId,
            quantidadeEquip: parseInt(parseField(fields[3])!),
            valorUnitario: parseField(fields[4])!,
            valorTotal: parseField(fields[5])!,
            valorFrete: parseField(fields[6]) || "0",
          },
        });
        equipContratosImportados++;
      } catch (error: any) {
        // Silenciar erros de duplicação
        if (!error.message.includes("Unique constraint")) {
          console.error(
            `Erro ao importar equipamento_contrato:`,
            error.message,
          );
        }
      }
    }
  }
  console.log(
    `✅ ${equipContratosImportados} equipamento_contratos importados\n`,
  );

  console.log("🎉 Importação completa concluída!");
  console.log(
    `📊 Total: ${clientesImportados} clientes, ${equipamentosImportados} equipamentos, ${contratosImportados} contratos, ${equipContratosImportados} equipamento_contratos`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
