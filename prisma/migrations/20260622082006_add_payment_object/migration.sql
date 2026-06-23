-- CreateTable
CREATE TABLE "SumUpPayment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "paymentId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "orderId" INTEGER,
    CONSTRAINT "SumUpPayment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
