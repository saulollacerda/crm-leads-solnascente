-- CreateEnum
CREATE TYPE "Unidade" AS ENUM ('Teresina', 'Timon');

-- CreateEnum
CREATE TYPE "StatusLead" AS ENUM ('Novo', 'EmContato', 'Convertido', 'Perdido');

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "modeloInteresse" TEXT NOT NULL,
    "unidade" "Unidade" NOT NULL,
    "status" "StatusLead" NOT NULL DEFAULT 'Novo',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);
