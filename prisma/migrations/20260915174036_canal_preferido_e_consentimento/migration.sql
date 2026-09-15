/*
  Warnings:

  - Added the required column `consentimentoEm` to the `leads` table without a default value. This is not possible if the table is not empty.
  - Added the required column `consentimentoVersao` to the `leads` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CanalContato" AS ENUM ('WhatsApp', 'Telefone', 'Email');

-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "canalPreferido" "CanalContato" NOT NULL DEFAULT 'WhatsApp',
ADD COLUMN     "consentimentoEm" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "consentimentoVersao" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "leads_status_idx" ON "leads"("status");

-- CreateIndex
CREATE INDEX "leads_unidade_idx" ON "leads"("unidade");

-- CreateIndex
CREATE INDEX "leads_createdAt_idx" ON "leads"("createdAt");
