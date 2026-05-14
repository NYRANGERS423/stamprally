-- DropIndex
DROP INDEX "PassportTag_userId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "PassportTag_userId_key_key" ON "PassportTag"("userId", "key");
