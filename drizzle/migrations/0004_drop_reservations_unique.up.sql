-- Allow a single visitor to reserve the same gift more than once. Each row in
-- `reservations` now represents one unit; the UI surfaces a counter instead of
-- a binary claim/cancel toggle. The quantity check in reserveGift still caps
-- total reservations per gift.

ALTER TABLE housewarming.reservations
  DROP CONSTRAINT IF EXISTS reservations_gift_id_claimer_key;
