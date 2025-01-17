/*
  Warnings:

  - You are about to drop the column `normalFontSize` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `qrCodeSize` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `subTextFontSize` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `titleFontSize` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `voucherHeight` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `voucherWidth` on the `Settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Settings" DROP COLUMN "normalFontSize",
DROP COLUMN "qrCodeSize",
DROP COLUMN "subTextFontSize",
DROP COLUMN "titleFontSize",
DROP COLUMN "voucherHeight",
DROP COLUMN "voucherWidth",
ADD COLUMN     "expiryTime" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "fontSize" TEXT NOT NULL DEFAULT 'Title: 18–22 points',
ADD COLUMN     "qrCodeSizeStr" TEXT NOT NULL DEFAULT '25 × 25 mm',
ADD COLUMN     "voucherSize" TEXT NOT NULL DEFAULT '85.6x53.98';
