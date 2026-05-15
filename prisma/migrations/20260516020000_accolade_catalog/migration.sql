-- Add themeId + eventId to Accolade (granted instances)
ALTER TABLE "Accolade" ADD COLUMN "themeId" TEXT;
ALTER TABLE "Accolade" ADD COLUMN "eventId" TEXT;
ALTER TABLE "Accolade"
  ADD CONSTRAINT "Accolade_eventId_fkey"
  FOREIGN KEY ("eventId") REFERENCES "Event"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "Accolade_eventId_idx" ON "Accolade"("eventId");

-- AccoladeTemplate: admin-managed catalog of grantable accolades
CREATE TABLE "AccoladeTemplate" (
  "id"          TEXT NOT NULL,
  "label"       TEXT NOT NULL,
  "description" TEXT,
  "emoji"       TEXT,
  "themeId"     TEXT,
  "eventId"     TEXT,
  "active"      BOOLEAN NOT NULL DEFAULT true,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AccoladeTemplate_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AccoladeTemplate_eventId_idx" ON "AccoladeTemplate"("eventId");
CREATE INDEX "AccoladeTemplate_active_idx" ON "AccoladeTemplate"("active");

ALTER TABLE "AccoladeTemplate"
  ADD CONSTRAINT "AccoladeTemplate_eventId_fkey"
  FOREIGN KEY ("eventId") REFERENCES "Event"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
