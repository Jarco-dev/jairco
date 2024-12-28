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
ALTER TABLE `UsedWordSnakeWords` ADD CONSTRAINT `UsedWordSnakeWords_guildId_fkey` FOREIGN KEY (`guildId`) REFERENCES `Guilds`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
