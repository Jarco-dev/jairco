/*
  Warnings:

  - You are about to drop the `UsedWordSnakeWords` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `UsedWordSnakeWords` DROP FOREIGN KEY `UsedWordSnakeWords_guildId_fkey`;

-- DropTable
DROP TABLE `UsedWordSnakeWords`;
