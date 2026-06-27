-- CreateTable
CREATE TABLE "PromptTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "template" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ArticleDraftGeneration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "articleId" TEXT NOT NULL,
    "promptTemplateId" TEXT,
    "ideaSnapshot" TEXT NOT NULL,
    "promptUsed" TEXT NOT NULL,
    "modelOutput" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ArticleDraftGeneration_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ArticleDraftGeneration_promptTemplateId_fkey" FOREIGN KEY ("promptTemplateId") REFERENCES "PromptTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ArticleDraftGeneration" ("articleId", "createdAt", "id", "ideaSnapshot", "modelOutput", "promptUsed") SELECT "articleId", "createdAt", "id", "ideaSnapshot", "modelOutput", "promptUsed" FROM "ArticleDraftGeneration";
DROP TABLE "ArticleDraftGeneration";
ALTER TABLE "new_ArticleDraftGeneration" RENAME TO "ArticleDraftGeneration";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
