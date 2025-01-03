-- CreateTable
CREATE TABLE `Channels` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `discordId` VARCHAR(191) NOT NULL,
    `stickerFilter` BOOLEAN NOT NULL DEFAULT false,
    `guildId` INTEGER NOT NULL,

    UNIQUE INDEX `Channels_discordId_key`(`discordId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Channels` ADD CONSTRAINT `Channels_guildId_fkey` FOREIGN KEY (`guildId`) REFERENCES `Guilds`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
