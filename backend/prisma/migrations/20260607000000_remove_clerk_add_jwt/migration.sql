-- RemoveClerkAddJWT migration
-- 1. Remover clerkId dos usuários e adicionar senha + primeiroLogin
ALTER TABLE "usuarios" DROP CONSTRAINT IF EXISTS "usuarios_clerk_id_key";
ALTER TABLE "usuarios" DROP COLUMN IF EXISTS "clerk_id";

ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "senha" TEXT NOT NULL DEFAULT '';
ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "primeiro_login" BOOLEAN NOT NULL DEFAULT true;

-- Remover default temporário (senha vazia não é válida em produção, seed criará o admin)
ALTER TABLE "usuarios" ALTER COLUMN "senha" DROP DEFAULT;

-- 2. Tornar autorId nullable em denuncias
ALTER TABLE "denuncias" ALTER COLUMN "autor_id" DROP NOT NULL;
ALTER TABLE "denuncias" DROP CONSTRAINT IF EXISTS "denuncias_autor_id_fkey";
ALTER TABLE "denuncias" ADD CONSTRAINT "denuncias_autor_id_fkey"
  FOREIGN KEY ("autor_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 3. Tornar usuarioId nullable em push_subscriptions
ALTER TABLE "push_subscriptions" ALTER COLUMN "usuario_id" DROP NOT NULL;
ALTER TABLE "push_subscriptions" DROP CONSTRAINT IF EXISTS "push_subscriptions_usuario_id_fkey";
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_usuario_id_fkey"
  FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 4. Apagar usuários antigos do Clerk (sem senha válida)
DELETE FROM "push_subscriptions" WHERE "usuario_id" IN (SELECT "id" FROM "usuarios" WHERE "senha" = '');
DELETE FROM "denuncias" WHERE "autor_id" IN (SELECT "id" FROM "usuarios" WHERE "senha" = '');
UPDATE "denuncias" SET "autor_id" = NULL WHERE "autor_id" IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM "usuarios" WHERE "id" = "denuncias"."autor_id");
DELETE FROM "usuarios" WHERE "senha" = '';
