-- Flatten Event → Destination → Activity to Event → Activity.
-- Each Activity gets its parent event id copied over from its old Destination.

ALTER TABLE "Activity" ADD COLUMN "eventId" TEXT;
ALTER TABLE "Activity" ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0;

UPDATE "Activity"
SET "eventId" = "Destination"."eventId"
FROM "Destination"
WHERE "Activity"."destinationId" = "Destination"."id";

ALTER TABLE "Activity" ALTER COLUMN "eventId" SET NOT NULL;
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_eventId_fkey"
  FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Activity" DROP CONSTRAINT "Activity_destinationId_fkey";
DROP INDEX "Activity_destinationId_idx";
ALTER TABLE "Activity" DROP COLUMN "destinationId";

DROP TABLE "Destination";

CREATE INDEX "Activity_eventId_idx" ON "Activity"("eventId");
