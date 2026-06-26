-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FloatingOrder" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "lastKeepAlive" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_FloatingOrder" ("id") SELECT "id" FROM "FloatingOrder";
DROP TABLE "FloatingOrder";
ALTER TABLE "new_FloatingOrder" RENAME TO "FloatingOrder";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
