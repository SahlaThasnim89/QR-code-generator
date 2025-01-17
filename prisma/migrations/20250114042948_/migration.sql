/*
  Warnings:

  - Added the required column `userId` to the `QRCode` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "QRCode" ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Settings" (
    "id" SERIAL NOT NULL,
    "expiryTime" INTEGER NOT NULL DEFAULT 30,
    "voucherWidth" INTEGER NOT NULL DEFAULT 50,
    "voucherHeight" INTEGER NOT NULL DEFAULT 30,
    "titleFontSize" INTEGER NOT NULL DEFAULT 12,
    "textFontSize" INTEGER NOT NULL DEFAULT 10,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Settings_userId_key" ON "Settings"("userId");

-- AddForeignKey
ALTER TABLE "QRCode" ADD CONSTRAINT "QRCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settings" ADD CONSTRAINT "Settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
