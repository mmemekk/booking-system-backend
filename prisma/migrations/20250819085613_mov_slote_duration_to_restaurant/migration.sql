/*
  Warnings:

  - You are about to drop the column `slotDuration` on the `StoreHour` table. All the data in the column will be lost.
  - Added the required column `slotDuration` to the `Restaurant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Restaurant" ADD COLUMN     "slotDuration" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."StoreHour" DROP COLUMN "slotDuration";
