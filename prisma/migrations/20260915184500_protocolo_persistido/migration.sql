-- Protocolo deixa de ser derivado do id e passa a ser coluna própria.
-- A sequência garante unicidade sem depender da aplicação coordenar nada.
CREATE SEQUENCE "protocolo_seq";

-- O default é volátil, então o Postgres avalia linha a linha: os leads que já
-- existem recebem cada um o seu número, sem backfill manual.
ALTER TABLE "leads"
  ADD COLUMN "protocolo" TEXT NOT NULL
  DEFAULT ('SN-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('protocolo_seq')::text, 4, '0'));

CREATE UNIQUE INDEX "leads_protocolo_key" ON "leads"("protocolo");
