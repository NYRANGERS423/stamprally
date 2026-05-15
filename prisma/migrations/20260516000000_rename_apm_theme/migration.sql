-- Rename the 'apm-terminals' theme ID to 'container-terminal' to keep
-- company names out of the data model.
UPDATE "User" SET "theme" = 'container-terminal' WHERE "theme" = 'apm-terminals';
