/*
  Warnings:

  - A unique constraint covering the columns `[restaurantId,dayOfWeek]` on the table `StoreHour` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "StoreHour_restaurantId_dayOfWeek_key" ON "public"."StoreHour"("restaurantId", "dayOfWeek");
