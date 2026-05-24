-- Adds the device identifier we read from localStorage on the client. Used as
-- the conflict target for upserts (`ON CONFLICT (visitor_id) DO UPDATE`), so a
-- single device gets exactly one RSVP row that they can edit.
--
-- Each ALTER is its own statement so that SQL editors which only run up to the
-- first parse boundary still apply the full migration.

ALTER TABLE housewarming.rsvps ADD COLUMN visitor_id text;

UPDATE housewarming.rsvps SET visitor_id = gen_random_uuid()::text WHERE visitor_id IS NULL;

ALTER TABLE housewarming.rsvps ALTER COLUMN visitor_id SET NOT NULL;

ALTER TABLE housewarming.rsvps ADD CONSTRAINT rsvps_visitor_id_key UNIQUE (visitor_id);
