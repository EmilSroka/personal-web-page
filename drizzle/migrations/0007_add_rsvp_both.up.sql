-- Adds a fourth RSVP option: 'both' -> coming to BOTH dates (18.07 and 13.06).
-- Only the CHECK constraint changes; existing rows ('main'/'alt'/'no') stay valid.
--
-- Postgres can't edit a CHECK in place, so drop and re-add. The constraint was
-- created inline in 0005, so it carries the auto-generated name rsvps_choice_check.

ALTER TABLE housewarming.rsvps DROP CONSTRAINT rsvps_choice_check;

ALTER TABLE housewarming.rsvps ADD CONSTRAINT rsvps_choice_check CHECK (choice IN ('main', 'alt', 'both', 'no'));
