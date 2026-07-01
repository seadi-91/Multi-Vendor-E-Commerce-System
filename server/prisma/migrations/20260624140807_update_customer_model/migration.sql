-- Add new columns with default values
ALTER TABLE "customer" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'customer';
ALTER TABLE "customer" ADD COLUMN "address" TEXT;
ALTER TABLE "customer" ADD COLUMN "resetPasswordToken" TEXT;
ALTER TABLE "customer" ADD COLUMN "resetPasswordExpires" TIMESTAMP(3);

-- Rename fullName to name
ALTER TABLE "customer" RENAME COLUMN "fullName" TO "name";

-- Make phoneNumber optional by dropping the NOT NULL constraint
ALTER TABLE "customer" ALTER COLUMN "phoneNumber" DROP NOT NULL;
