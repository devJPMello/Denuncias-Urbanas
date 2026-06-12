-- CreateTable
CREATE TABLE "push_subscription_denuncias" (
    "subscription_id" TEXT NOT NULL,
    "denuncia_id" TEXT NOT NULL,

    CONSTRAINT "push_subscription_denuncias_pkey" PRIMARY KEY ("subscription_id","denuncia_id")
);

-- AddForeignKey
ALTER TABLE "push_subscription_denuncias" ADD CONSTRAINT "push_subscription_denuncias_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "push_subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_subscription_denuncias" ADD CONSTRAINT "push_subscription_denuncias_denuncia_id_fkey" FOREIGN KEY ("denuncia_id") REFERENCES "denuncias"("id") ON DELETE CASCADE ON UPDATE CASCADE;
