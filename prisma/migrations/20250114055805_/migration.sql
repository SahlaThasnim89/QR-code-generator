/*
  Warnings:

  - You are about to drop the column `expiryTime` on the `Settings` table. All the data in the column will be lost.
  - Added the required column `expiryDate` to the `Settings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Settings" DROP COLUMN "expiryTime",
ADD COLUMN     "expiryDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "generatedTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
