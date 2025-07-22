/*
  Warnings:

  - You are about to drop the column `countries` on the `Number_Details` table. All the data in the column will be lost.
  - You are about to drop the column `country_code` on the `Number_Details` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Number_Details" DROP COLUMN "countries",
DROP COLUMN "country_code";
