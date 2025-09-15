/*
  Warnings:

  - You are about to drop the column `des` on the `Restaurant` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `Restaurant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `password` to the `Restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `Restaurant` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."DayOfWeek" AS ENUM ('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');

-- AlterTable
ALTER TABLE "public"."Restaurant" DROP COLUMN "des",
ADD COLUMN     "branch" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "username" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."Table" (
    "id" SERIAL NOT NULL,
    "restaurantId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StoreHour" (
    "id" SERIAL NOT NULL,
    "restaurantId" INTEGER NOT NULL,
    "dayOfWeek" "public"."DayOfWeek" NOT NULL,
    "openTime" TIME NOT NULL,
    "closeTime" TIME NOT NULL,
    "slotDuration" INTEGER NOT NULL,

    CONSTRAINT "StoreHour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StoreException" (
    "id" SERIAL NOT NULL,
    "restaurantId" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "openTime" TIME,
    "closeTime" TIME,
    "isClosed" BOOLEAN NOT NULL,
    "description" TEXT,

    CONSTRAINT "StoreException_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TableAvailability" (
    "id" SERIAL NOT NULL,
    "tableId" INTEGER NOT NULL,
    "dayOfWeek" "public"."DayOfWeek" NOT NULL,
    "openTime" TIME NOT NULL,
    "closeTime" TIME NOT NULL,

    CONSTRAINT "TableAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TableException" (
    "id" SERIAL NOT NULL,
    "tableId" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "exceptTimeFrom" TIME,
    "exceptTimeTo" TIME,
    "isClosed" BOOLEAN NOT NULL,
    "description" TEXT,

    CONSTRAINT "TableException_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Reservation" (
    "id" SERIAL NOT NULL,
    "bookingRef" TEXT NOT NULL,
    "tableId" INTEGER NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "bookingDate" TIMESTAMP(3) NOT NULL,
    "startTime" TIME NOT NULL,
    "endTime" TIME NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_bookingRef_key" ON "public"."Reservation"("bookingRef");

-- CreateIndex
CREATE UNIQUE INDEX "Restaurant_username_key" ON "public"."Restaurant"("username");

-- AddForeignKey
ALTER TABLE "public"."Table" ADD CONSTRAINT "Table_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "public"."Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StoreHour" ADD CONSTRAINT "StoreHour_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "public"."Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StoreException" ADD CONSTRAINT "StoreException_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "public"."Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TableAvailability" ADD CONSTRAINT "TableAvailability_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "public"."Table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TableException" ADD CONSTRAINT "TableException_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "public"."Table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reservation" ADD CONSTRAINT "Reservation_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "public"."Table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
