-- Reverts to the three-option CHECK. Will fail if any row still holds 'both';
-- reassign those rows before rolling back.

ALTER TABLE housewarming.rsvps DROP CONSTRAINT rsvps_choice_check;

ALTER TABLE housewarming.rsvps ADD CONSTRAINT rsvps_choice_check CHECK (choice IN ('main', 'alt', 'no'));
