/*
  Warnings:

  - The values [WORD_SNAKE] on the enum `Blacklists_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Blacklists` MODIFY `type` ENUM('COUNTING') NOT NULL;
