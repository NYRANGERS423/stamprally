-- Replace the standalone KioskUser table with admin-issued steward
-- grants on existing User rows. KioskUser accounts are purged per the
-- 2026-05-16 redesign call — the admin will reassign steward access
-- to specific users from the new /admin/stewards page.

DROP TABLE "KioskUser";

CREATE TABLE "StewardGrant" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "grantedByAdmin" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "revokedReason" TEXT,
    "canStamp" BOOLEAN NOT NULL DEFAULT true,
    "canGrantAccolades" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "StewardGrant_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "StewardGrant_userId_idx" ON "StewardGrant"("userId");
CREATE INDEX "StewardGrant_revokedAt_expiresAt_idx"
    ON "StewardGrant"("revokedAt", "expiresAt");

ALTER TABLE "StewardGrant"
    ADD CONSTRAINT "StewardGrant_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Audit attribution: which steward operated the QR-show flow that
-- led to this stamp. Populated by a later chunk; nullable so existing
-- stamps are untouched.
ALTER TABLE "Stamp" ADD COLUMN "operatorUserId" TEXT;
CREATE INDEX "Stamp_operatorUserId_idx" ON "Stamp"("operatorUserId");

ALTER TABLE "Stamp"
    ADD CONSTRAINT "Stamp_operatorUserId_fkey"
    FOREIGN KEY ("operatorUserId") REFERENCES "User"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
