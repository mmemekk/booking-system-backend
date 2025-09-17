-- DropForeignKey
ALTER TABLE "public"."StoreException" DROP CONSTRAINT "StoreException_restaurantId_fkey";

-- DropForeignKey
ALTER TABLE "public"."StoreHour" DROP CONSTRAINT "StoreHour_restaurantId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Table" DROP CONSTRAINT "Table_restaurantId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TableAvailability" DROP CONSTRAINT "TableAvailability_tableId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TableException" DROP CONSTRAINT "TableException_tableId_fkey";

-- AddForeignKey
ALTER TABLE "public"."Table" ADD CONSTRAINT "Table_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "public"."Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StoreHour" ADD CONSTRAINT "StoreHour_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "public"."Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StoreException" ADD CONSTRAINT "StoreException_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "public"."Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TableAvailability" ADD CONSTRAINT "TableAvailability_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "public"."Table"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TableException" ADD CONSTRAINT "TableException_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "public"."Table"("id") ON DELETE CASCADE ON UPDATE CASCADE;
