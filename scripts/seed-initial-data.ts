import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed com dados do sistema ALG...\n");

  // Criar alguns clientes baseados no SQL
  const clientes = [
    {
      contratante: "3MJ PARTICIPAÇÕES LTDA",
      cpfCnpj: "26.262.219/0001-52",
      telefone: null,
      email: null,
      endereco: "Avenida Getúlio Vargas",
      bairro: "Centro",
      cep: "38400-299",
      cidade: "Uberlândia",
      estado: "MG",
    },
    {
      contratante: "ADRIANO FERNANDES FELIX",
      cpfCnpj: "055.106.586-90",
      telefone: "3499674-8089",
      email: null,
      endereco: "RUA ANTÔNIO LUIS DE MENDOÇA Nº256",
      bairro: "JD IPANEMA",
      cep: null,
      cidade: "UBERLÂNDIA",
      estado: "MG",
    },
    {
      contratante: "CENTRO DE TREINAMENTO BASE SPORTING CLUBE LTDA",
      cpfCnpj: "13.631.663/0001-56",
      telefone: "3499977-3949",
      email: null,
      endereco: "Avenida Zulma Costa Abdala",
      bairro: "Mansões Aeroporto",
      cep: "38406-406",
      cidade: "Uberlândia",
      estado: "MG",
    },
  ];

  for (const cliente of clientes) {
    await prisma.cliente.upsert({
      where: { cpfCnpj: cliente.cpfCnpj },
      update: {},
      create: cliente,
    });
  }

  console.log(`✅ ${clientes.length} clientes criados`);

  // Criar alguns equipamentos baseados no SQL
  const equipamentos = [
    {
      nomeEquip: "Betoneira",
      codigoEquip: "BET-001",
      precoDiaria: 150.0,
      precoSemanal: 900.0,
      precoQuinzenal: 1650.0,
      precoMensal: 3000.0,
      quantidadeDisp: 5,
      valorPatrimonio: 8000.0,
    },
    {
      nomeEquip: "Andaime",
      codigoEquip: "AND-001",
      precoDiaria: 80.0,
      precoSemanal: 480.0,
      precoQuinzenal: 880.0,
      precoMensal: 1600.0,
      quantidadeDisp: 10,
      valorPatrimonio: 5000.0,
    },
    {
      nomeEquip: "Compactador",
      codigoEquip: "COMP-001",
      precoDiaria: 200.0,
      precoSemanal: 1200.0,
      precoQuinzenal: 2200.0,
      precoMensal: 4000.0,
      quantidadeDisp: 3,
      valorPatrimonio: 12000.0,
    },
  ];

  for (const equip of equipamentos) {
    await prisma.equipamento
      .create({
        data: equip,
      })
      .catch(() => {}); // Ignora se já existir
  }

  console.log(`✅ ${equipamentos.length} equipamentos criados`);

  console.log("\n🎉 Seed concluído!\n");
  console.log(
    "📝 Para fazer login, crie um usuário em: http://localhost:3000/signup",
  );
}

main()
  .catch((e) => {
    console.error("❌ Erro:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
