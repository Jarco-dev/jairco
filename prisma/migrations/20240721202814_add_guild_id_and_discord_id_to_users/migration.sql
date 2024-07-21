/*
  Warnings:

  - A unique constraint covering the columns `[guildIdAndDiscordId]` on the table `Users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `guildIdAndDiscordId` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Users` ADD COLUMN `guildIdAndDiscordId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Users_guildIdAndDiscordId_key` ON `Users`(`guildIdAndDiscordId`);
