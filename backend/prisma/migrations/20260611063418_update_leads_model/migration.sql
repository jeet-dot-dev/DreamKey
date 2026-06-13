-- CreateEnum
CREATE TYPE "LeadPriority" AS ENUM ('HOT', 'WARM', 'COLD');

-- CreateEnum
CREATE TYPE "FurnishedType" AS ENUM ('UNFURNISHED', 'SEMI_FURNISHED', 'FULLY_FURNISHED');

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "bathrooms" INTEGER,
ADD COLUMN     "bedrooms" INTEGER,
ADD COLUMN     "furnishedType" "FurnishedType",
ADD COLUMN     "maxArea" DECIMAL(65,30),
ADD COLUMN     "minArea" DECIMAL(65,30),
ADD COLUMN     "preferredAmenities" TEXT,
ADD COLUMN     "priority" "LeadPriority" NOT NULL DEFAULT 'WARM',
ADD COLUMN     "propertyType" "PropertyType",
ADD COLUMN     "purchaseTimeline" TEXT;

-- CreateIndex
CREATE INDEX "Lead_priority_idx" ON "Lead"("priority");
