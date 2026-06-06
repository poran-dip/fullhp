/*
  Warnings:

  - The values [Driver] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `driver_id` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `driver_id` on the `ratings` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('Patient', 'Doctor', 'Admin');
ALTER TABLE "public"."users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'Patient';
COMMIT;

-- DropIndex
DROP INDEX "appointments_driver_id_idx";

-- DropIndex
DROP INDEX "ratings_driver_id_idx";

-- DropIndex
DROP INDEX "ratings_patient_id_driver_id_key";

-- AlterTable
ALTER TABLE "appointments" DROP COLUMN "driver_id";

-- AlterTable
ALTER TABLE "ratings" DROP COLUMN "driver_id";

-- DropEnum
DROP TYPE "DriverStatus";
