/*
  Warnings:

  - The values [Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday] on the enum `DayOfWeek` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."DayOfWeek_new" AS ENUM ('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday');
ALTER TABLE "public"."StoreHour" ALTER COLUMN "dayOfWeek" TYPE "public"."DayOfWeek_new" USING ("dayOfWeek"::text::"public"."DayOfWeek_new");
ALTER TABLE "public"."TableAvailability" ALTER COLUMN "dayOfWeek" TYPE "public"."DayOfWeek_new" USING ("dayOfWeek"::text::"public"."DayOfWeek_new");
ALTER TYPE "public"."DayOfWeek" RENAME TO "DayOfWeek_old";
ALTER TYPE "public"."DayOfWeek_new" RENAME TO "DayOfWeek";
DROP TYPE "public"."DayOfWeek_old";
COMMIT;
