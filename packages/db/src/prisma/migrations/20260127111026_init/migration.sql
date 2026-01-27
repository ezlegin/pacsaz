-- CreateTable
CREATE TABLE `Admin` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fullName` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NOT NULL,
    `onboardingCompleted` BOOLEAN NOT NULL,
    `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `type` ENUM('student', 'designer', 'designStudio', 'printHouse', 'dielineMaker', 'packagingFactory', 'other') NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Otp` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `otp` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Plan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `key` ENUM('standard', 'pro', 'orgnization') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `level` INTEGER NOT NULL,
    `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endsAt` DATETIME(3) NOT NULL,
    `period` ENUM('monthly', 'threeMonth', 'annual') NOT NULL,
    `type` ENUM('renewal', 'new') NOT NULL,
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Download` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fair` INTEGER NOT NULL,
    `downloaded` INTEGER NOT NULL,
    `firstDownload` DATETIME(3) NOT NULL,
    `lastDownload` DATETIME(3) NOT NULL,
    `planId` INTEGER NOT NULL,

    UNIQUE INDEX `Download_planId_key`(`planId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DownloadRecord` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `material` ENUM('bFlute', 'eFlute', 'fFlute', 'cFlute', 'beFlute', 'bcFlute', 'abFlute', 'glossyCardboard', 'artPaper') NOT NULL,
    `thickness` INTEGER NOT NULL,
    `bleed` INTEGER NOT NULL,
    `dielineId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Dimension` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `width` INTEGER NOT NULL,
    `length` INTEGER NOT NULL,
    `height` INTEGER NOT NULL,
    `downloadRecordId` INTEGER NOT NULL,

    UNIQUE INDEX `Dimension_downloadRecordId_key`(`downloadRecordId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Dieline` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DielineCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `type` ENUM('byUsage', 'byModel') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DielineImage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `modelImg` VARCHAR(191) NULL,
    `trimImg` VARCHAR(191) NULL,
    `dielineId` INTEGER NOT NULL,

    UNIQUE INDEX `DielineImage_dielineId_key`(`dielineId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_DielineToDielineCategory` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_DielineToDielineCategory_AB_unique`(`A`, `B`),
    INDEX `_DielineToDielineCategory_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Otp` ADD CONSTRAINT `Otp_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Plan` ADD CONSTRAINT `Plan_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Download` ADD CONSTRAINT `Download_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `Plan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DownloadRecord` ADD CONSTRAINT `DownloadRecord_dielineId_fkey` FOREIGN KEY (`dielineId`) REFERENCES `Dieline`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DownloadRecord` ADD CONSTRAINT `DownloadRecord_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dimension` ADD CONSTRAINT `Dimension_downloadRecordId_fkey` FOREIGN KEY (`downloadRecordId`) REFERENCES `DownloadRecord`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DielineImage` ADD CONSTRAINT `DielineImage_dielineId_fkey` FOREIGN KEY (`dielineId`) REFERENCES `Dieline`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_DielineToDielineCategory` ADD CONSTRAINT `_DielineToDielineCategory_A_fkey` FOREIGN KEY (`A`) REFERENCES `Dieline`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_DielineToDielineCategory` ADD CONSTRAINT `_DielineToDielineCategory_B_fkey` FOREIGN KEY (`B`) REFERENCES `DielineCategory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
