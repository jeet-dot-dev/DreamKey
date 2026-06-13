-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'STAFF', 'INTERN');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('FLAT', 'LAND', 'WAREHOUSE', 'COMMERCIAL', 'OTHER');

-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE', 'RENTED', 'SOLD', 'UPCOMING');

-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "OwnerStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" VARCHAR(10) NOT NULL,
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Owner" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(10) NOT NULL,
    "email" TEXT NOT NULL,
    "whatsapp" VARCHAR(10),
    "address" TEXT,
    "status" "OwnerStatus" NOT NULL DEFAULT 'ACTIVE',
    "primaryContactPartnerId" TEXT,
    "preferredRentMin" BIGINT,
    "preferredRentMax" BIGINT,
    "preferredPropertyTypes" TEXT,
    "preferredDealTerms" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archive" BOOLEAN NOT NULL DEFAULT false,
    "favorites" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Owner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OwnerCommunicationLog" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "subject" VARCHAR(255) NOT NULL,
    "notes" TEXT NOT NULL,
    "communicationType" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OwnerCommunicationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Broker" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(10) NOT NULL,
    "email" TEXT NOT NULL,
    "whatsapp" VARCHAR(10),
    "areaOfOperation" TEXT,
    "status" "ContactStatus" NOT NULL DEFAULT 'ACTIVE',
    "primaryContactPartnerId" TEXT,
    "budgetMin" BIGINT,
    "budgetMax" BIGINT,
    "societyExpertise" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archive" BOOLEAN NOT NULL DEFAULT false,
    "favorites" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Broker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrokerInteractionLog" (
    "id" TEXT NOT NULL,
    "brokerId" TEXT NOT NULL,
    "subject" VARCHAR(255) NOT NULL,
    "notes" TEXT NOT NULL,
    "communicationType" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BrokerInteractionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyListing" (
    "id" TEXT NOT NULL,
    "propertyType" "PropertyType" NOT NULL,
    "buildingName" VARCHAR(100) NOT NULL,
    "location" VARCHAR(100) NOT NULL,
    "pinCode" VARCHAR(6) NOT NULL,
    "floorNumber" VARCHAR(50),
    "totalFloors" INTEGER,
    "bedrooms" DECIMAL(65,30),
    "bathrooms" DECIMAL(65,30),
    "balconies" INTEGER,
    "carpetArea" DECIMAL(65,30),
    "superBuiltUpArea" DECIMAL(65,30),
    "askingPrice" BIGINT NOT NULL,
    "availabilityStatus" "AvailabilityStatus" NOT NULL,
    "availabilityDate" TIMESTAMP(3),
    "accessType" VARCHAR(100),
    "remarks" TEXT,
    "builderName" VARCHAR(100),
    "yearBuilt" INTEGER,
    "totalUnits" INTEGER,
    "reraNumber" VARCHAR(100),
    "ownerId" TEXT,
    "sourcePartnerId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archive" BOOLEAN NOT NULL DEFAULT false,
    "favorites" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PropertyListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyAmenities" (
    "id" TEXT NOT NULL,
    "parking" BOOLEAN NOT NULL DEFAULT false,
    "gym" BOOLEAN NOT NULL DEFAULT false,
    "lift" BOOLEAN NOT NULL DEFAULT false,
    "security" BOOLEAN NOT NULL DEFAULT false,
    "powerBackup" BOOLEAN NOT NULL DEFAULT false,
    "swimmingPool" BOOLEAN NOT NULL DEFAULT false,
    "clubhouse" BOOLEAN NOT NULL DEFAULT false,
    "propertyListingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertyAmenities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT,
    "caption" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "propertyListingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyBrochure" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT,
    "fileName" TEXT NOT NULL,
    "propertyListingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertyBrochure_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Owner_email_idx" ON "Owner"("email");

-- CreateIndex
CREATE INDEX "Owner_phone_idx" ON "Owner"("phone");

-- CreateIndex
CREATE INDEX "Owner_status_idx" ON "Owner"("status");

-- CreateIndex
CREATE INDEX "Owner_primaryContactPartnerId_idx" ON "Owner"("primaryContactPartnerId");

-- CreateIndex
CREATE INDEX "OwnerCommunicationLog_ownerId_idx" ON "OwnerCommunicationLog"("ownerId");

-- CreateIndex
CREATE INDEX "OwnerCommunicationLog_createdAt_idx" ON "OwnerCommunicationLog"("createdAt");

-- CreateIndex
CREATE INDEX "Broker_email_idx" ON "Broker"("email");

-- CreateIndex
CREATE INDEX "Broker_phone_idx" ON "Broker"("phone");

-- CreateIndex
CREATE INDEX "Broker_status_idx" ON "Broker"("status");

-- CreateIndex
CREATE INDEX "Broker_primaryContactPartnerId_idx" ON "Broker"("primaryContactPartnerId");

-- CreateIndex
CREATE INDEX "BrokerInteractionLog_brokerId_idx" ON "BrokerInteractionLog"("brokerId");

-- CreateIndex
CREATE INDEX "BrokerInteractionLog_createdAt_idx" ON "BrokerInteractionLog"("createdAt");

-- CreateIndex
CREATE INDEX "PropertyListing_userId_idx" ON "PropertyListing"("userId");

-- CreateIndex
CREATE INDEX "PropertyListing_ownerId_idx" ON "PropertyListing"("ownerId");

-- CreateIndex
CREATE INDEX "PropertyListing_sourcePartnerId_idx" ON "PropertyListing"("sourcePartnerId");

-- CreateIndex
CREATE INDEX "PropertyListing_availabilityStatus_idx" ON "PropertyListing"("availabilityStatus");

-- CreateIndex
CREATE INDEX "PropertyListing_propertyType_idx" ON "PropertyListing"("propertyType");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyAmenities_propertyListingId_key" ON "PropertyAmenities"("propertyListingId");

-- CreateIndex
CREATE INDEX "PropertyImage_propertyListingId_idx" ON "PropertyImage"("propertyListingId");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyBrochure_propertyListingId_key" ON "PropertyBrochure"("propertyListingId");

-- AddForeignKey
ALTER TABLE "Owner" ADD CONSTRAINT "Owner_primaryContactPartnerId_fkey" FOREIGN KEY ("primaryContactPartnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnerCommunicationLog" ADD CONSTRAINT "OwnerCommunicationLog_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Broker" ADD CONSTRAINT "Broker_primaryContactPartnerId_fkey" FOREIGN KEY ("primaryContactPartnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrokerInteractionLog" ADD CONSTRAINT "BrokerInteractionLog_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "Broker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyListing" ADD CONSTRAINT "PropertyListing_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyListing" ADD CONSTRAINT "PropertyListing_sourcePartnerId_fkey" FOREIGN KEY ("sourcePartnerId") REFERENCES "Broker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyListing" ADD CONSTRAINT "PropertyListing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyAmenities" ADD CONSTRAINT "PropertyAmenities_propertyListingId_fkey" FOREIGN KEY ("propertyListingId") REFERENCES "PropertyListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyImage" ADD CONSTRAINT "PropertyImage_propertyListingId_fkey" FOREIGN KEY ("propertyListingId") REFERENCES "PropertyListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyBrochure" ADD CONSTRAINT "PropertyBrochure_propertyListingId_fkey" FOREIGN KEY ("propertyListingId") REFERENCES "PropertyListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
