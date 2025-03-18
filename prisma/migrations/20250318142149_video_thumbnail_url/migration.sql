/*
  Warnings:

  - You are about to drop the column `thumbnail` on the `Video` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Video" DROP COLUMN "thumbnail",
ADD COLUMN     "thumbnailUrl" TEXT;
