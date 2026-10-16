-- CreateTable
CREATE TABLE "NotificationBar" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "ctaTitle" TEXT,
    "ctaLink" TEXT,
    "expiresAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationBar_pkey" PRIMARY KEY ("id")
);