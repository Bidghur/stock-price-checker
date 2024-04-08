-- CreateTable
CREATE TABLE "Stock" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "currentPrice" INTEGER NOT NULL,
    "timeStamp" INTEGER NOT NULL,
    "movingAverage" INTEGER NOT NULL
);
