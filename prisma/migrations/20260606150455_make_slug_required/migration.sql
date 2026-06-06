/*
  Warnings:

  - Made the column `slug` on table `doctors` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "doctors" ALTER COLUMN "slug" SET NOT NULL;
