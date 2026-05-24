-- CreateEnum
CREATE TYPE "Role" AS ENUM ('cidadao', 'admin');

-- CreateEnum
CREATE TYPE "StatusDenuncia" AS ENUM ('aberto', 'analise', 'resolvido', 'cancelado');

-- CreateEnum
CREATE TYPE "CategoriaDenuncia" AS ENUM ('buraco', 'iluminacao', 'lixo', 'calcada', 'vandalismo', 'outros');

-- CreateTable
CREATE TABLE "usuarios" (
    "id"            TEXT NOT NULL,
    "clerk_id"      TEXT NOT NULL,
    "nome"          TEXT NOT NULL,
    "email"         TEXT NOT NULL,
    "role"          "Role" NOT NULL DEFAULT 'cidadao',
    "criado_em"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "denuncias" (
    "id"            TEXT NOT NULL,
    "titulo"        TEXT NOT NULL,
    "descricao"     TEXT NOT NULL,
    "categoria"     "CategoriaDenuncia" NOT NULL,
    "endereco"      TEXT NOT NULL,
    "imagem_url"    TEXT,
    "status"        "StatusDenuncia" NOT NULL DEFAULT 'aberto',
    "lat"           DOUBLE PRECISION,
    "lng"           DOUBLE PRECISION,
    "autor_id"      TEXT NOT NULL,
    "criado_em"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "denuncias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_clerk_id_key" ON "usuarios"("clerk_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- AddForeignKey
ALTER TABLE "denuncias"
    ADD CONSTRAINT "denuncias_autor_id_fkey"
    FOREIGN KEY ("autor_id") REFERENCES "usuarios"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
