/*
  Warnings:

  - A unique constraint covering the columns `[number]` on the table `Countries_Number` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `expiry_date` to the `Countries_Number` table without a default value. This is not possible if the table is not empty.
  - Added the required column `extension_date` to the `Countries_Number` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Countries_Number" ADD COLUMN     "expiry_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "extension_date" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Countries_Number_number_key" ON "Countries_Number"("number");
