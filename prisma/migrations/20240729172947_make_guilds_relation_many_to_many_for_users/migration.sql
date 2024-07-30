-- DropForeignKey
ALTER TABLE `Users` DROP FOREIGN KEY `Users_guildId_fkey`;

-- CreateTable
CREATE TABLE `_GuildsToUsers` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_GuildsToUsers_AB_unique`(`A`, `B`),
    INDEX `_GuildsToUsers_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_GuildsToUsers` ADD CONSTRAINT `_GuildsToUsers_A_fkey` FOREIGN KEY (`A`) REFERENCES `Guilds`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_GuildsToUsers` ADD CONSTRAINT `_GuildsToUsers_B_fkey` FOREIGN KEY (`B`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- MigrateData
INSERT INTO _GuildsToUsers (A, B) SELECT guildId, id FROM Users;

-- DropIndex
DROP INDEX `Users_guildId_fkey` ON `Users`;

-- AlterTable
ALTER TABLE `Users` DROP COLUMN `guildId`;
