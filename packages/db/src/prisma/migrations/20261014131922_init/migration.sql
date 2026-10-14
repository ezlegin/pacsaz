-- CreateEnum
CREATE TYPE "UsageGoal" AS ENUM ('practice', 'projects', 'portfolio', 'hobby', 'other');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('student', 'designer', 'designStudio', 'printHouse', 'dielineMaker', 'packagingFactory', 'other');

-- CreateEnum
CREATE TYPE "Material" AS ENUM ('cFlute', 'beFlute', 'bcFlute', 'abFlute', 'artPaper', 'glossyCardboard', 'fFlute', 'eFlute', 'bFlute');

-- CreateEnum
CREATE TYPE "DimensionType" AS ENUM ('manufacture', 'inner', 'outer');

-- CreateEnum
CREATE TYPE "CouponType" AS ENUM ('fixed', 'percent');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('admin', 'zarinPal', 'no_method');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('failed', 'success', 'pending', 'canceled', 'could_not_initiate');

-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('active', 'inActive');

-- CreateEnum
CREATE TYPE "PlanPeriod" AS ENUM ('monthly', 'threeMonth', 'annual');

-- CreateEnum
CREATE TYPE "PlanKey" AS ENUM ('standard', 'pro', 'organization');

-- CreateEnum
CREATE TYPE "PaymentPlanType" AS ENUM ('new', 'renewal');

-- CreateEnum
CREATE TYPE "TarrifFeatureType" AS ENUM ('general', 'paid');

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "fullName" TEXT NOT NULL,
    "usageGoal" "UsageGoal",
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userType" "UserType",

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "email" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Otp" (
    "id" SERIAL NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Otp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dieline" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "specification" TEXT NOT NULL,
    "variable" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "materials" TEXT NOT NULL,
    "defaultMaterial" TEXT NOT NULL,
    "dimensionTypes" TEXT NOT NULL,
    "minWidth" DOUBLE PRECISION NOT NULL,
    "minLength" DOUBLE PRECISION NOT NULL,
    "minHeight" DOUBLE PRECISION NOT NULL,
    "maxWidth" DOUBLE PRECISION NOT NULL,
    "maxLength" DOUBLE PRECISION NOT NULL,
    "maxHeight" DOUBLE PRECISION NOT NULL,
    "settingsId" INTEGER NOT NULL,

    CONSTRAINT "Dieline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DielineImage" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dielineId" INTEGER NOT NULL,

    CONSTRAINT "DielineImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelImage" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dielineId" INTEGER NOT NULL,

    CONSTRAINT "ModelImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DielineSettings" (
    "id" SERIAL NOT NULL,
    "bleed" INTEGER NOT NULL,
    "thickness" DOUBLE PRECISION NOT NULL,
    "material" TEXT NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,
    "length" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "dimensionType" "DimensionType" NOT NULL,

    CONSTRAINT "DielineSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomDielineSettings" (
    "id" SERIAL NOT NULL,
    "bleed" INTEGER NOT NULL,
    "thickness" DOUBLE PRECISION NOT NULL,
    "material" TEXT NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,
    "length" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "dimensionType" "DimensionType" NOT NULL,
    "savedDielineId" INTEGER,
    "downloadHistoryId" INTEGER,

    CONSTRAINT "CustomDielineSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DielineCategoryByUsage" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "DielineCategoryByUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DielineCategoryByModel" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "DielineCategoryByModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedDieline" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dielineId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "customerId" INTEGER,

    CONSTRAINT "SavedDieline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DownloadHistory" (
    "id" SERIAL NOT NULL,
    "downloadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dielineId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "planId" INTEGER NOT NULL,

    CONSTRAINT "DownloadHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavedDieline" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "dielineId" INTEGER NOT NULL,

    CONSTRAINT "FavedDieline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "totalDiscount" DOUBLE PRECISION NOT NULL,
    "discountCodeAmount" DOUBLE PRECISION NOT NULL,
    "discountCode" TEXT,
    "status" "PaymentStatus" NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "authority" TEXT,
    "period" "PlanPeriod" NOT NULL,
    "userId" INTEGER NOT NULL,
    "tarrifId" INTEGER NOT NULL,
    "couponId" INTEGER,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentTrack" (
    "id" SERIAL NOT NULL,
    "plan" "PlanKey" NOT NULL,
    "period" "PlanPeriod" NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "PaymentTrack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coupon" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "used" INTEGER NOT NULL DEFAULT 0,
    "limit" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "CouponType" NOT NULL,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" SERIAL NOT NULL,
    "key" "PlanKey" NOT NULL,
    "title" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "period" "PlanPeriod" NOT NULL,
    "type" "PaymentPlanType" NOT NULL,
    "fairDownload" INTEGER NOT NULL,
    "downloaded" INTEGER NOT NULL DEFAULT 0,
    "firstDownload" TIMESTAMP(3),
    "lastDownload" TIMESTAMP(3),
    "status" "PlanStatus" NOT NULL DEFAULT 'active',
    "paymentId" INTEGER,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tarrif" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "key" "PlanKey" NOT NULL,
    "description" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "isRecommended" BOOLEAN NOT NULL,
    "level" INTEGER NOT NULL,
    "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "Tarrif_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TarrifFeature" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "type" "TarrifFeatureType" NOT NULL,

    CONSTRAINT "TarrifFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SelectedTarrifFeature" (
    "id" SERIAL NOT NULL,
    "tarrifFeatureId" INTEGER NOT NULL,
    "tarrifId" INTEGER NOT NULL,

    CONSTRAINT "SelectedTarrifFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FairDownload" (
    "id" SERIAL NOT NULL,
    "monthly" DOUBLE PRECISION NOT NULL,
    "threeMonth" DOUBLE PRECISION NOT NULL,
    "annual" DOUBLE PRECISION NOT NULL,
    "tarrifId" INTEGER NOT NULL,

    CONSTRAINT "FairDownload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Price" (
    "id" SERIAL NOT NULL,
    "monthly" DOUBLE PRECISION NOT NULL,
    "threeMonth" DOUBLE PRECISION NOT NULL,
    "annual" DOUBLE PRECISION NOT NULL,
    "tarrifId" INTEGER NOT NULL,

    CONSTRAINT "Price_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DielineToDielineCategoryByUsage" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_DielineToDielineCategoryByUsage_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_DielineToDielineCategoryByModel" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_DielineToDielineCategoryByModel_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CouponToTarrif" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CouponToTarrif_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_phoneNumber_key" ON "Admin"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Otp_code_phoneNumber_key" ON "Otp"("code", "phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Dieline_slug_key" ON "Dieline"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Dieline_settingsId_key" ON "Dieline"("settingsId");

-- CreateIndex
CREATE UNIQUE INDEX "DielineImage_publicId_key" ON "DielineImage"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "DielineImage_dielineId_key" ON "DielineImage"("dielineId");

-- CreateIndex
CREATE UNIQUE INDEX "ModelImage_publicId_key" ON "ModelImage"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "ModelImage_dielineId_key" ON "ModelImage"("dielineId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomDielineSettings_savedDielineId_key" ON "CustomDielineSettings"("savedDielineId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomDielineSettings_downloadHistoryId_key" ON "CustomDielineSettings"("downloadHistoryId");

-- CreateIndex
CREATE UNIQUE INDEX "DielineCategoryByUsage_slug_key" ON "DielineCategoryByUsage"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "DielineCategoryByModel_slug_key" ON "DielineCategoryByModel"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "FavedDieline_userId_dielineId_key" ON "FavedDieline"("userId", "dielineId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_authority_key" ON "Payment"("authority");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_paymentId_key" ON "Plan"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "Tarrif_key_key" ON "Tarrif"("key");

-- CreateIndex
CREATE UNIQUE INDEX "FairDownload_tarrifId_key" ON "FairDownload"("tarrifId");

-- CreateIndex
CREATE UNIQUE INDEX "Price_tarrifId_key" ON "Price"("tarrifId");

-- CreateIndex
CREATE INDEX "_DielineToDielineCategoryByUsage_B_index" ON "_DielineToDielineCategoryByUsage"("B");

-- CreateIndex
CREATE INDEX "_DielineToDielineCategoryByModel_B_index" ON "_DielineToDielineCategoryByModel"("B");

-- CreateIndex
CREATE INDEX "_CouponToTarrif_B_index" ON "_CouponToTarrif"("B");

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dieline" ADD CONSTRAINT "Dieline_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "DielineSettings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DielineImage" ADD CONSTRAINT "DielineImage_dielineId_fkey" FOREIGN KEY ("dielineId") REFERENCES "Dieline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelImage" ADD CONSTRAINT "ModelImage_dielineId_fkey" FOREIGN KEY ("dielineId") REFERENCES "Dieline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomDielineSettings" ADD CONSTRAINT "CustomDielineSettings_savedDielineId_fkey" FOREIGN KEY ("savedDielineId") REFERENCES "SavedDieline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomDielineSettings" ADD CONSTRAINT "CustomDielineSettings_downloadHistoryId_fkey" FOREIGN KEY ("downloadHistoryId") REFERENCES "DownloadHistory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedDieline" ADD CONSTRAINT "SavedDieline_dielineId_fkey" FOREIGN KEY ("dielineId") REFERENCES "Dieline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedDieline" ADD CONSTRAINT "SavedDieline_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedDieline" ADD CONSTRAINT "SavedDieline_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DownloadHistory" ADD CONSTRAINT "DownloadHistory_dielineId_fkey" FOREIGN KEY ("dielineId") REFERENCES "Dieline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DownloadHistory" ADD CONSTRAINT "DownloadHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DownloadHistory" ADD CONSTRAINT "DownloadHistory_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavedDieline" ADD CONSTRAINT "FavedDieline_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavedDieline" ADD CONSTRAINT "FavedDieline_dielineId_fkey" FOREIGN KEY ("dielineId") REFERENCES "Dieline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_tarrifId_fkey" FOREIGN KEY ("tarrifId") REFERENCES "Tarrif"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTrack" ADD CONSTRAINT "PaymentTrack_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SelectedTarrifFeature" ADD CONSTRAINT "SelectedTarrifFeature_tarrifFeatureId_fkey" FOREIGN KEY ("tarrifFeatureId") REFERENCES "TarrifFeature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SelectedTarrifFeature" ADD CONSTRAINT "SelectedTarrifFeature_tarrifId_fkey" FOREIGN KEY ("tarrifId") REFERENCES "Tarrif"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FairDownload" ADD CONSTRAINT "FairDownload_tarrifId_fkey" FOREIGN KEY ("tarrifId") REFERENCES "Tarrif"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Price" ADD CONSTRAINT "Price_tarrifId_fkey" FOREIGN KEY ("tarrifId") REFERENCES "Tarrif"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DielineToDielineCategoryByUsage" ADD CONSTRAINT "_DielineToDielineCategoryByUsage_A_fkey" FOREIGN KEY ("A") REFERENCES "Dieline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DielineToDielineCategoryByUsage" ADD CONSTRAINT "_DielineToDielineCategoryByUsage_B_fkey" FOREIGN KEY ("B") REFERENCES "DielineCategoryByUsage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DielineToDielineCategoryByModel" ADD CONSTRAINT "_DielineToDielineCategoryByModel_A_fkey" FOREIGN KEY ("A") REFERENCES "Dieline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DielineToDielineCategoryByModel" ADD CONSTRAINT "_DielineToDielineCategoryByModel_B_fkey" FOREIGN KEY ("B") REFERENCES "DielineCategoryByModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CouponToTarrif" ADD CONSTRAINT "_CouponToTarrif_A_fkey" FOREIGN KEY ("A") REFERENCES "Coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CouponToTarrif" ADD CONSTRAINT "_CouponToTarrif_B_fkey" FOREIGN KEY ("B") REFERENCES "Tarrif"("id") ON DELETE CASCADE ON UPDATE CASCADE;
