/*
  Warnings:

  - Added the required column `symbol` to the `Stock` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Stock" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "symbol" TEXT NOT NULL,
    "currentPrice" INTEGER NOT NULL,
    "timeStamp" INTEGER NOT NULL,
    "movingAverage" INTEGER NOT NULL
);
INSERT INTO "new_Stock" ("currentPrice", "id", "movingAverage", "timeStamp") SELECT "currentPrice", "id", "movingAverage", "timeStamp" FROM "Stock";
DROP TABLE "Stock";
ALTER TABLE "new_Stock" RENAME TO "Stock";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
