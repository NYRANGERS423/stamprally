-- Per-event emoji, configurable from the admin Event editor.
-- Optional; surfaces in events list / event detail / kiosk picker
-- with a generic fallback when null.

ALTER TABLE "Event" ADD COLUMN "emoji" TEXT;
