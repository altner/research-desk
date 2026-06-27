-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PromptTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "template" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "locationId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PromptTemplate_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PromptTemplate" ("createdAt", "description", "id", "isDefault", "name", "template", "updatedAt") SELECT "createdAt", "description", "id", "isDefault", "name", "template", "updatedAt" FROM "PromptTemplate";
DROP TABLE "PromptTemplate";
ALTER TABLE "new_PromptTemplate" RENAME TO "PromptTemplate";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
