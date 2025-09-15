/*
  Warnings:

  - A unique constraint covering the columns `[tableId,dayOfWeek]` on the table `TableAvailability` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TableAvailability_tableId_dayOfWeek_key" ON "public"."TableAvailability"("tableId", "dayOfWeek");
