/*
  Warnings:

  - Added the required column `guildId` to the `Cringes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `guildId` to the `Groups` table without a default value. This is not possible if the table is not empty.
  - Added the required column `guildId` to the `Roles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `guildId` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Groups_name_key` ON `Groups`;

-- DropIndex
DROP INDEX `Users_discordId_key` ON `Users`;

-- AlterTable
ALTER TABLE `Cringes` ADD COLUMN `guildId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Groups` ADD COLUMN `guildId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Roles` ADD COLUMN `guildId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Users` ADD COLUMN `guildId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `Guilds` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `discordId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Guilds_discordId_key`(`discordId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Users` ADD CONSTRAINT `Users_guildId_fkey` FOREIGN KEY (`guildId`) REFERENCES `Guilds`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Roles` ADD CONSTRAINT `Roles_guildId_fkey` FOREIGN KEY (`guildId`) REFERENCES `Guilds`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Groups` ADD CONSTRAINT `Groups_guildId_fkey` FOREIGN KEY (`guildId`) REFERENCES `Guilds`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cringes` ADD CONSTRAINT `Cringes_guildId_fkey` FOREIGN KEY (`guildId`) REFERENCES `Guilds`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
