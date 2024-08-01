-- CreateTable
CREATE TABLE `CountingStats` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `guildIdAndUserId` VARCHAR(191) NOT NULL,
    `correct` INTEGER NOT NULL DEFAULT 0,
    `incorrect` INTEGER NOT NULL DEFAULT 0,
    `highest` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `guildId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,

    UNIQUE INDEX `CountingStats_guildIdAndUserId_key`(`guildIdAndUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Blacklists` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('COUNTING') NOT NULL,
    `reason` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `guildIdUserIdType` VARCHAR(191) NOT NULL,
    `guildId` INTEGER NOT NULL,
    `receivedByUserId` INTEGER NOT NULL,
    `givenByUserId` INTEGER NOT NULL,

    UNIQUE INDEX `Blacklists_guildIdUserIdType_key`(`guildIdUserIdType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GuildSettings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `guildIdAndType` VARCHAR(191) NOT NULL,
    `type` ENUM('COUNTING_ENABLED', 'COUNTING_CHANNEL', 'HIGHEST_COUNT', 'CURRENT_COUNT', 'CURRENT_COUNT_USER') NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `guildId` INTEGER NULL,

    UNIQUE INDEX `GuildSettings_guildIdAndType_key`(`guildIdAndType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CountingStats` ADD CONSTRAINT `CountingStats_guildId_fkey` FOREIGN KEY (`guildId`) REFERENCES `Guilds`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CountingStats` ADD CONSTRAINT `CountingStats_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Blacklists` ADD CONSTRAINT `Blacklists_guildId_fkey` FOREIGN KEY (`guildId`) REFERENCES `Guilds`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Blacklists` ADD CONSTRAINT `Blacklists_receivedByUserId_fkey` FOREIGN KEY (`receivedByUserId`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Blacklists` ADD CONSTRAINT `Blacklists_givenByUserId_fkey` FOREIGN KEY (`givenByUserId`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GuildSettings` ADD CONSTRAINT `GuildSettings_guildId_fkey` FOREIGN KEY (`guildId`) REFERENCES `Guilds`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
