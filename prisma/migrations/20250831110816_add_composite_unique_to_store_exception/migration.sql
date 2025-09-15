/*
  Warnings:

  - A unique constraint covering the columns `[id,restaurantId]` on the table `StoreException` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "StoreException_id_restaurantId_key" ON "public"."StoreException"("id", "restaurantId");
