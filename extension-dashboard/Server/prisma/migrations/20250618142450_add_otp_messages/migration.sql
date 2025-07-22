-- CreateTable
CREATE TABLE "OtpMessages" (
    "id" SERIAL NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "code" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpMessages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OtpMessages_phoneNumber_idx" ON "OtpMessages"("phoneNumber");

-- CreateIndex
CREATE INDEX "OtpMessages_timestamp_idx" ON "OtpMessages"("timestamp");
