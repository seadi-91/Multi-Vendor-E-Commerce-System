/*
  Warnings:

  - Added the required column `farmerId` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "badges" TEXT[],
ADD COLUMN     "category" TEXT,
ADD COLUMN     "farmerId" INTEGER NOT NULL,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "stock" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accountNumber" TEXT,
ADD COLUMN     "autoWithdrawal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "businessLicense" TEXT,
ADD COLUMN     "certifications" TEXT[],
ADD COLUMN     "farmName" TEXT,
ADD COLUMN     "farmRegistration" TEXT,
ADD COLUMN     "farmSize" TEXT,
ADD COLUMN     "insuranceExpiry" TIMESTAMP(3),
ADD COLUMN     "insurancePolicy" TEXT,
ADD COLUMN     "insuranceProvider" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'English',
ADD COLUMN     "languages" TEXT[],
ADD COLUMN     "location" TEXT,
ADD COLUMN     "loginAlerts" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "membershipAssociations" TEXT[],
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "sessionTimeout" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "taxId" TEXT,
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'Africa/Addis_Ababa',
ADD COLUMN     "twoFactor" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "vatNumber" TEXT,
ADD COLUMN     "vatRegistered" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "withdrawalThreshold" DOUBLE PRECISION;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
