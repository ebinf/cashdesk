-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SumUpPayment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "paymentId" TEXT,
    "status" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "orderId" INTEGER,
    CONSTRAINT "SumUpPayment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_SumUpPayment" ("amount", "id", "orderId", "paymentId", "status") SELECT "amount", "id", "orderId", "paymentId", "status" FROM "SumUpPayment";
DROP TABLE "SumUpPayment";
ALTER TABLE "new_SumUpPayment" RENAME TO "SumUpPayment";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
