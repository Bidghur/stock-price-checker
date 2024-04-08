/*
  Warnings:

  - You are about to drop the column `timeStamp` on the `Stock` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Stock` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Stock" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "symbol" TEXT NOT NULL,
    "currentPrice" INTEGER NOT NULL,
    "updatedAt" TEXT NOT NULL,
    "movingAverage" INTEGER NOT NULL
);
INSERT INTO "new_Stock" ("currentPrice", "id", "movingAverage", "symbol") SELECT "currentPrice", "id", "movingAverage", "symbol" FROM "Stock";
DROP TABLE "Stock";
ALTER TABLE "new_Stock" RENAME TO "Stock";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
