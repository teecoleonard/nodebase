-- CreateEnum
CREATE TYPE "StatusAssinatura" AS ENUM ('PENDENTE', 'ASSINADO');

-- CreateEnum
CREATE TYPE "StatusContrato" AS ENUM ('PENDENTE', 'ASSINADO', 'EM_ANDAMENTO', 'FINALIZADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "PeriodoContrato" AS ENUM ('DIARIA', 'SEMANAL', 'QUINZENAL', 'MENSAL');

-- CreateEnum
CREATE TYPE "StatusItemDevolucao" AS ENUM ('PENDENTE', 'PARCIAL', 'DEVOLVIDO');

-- CreateEnum
CREATE TYPE "StatusFatura" AS ENUM ('PENDENTE', 'PAGA', 'VENCIDA', 'CANCELADA');

-- CreateTable
CREATE TABLE "cliente" (
    "id" SERIAL NOT NULL,
    "contratante" VARCHAR(100) NOT NULL,
    "cpf_cnpj" VARCHAR(20) NOT NULL,
    "rg_ie" VARCHAR(20),
    "endereco" VARCHAR(200),
    "bairro" VARCHAR(100),
    "cep" VARCHAR(10),
    "cidade" VARCHAR(100),
    "estado" VARCHAR(2),
    "telefone" VARCHAR(20),
    "email" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipamento" (
    "id" SERIAL NOT NULL,
    "nomeEquip" VARCHAR(100) NOT NULL,
    "precoDiaria" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "precoSemanal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "precoQuinzenal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "precoMensal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "codigoEquip" VARCHAR(50),
    "quantidadeDisp" INTEGER NOT NULL DEFAULT 0,
    "valorPatrimonio" DECIMAL(12,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contrato" (
    "id" SERIAL NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "contrato_num" VARCHAR(20) NOT NULL,
    "data_hora_emissao" TIMESTAMP(3) NOT NULL,
    "data_venc" DATE NOT NULL,
    "obra_local" VARCHAR(200),
    "contrato_periodo" "PeriodoContrato" NOT NULL,
    "entrega_local" VARCHAR(200),
    "resp_pedido" VARCHAR(100),
    "valor_total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status_assinatura" "StatusAssinatura" NOT NULL DEFAULT 'PENDENTE',
    "status_contrato" "StatusContrato" NOT NULL DEFAULT 'PENDENTE',
    "data_assinatura" TIMESTAMP(3),
    "assinatura_id" INTEGER,
    "arquivado" BOOLEAN NOT NULL DEFAULT false,
    "data_arquivamento" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contrato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipamento_contrato" (
    "id" SERIAL NOT NULL,
    "contrato_id" INTEGER NOT NULL,
    "equipamento_id" INTEGER NOT NULL,
    "quantidade_equip" INTEGER NOT NULL DEFAULT 1,
    "valor_unitario" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "valor_total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "valor_frete" DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT "equipamento_contrato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assinatura" (
    "id" SERIAL NOT NULL,
    "contrato_id" INTEGER,
    "nome_arquivo" VARCHAR(255) NOT NULL,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assinatura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devolucao" (
    "id" SERIAL NOT NULL,
    "contrato_id" INTEGER NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "equipamento_id" INTEGER NOT NULL,
    "dev_num" VARCHAR(255) NOT NULL,
    "data_devolucao_prevista" DATE NOT NULL,
    "data_devolucao_efetiva" TIMESTAMP(3),
    "quantidade_contratada" INTEGER NOT NULL,
    "quantidade_devolvida" INTEGER NOT NULL DEFAULT 0,
    "status_item_devolucao" "StatusItemDevolucao" NOT NULL DEFAULT 'PENDENTE',
    "observacao_item_devolucao" TEXT,
    "status_assinatura" "StatusAssinatura" NOT NULL DEFAULT 'PENDENTE',
    "data_assinatura" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "devolucao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assinatura_devolucao" (
    "id" SERIAL NOT NULL,
    "devolucao_id" INTEGER NOT NULL,
    "contrato_id" INTEGER NOT NULL,
    "nome_arquivo" VARCHAR(255) NOT NULL,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assinatura_devolucao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fatura" (
    "id" SERIAL NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "numero_fatura" VARCHAR(50) NOT NULL,
    "data_emissao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_vencimento" DATE NOT NULL,
    "valor_total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "valor_pago" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" "StatusFatura" NOT NULL DEFAULT 'PENDENTE',
    "data_pagamento" TIMESTAMP(3),
    "observacoes" TEXT,
    "mes_referencia" INTEGER NOT NULL,
    "ano_referencia" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fatura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fatura_contrato" (
    "id" SERIAL NOT NULL,
    "fatura_id" INTEGER NOT NULL,
    "contrato_id" INTEGER NOT NULL,
    "valor_contrato" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fatura_contrato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assinatura_fatura" (
    "id" SERIAL NOT NULL,
    "fatura_id" INTEGER NOT NULL,
    "nome_arquivo" VARCHAR(255) NOT NULL,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assinatura_fatura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "token_assinatura" (
    "id" SERIAL NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "contrato_id" INTEGER,
    "devolucao_id" INTEGER,
    "fatura_id" INTEGER,
    "usado" BOOLEAN NOT NULL DEFAULT false,
    "data_expiracao" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "token_assinatura_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cliente_cpf_cnpj_key" ON "cliente"("cpf_cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "contrato_contrato_num_key" ON "contrato"("contrato_num");

-- CreateIndex
CREATE INDEX "contrato_cliente_id_idx" ON "contrato"("cliente_id");

-- CreateIndex
CREATE INDEX "contrato_status_contrato_idx" ON "contrato"("status_contrato");

-- CreateIndex
CREATE INDEX "contrato_arquivado_idx" ON "contrato"("arquivado");

-- CreateIndex
CREATE INDEX "equipamento_contrato_contrato_id_idx" ON "equipamento_contrato"("contrato_id");

-- CreateIndex
CREATE INDEX "equipamento_contrato_equipamento_id_idx" ON "equipamento_contrato"("equipamento_id");

-- CreateIndex
CREATE INDEX "devolucao_contrato_id_idx" ON "devolucao"("contrato_id");

-- CreateIndex
CREATE INDEX "devolucao_cliente_id_idx" ON "devolucao"("cliente_id");

-- CreateIndex
CREATE INDEX "devolucao_status_item_devolucao_idx" ON "devolucao"("status_item_devolucao");

-- CreateIndex
CREATE INDEX "assinatura_devolucao_devolucao_id_idx" ON "assinatura_devolucao"("devolucao_id");

-- CreateIndex
CREATE UNIQUE INDEX "fatura_numero_fatura_key" ON "fatura"("numero_fatura");

-- CreateIndex
CREATE INDEX "fatura_cliente_id_idx" ON "fatura"("cliente_id");

-- CreateIndex
CREATE INDEX "fatura_status_idx" ON "fatura"("status");

-- CreateIndex
CREATE INDEX "fatura_mes_referencia_ano_referencia_idx" ON "fatura"("mes_referencia", "ano_referencia");

-- CreateIndex
CREATE INDEX "fatura_contrato_fatura_id_idx" ON "fatura_contrato"("fatura_id");

-- CreateIndex
CREATE INDEX "fatura_contrato_contrato_id_idx" ON "fatura_contrato"("contrato_id");

-- CreateIndex
CREATE UNIQUE INDEX "fatura_contrato_fatura_id_contrato_id_key" ON "fatura_contrato"("fatura_id", "contrato_id");

-- CreateIndex
CREATE INDEX "assinatura_fatura_fatura_id_idx" ON "assinatura_fatura"("fatura_id");

-- CreateIndex
CREATE UNIQUE INDEX "token_assinatura_token_key" ON "token_assinatura"("token");

-- CreateIndex
CREATE INDEX "token_assinatura_token_idx" ON "token_assinatura"("token");

-- AddForeignKey
ALTER TABLE "contrato" ADD CONSTRAINT "contrato_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrato" ADD CONSTRAINT "contrato_assinatura_id_fkey" FOREIGN KEY ("assinatura_id") REFERENCES "assinatura"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipamento_contrato" ADD CONSTRAINT "equipamento_contrato_contrato_id_fkey" FOREIGN KEY ("contrato_id") REFERENCES "contrato"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipamento_contrato" ADD CONSTRAINT "equipamento_contrato_equipamento_id_fkey" FOREIGN KEY ("equipamento_id") REFERENCES "equipamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devolucao" ADD CONSTRAINT "devolucao_contrato_id_fkey" FOREIGN KEY ("contrato_id") REFERENCES "contrato"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devolucao" ADD CONSTRAINT "devolucao_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devolucao" ADD CONSTRAINT "devolucao_equipamento_id_fkey" FOREIGN KEY ("equipamento_id") REFERENCES "equipamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assinatura_devolucao" ADD CONSTRAINT "assinatura_devolucao_devolucao_id_fkey" FOREIGN KEY ("devolucao_id") REFERENCES "devolucao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assinatura_devolucao" ADD CONSTRAINT "assinatura_devolucao_contrato_id_fkey" FOREIGN KEY ("contrato_id") REFERENCES "contrato"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fatura" ADD CONSTRAINT "fatura_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fatura_contrato" ADD CONSTRAINT "fatura_contrato_fatura_id_fkey" FOREIGN KEY ("fatura_id") REFERENCES "fatura"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fatura_contrato" ADD CONSTRAINT "fatura_contrato_contrato_id_fkey" FOREIGN KEY ("contrato_id") REFERENCES "contrato"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assinatura_fatura" ADD CONSTRAINT "assinatura_fatura_fatura_id_fkey" FOREIGN KEY ("fatura_id") REFERENCES "fatura"("id") ON DELETE CASCADE ON UPDATE CASCADE;
