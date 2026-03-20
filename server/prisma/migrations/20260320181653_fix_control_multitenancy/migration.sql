/*
  Warnings:

  - The primary key for the `Control` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The required column `dbId` was added to the `Control` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "Control" DROP CONSTRAINT "Control_pkey",
ADD COLUMN     "dbId" TEXT NOT NULL,
ADD CONSTRAINT "Control_pkey" PRIMARY KEY ("dbId");
