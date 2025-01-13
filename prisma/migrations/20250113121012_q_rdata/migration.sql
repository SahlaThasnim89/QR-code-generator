-- CreateTable
CREATE TABLE "QRCode" (
    "id" SERIAL NOT NULL,
    "number" TEXT NOT NULL,
    "generatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QRCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QRCode_number_key" ON "QRCode"("number");
