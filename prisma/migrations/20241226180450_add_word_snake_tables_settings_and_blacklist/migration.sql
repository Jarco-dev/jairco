-- AlterTable
ALTER TABLE `Blacklists` MODIFY `type` ENUM('COUNTING', 'WORD_SNAKE') NOT NULL;

-- AlterTable
ALTER TABLE `GuildSettings` MODIFY `type` ENUM('COUNTING_ENABLED', 'COUNTING_CHANNEL', 'HIGHEST_COUNT', 'CURRENT_COUNT', 'CURRENT_COUNT_USER', 'CRINGE_ENABLED', 'CALENDAR_ENABLED', 'CALENDAR_AUTO_DELETE', 'WORD_SNAKE_ENABLED', 'WORD_SNAKE_CHANNEL', 'HIGHEST_WORD_SNAKE', 'CURRENT_WORD', 'CURRENT_WORD_USER', 'CURRENT_WORD_SNAKE') NOT NULL;

-- CreateTable
CREATE TABLE `WordSnakeStats` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `guildIdAndUserId` VARCHAR(191) NOT NULL,
    `correct` INTEGER NOT NULL DEFAULT 0,
    `incorrect` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `guildId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,

    UNIQUE INDEX `WordSnakeStats_guildIdAndUserId_key`(`guildIdAndUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UsedWordSnakeWords` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `content` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `guildId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `WordSnakeStats` ADD CONSTRAINT `WordSnakeStats_guildId_fkey` FOREIGN KEY (`guildId`) REFERENCES `Guilds`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WordSnakeStats` ADD CONSTRAINT `WordSnakeStats_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UsedWordSnakeWords` ADD CONSTRAINT `UsedWordSnakeWords_guildId_fkey` FOREIGN KEY (`guildId`) REFERENCES `Guilds`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;