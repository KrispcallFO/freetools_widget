/*
  Warnings:

  - The `parsedTimestamp` column on the `OtpMessages` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "OtpMessages" DROP COLUMN "parsedTimestamp",
ADD COLUMN     "parsedTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "OtpMessages_parsedTimestamp_idx" ON "OtpMessages"("parsedTimestamp");
