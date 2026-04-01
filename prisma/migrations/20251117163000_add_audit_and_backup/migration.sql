-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'VIEW', 'EXPORT', 'BACKUP', 'RESTORE', 'LOGIN', 'LOGOUT');

-- CreateEnum
CREATE TYPE "AuditEntity" AS ENUM ('CLIENTE', 'EQUIPAMENTO', 'CONTRATO', 'DEVOLUCAO', 'FATURA', 'USER', 'SYSTEM');

-- CreateTable
CREATE TABLE "audit_log" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT,
    "user_email" VARCHAR(255),
    "action" "AuditAction" NOT NULL,
    "entity" "AuditEntity" NOT NULL,
    "entity_id" VARCHAR(100),
    "description" TEXT NOT NULL,
    "old_value" TEXT,
    "new_value" TEXT,
    "ip_address" VARCHAR(45),
    "user_agent" VARCHAR(500),
    "metadata" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backup" (
    "id" SERIAL NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_path" VARCHAR(500),
    "file_size" BIGINT,
    "backup_type" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "user_id" TEXT,
    "user_email" VARCHAR(255),
    "status" VARCHAR(50) NOT NULL DEFAULT 'SUCCESS',
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "backup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_log_user_id_idx" ON "audit_log"("user_id");

-- CreateIndex
CREATE INDEX "audit_log_entity_entity_id_idx" ON "audit_log"("entity", "entity_id");

-- CreateIndex
CREATE INDEX "audit_log_action_idx" ON "audit_log"("action");

-- CreateIndex
CREATE INDEX "audit_log_created_at_idx" ON "audit_log"("created_at");

-- CreateIndex
CREATE INDEX "backup_user_id_idx" ON "backup"("user_id");

-- CreateIndex
CREATE INDEX "backup_backup_type_idx" ON "backup"("backup_type");

-- CreateIndex
CREATE INDEX "backup_status_idx" ON "backup"("status");

-- CreateIndex
CREATE INDEX "backup_created_at_idx" ON "backup"("created_at");

