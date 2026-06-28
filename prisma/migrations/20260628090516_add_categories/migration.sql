-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "labelDe" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#7B5EA7',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_key_key" ON "Category"("key");
