-- CreateTable
CREATE TABLE "ExtensionInstall" (
    "id" TEXT NOT NULL,
    "installToken" TEXT NOT NULL,
    "installId" TEXT NOT NULL,
    "userEmail" TEXT,
    "profileId" TEXT,
    "quotaRemaining" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExtensionInstall_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExtensionInstall_installToken_key" ON "ExtensionInstall"("installToken");

-- CreateIndex
CREATE UNIQUE INDEX "ExtensionInstall_installId_key" ON "ExtensionInstall"("installId");
