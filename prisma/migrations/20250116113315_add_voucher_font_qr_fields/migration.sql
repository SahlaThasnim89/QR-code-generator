/*
  Warnings:

  - You are about to drop the column `textFontSize` on the `Settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Settings" DROP COLUMN "textFontSize",
ADD COLUMN     "normalFontSize" INTEGER NOT NULL DEFAULT 8,
ADD COLUMN     "qrCodeSize" INTEGER NOT NULL DEFAULT 20,
ADD COLUMN     "subTextFontSize" INTEGER NOT NULL DEFAULT 10;
