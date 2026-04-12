-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PATIENT', 'THERAPIST', 'ADMIN');

-- CreateEnum
CREATE TYPE "TherapistStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ONBOARDING');

-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE', 'BOOKED', 'BLOCKED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "role" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Therapist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "TherapistStatus" NOT NULL DEFAULT 'ACTIVE',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "sessionPriceSar" DECIMAL(10,2) NOT NULL,
    "rating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "yearsOfExperience" INTEGER NOT NULL DEFAULT 0,
    "profileImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Therapist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TherapistProfile" (
    "id" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "headlineAr" TEXT,
    "bioAr" TEXT NOT NULL,
    "credentialsAr" TEXT,
    "languages" TEXT[],
    "sessionModes" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TherapistProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Specialization" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Specialization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TherapistAvailability" (
    "id" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "startsAtUtc" TIMESTAMP(3) NOT NULL,
    "endsAtUtc" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Riyadh',
    "status" "AvailabilityStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TherapistAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_SpecializationToTherapist" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Therapist_userId_key" ON "Therapist"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Therapist_slug_key" ON "Therapist"("slug");

-- CreateIndex
CREATE INDEX "Therapist_slug_idx" ON "Therapist"("slug");

-- CreateIndex
CREATE INDEX "Therapist_status_idx" ON "Therapist"("status");

-- CreateIndex
CREATE INDEX "Therapist_isVerified_idx" ON "Therapist"("isVerified");

-- CreateIndex
CREATE INDEX "Therapist_rating_idx" ON "Therapist"("rating");

-- CreateIndex
CREATE INDEX "Therapist_sessionPriceSar_idx" ON "Therapist"("sessionPriceSar");

-- CreateIndex
CREATE UNIQUE INDEX "TherapistProfile_therapistId_key" ON "TherapistProfile"("therapistId");

-- CreateIndex
CREATE UNIQUE INDEX "Specialization_slug_key" ON "Specialization"("slug");

-- CreateIndex
CREATE INDEX "TherapistAvailability_therapistId_status_startsAtUtc_idx" ON "TherapistAvailability"("therapistId", "status", "startsAtUtc");

-- CreateIndex
CREATE INDEX "TherapistAvailability_startsAtUtc_idx" ON "TherapistAvailability"("startsAtUtc");

-- CreateIndex
CREATE UNIQUE INDEX "_SpecializationToTherapist_AB_unique" ON "_SpecializationToTherapist"("A", "B");

-- CreateIndex
CREATE INDEX "_SpecializationToTherapist_B_index" ON "_SpecializationToTherapist"("B");

-- AddForeignKey
ALTER TABLE "Therapist" ADD CONSTRAINT "Therapist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TherapistProfile" ADD CONSTRAINT "TherapistProfile_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TherapistAvailability" ADD CONSTRAINT "TherapistAvailability_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SpecializationToTherapist" ADD CONSTRAINT "_SpecializationToTherapist_A_fkey" FOREIGN KEY ("A") REFERENCES "Specialization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SpecializationToTherapist" ADD CONSTRAINT "_SpecializationToTherapist_B_fkey" FOREIGN KEY ("B") REFERENCES "Therapist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
