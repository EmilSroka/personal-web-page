-- Will fail if duplicate (gift_id, claimer) rows exist; deduplicate first if so.
ALTER TABLE housewarming.reservations
  ADD CONSTRAINT reservations_gift_id_claimer_key UNIQUE (gift_id, claimer);
