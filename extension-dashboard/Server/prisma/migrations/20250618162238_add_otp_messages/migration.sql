/*
  Warnings:

  - You are about to drop the column `timestamp` on the `OtpMessages` table. All the data in the column will be lost.
  - Added the required column `parsedTimestamp` to the `OtpMessages` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "OtpMessages_timestamp_idx";

-- AlterTable
ALTER TABLE "OtpMessages" DROP COLUMN "timestamp",
ADD COLUMN     "parsedTimestamp" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "OtpMessages_parsedTimestamp_idx" ON "OtpMessages"("parsedTimestamp");
