/*
  Warnings:

  - You are about to drop the column `guildId` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `guildIdAndDiscordId` on the `Users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[discordId]` on the table `Users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Users_guildIdAndDiscordId_key` ON `Users`;

-- AlterTable
ALTER TABLE `Users` DROP COLUMN `guildIdAndDiscordId`;

-- CreateIndex
CREATE UNIQUE INDEX `Users_discordId_key` ON `Users`(`discordId`);
