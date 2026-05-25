-- Armazena foto da denúncia no PostgreSQL (BYTEA)
ALTER TABLE "denuncias" ADD COLUMN IF NOT EXISTS "imagem_bytes" BYTEA;
ALTER TABLE "denuncias" ADD COLUMN IF NOT EXISTS "imagem_mime" TEXT;
