CREATE TABLE "Accolade" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "emoji" TEXT,
    "awardedBy" TEXT NOT NULL,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Accolade_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Accolade_userId_idx" ON "Accolade"("userId");

ALTER TABLE "Accolade" ADD CONSTRAINT "Accolade_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
