-- Activity details surfaced in the user-facing event detail page:
-- a location string and optional start/end times. Description was
-- already present. All three are optional so existing rows are
-- unaffected.

ALTER TABLE "Activity" ADD COLUMN "location" TEXT;
ALTER TABLE "Activity" ADD COLUMN "startTime" TIMESTAMP(3);
ALTER TABLE "Activity" ADD COLUMN "endTime" TIMESTAMP(3);
