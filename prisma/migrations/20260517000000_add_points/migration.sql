-- Add points scoring to activities, accolade templates, and accolades.
-- Existing rows default to 1 so all current stamps and accolades remain
-- worth the same single point under the new system.

ALTER TABLE "Activity" ADD COLUMN "points" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "AccoladeTemplate" ADD COLUMN "points" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Accolade" ADD COLUMN "points" INTEGER NOT NULL DEFAULT 1;
