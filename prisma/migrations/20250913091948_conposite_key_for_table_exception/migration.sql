/*
  Warnings:

  - A unique constraint covering the columns `[id,tableId]` on the table `TableException` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TableException_id_tableId_key" ON "public"."TableException"("id", "tableId");
