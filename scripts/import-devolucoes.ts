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

// Mapeamento de status do SQL para o Prisma
const mapStatus = (status: string): "PENDENTE" | "PARCIAL" | "DEVOLVIDO" => {
  const statusLower = status.toLowerCase();
  if (statusLower === "devolvido") return "DEVOLVIDO";
  if (statusLower === "parcial") return "PARCIAL";
  return "PENDENTE";
};

const mapStatusAssinatura = (status: string): "PENDENTE" | "ASSINADO" => {
  return status === "ASSINADO" ? "ASSINADO" : "PENDENTE";
};

async function main() {
  console.log("🚀 Iniciando importação de devoluções...\n");

  const sqlFile = path.join("C:\\Users\\leona\\Downloads\\localhost (1).sql");

  if (!fs.existsSync(sqlFile)) {
    console.error("❌ Arquivo SQL não encontrado!");
    return;
  }

  const sqlContent = fs.readFileSync(sqlFile, "utf-8");

  // ====================
  // 1. IMPORTAR DEVOLUÇÕES
  // ====================
  console.log("📥 Importando Devoluções...");
  const devolucaoMatches = sqlContent.matchAll(
    /INSERT INTO `Devolucoes`[^;]+VALUES\s*\((.*?)\);/gs,
  );

  let importadas = 0;
  let puladas = 0;
  let erros = 0;

  for (const match of devolucaoMatches) {
    const values = match[1];
    const rows = values.split(/\),\s*\(/);

    for (const row of rows) {
      const cleanRow = row.replace(/^\(|\)$/g, "");
      const fields = cleanRow.match(/(?:[^,']+|'[^']*')+/g);

      if (!fields || fields.length < 15) continue;

      const parseField = (field: string) => {
        const trimmed = field.trim();
        if (trimmed === "NULL") return null;
        return trimmed.replace(/^'|'$/g, "");
      };

      try {
        const id = parseInt(parseField(fields[0])!);
        const contratoId = parseInt(parseField(fields[1])!);
        const clienteId = parseInt(parseField(fields[2])!);
        const equipamentoId = parseInt(parseField(fields[3])!);

        // Verificar se contrato, cliente e equipamento existem
        const [contrato, cliente, equipamento] = await Promise.all([
          prisma.contrato.findUnique({ where: { id: contratoId } }),
          prisma.cliente.findUnique({ where: { id: clienteId } }),
          prisma.equipamento.findUnique({ where: { id: equipamentoId } }),
        ]);

        if (!contrato || !cliente || !equipamento) {
          puladas++;
          continue;
        }

        // Verificar se a devolução já existe
        const devolucaoExistente = await prisma.devolucao.findUnique({
          where: { id: id },
        });

        if (devolucaoExistente) {
          puladas++;
          continue;
        }

        // Criar a devolução
        await prisma.devolucao.create({
          data: {
            id: id,
            contratoId: contratoId,
            clienteId: clienteId,
            equipamentoId: equipamentoId,
            devNum: parseField(fields[4])!,
            dataDevolucaoPrevista: parseDate(parseField(fields[5]))!,
            dataDevolucaoEfetiva: parseDate(parseField(fields[6])),
            quantidadeContratada: parseInt(parseField(fields[7])!),
            quantidadeDevolvida: parseInt(parseField(fields[8]) || "0"),
            statusItemDevolucao: mapStatus(parseField(fields[9])!),
            observacaoItemDevolucao: parseField(fields[10]),
            statusAssinatura: mapStatusAssinatura(parseField(fields[11])!),
            dataAssinatura: parseDate(parseField(fields[12])),
            createdAt: parseDate(parseField(fields[13]))!,
            updatedAt: parseDate(parseField(fields[14]))!,
          },
        });

        importadas++;
        if (importadas % 10 === 0) {
          console.log(`✅ ${importadas} devoluções importadas...`);
        }
      } catch (error: any) {
        console.error(`❌ Erro ao importar devolução:`, error.message);
        erros++;
      }
    }
  }
  console.log(`✅ ${importadas} devoluções importadas\n`);

  // ==================================
  // 2. IMPORTAR ASSINATURAS DE DEVOLUÇÃO
  // ==================================
  console.log("📥 Importando Assinaturas de Devolução...");
  const assinaturaDevolucaoMatches = sqlContent.matchAll(
    /INSERT INTO `AssinaturasDevolucao`[^;]+VALUES\s*\((.*?)\);/gs,
  );

  let assinaturasImportadas = 0;

  for (const match of assinaturaDevolucaoMatches) {
    const values = match[1];
    const rows = values.split(/\),\s*\(/);

    for (const row of rows) {
      const cleanRow = row.replace(/^\(|\)$/g, "");
      const fields = cleanRow.match(/(?:[^,']+|'[^']*')+/g);

      if (!fields || fields.length < 5) continue;

      const parseField = (field: string) => {
        const trimmed = field.trim();
        if (trimmed === "NULL") return null;
        return trimmed.replace(/^'|'$/g, "");
      };

      try {
        const devolucaoId = parseInt(parseField(fields[1])!);

        // Verificar se a devolução existe e obter o contratoId
        const devolucao = await prisma.devolucao.findUnique({
          where: { id: devolucaoId },
          select: { id: true, contratoId: true },
        });

        if (!devolucao) {
          continue;
        }

        // Verificar se já existe uma assinatura para esta devolução
        const assinaturaExistente = await prisma.assinaturaDevolucao.findFirst({
          where: { devolucaoId: devolucaoId },
        });

        if (assinaturaExistente) {
          continue;
        }

        // Criar a assinatura conectando devolução e contrato
        await prisma.assinaturaDevolucao.create({
          data: {
            devolucao: {
              connect: { id: devolucao.id },
            },
            contrato: {
              connect: { id: devolucao.contratoId },
            },
            nomeArquivo: parseField(fields[2])!,
            dataCriacao: parseDate(parseField(fields[3])) || new Date(),
            createdAt: parseDate(parseField(fields[4])) || new Date(),
            updatedAt: parseDate(parseField(fields[5])) || new Date(),
          },
        });

        assinaturasImportadas++;
      } catch (error: any) {
        // Silenciar erros de duplicação
        if (!error.message.includes("Unique constraint")) {
          console.error(
            `❌ Erro ao importar assinatura devolução:`,
            error.message,
          );
        }
      }
    }
  }
  console.log(
    `✅ ${assinaturasImportadas} assinaturas de devolução importadas\n`,
  );

  console.log("=".repeat(60));
  console.log("📊 Resumo da Importação:");
  console.log("=".repeat(60));
  console.log(`✅ Devoluções importadas: ${importadas}`);
  console.log(`✅ Assinaturas importadas: ${assinaturasImportadas}`);
  console.log(`⚠️  Devoluções puladas: ${puladas}`);
  console.log(`❌ Erros: ${erros}`);
  console.log("=".repeat(60));
  console.log("\n🎉 Importação de devoluções concluída!");
}

main()
  .catch((e) => {
    console.error("Erro fatal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
