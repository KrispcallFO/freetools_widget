/*
  Warnings:

  - Added the required column `messages` to the `Number_Details` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Number_Details" ADD COLUMN     "messages" TEXT NOT NULL;
