-- Initial schema for housewarming reservations.
-- Lives in its own `housewarming` schema so it can be dropped cleanly later.

CREATE SCHEMA IF NOT EXISTS housewarming;

CREATE TABLE housewarming.gifts (
  id          text        PRIMARY KEY,
  title_pl    text        NOT NULL,
  title_uk    text        NOT NULL,
  desc_pl     text        NOT NULL,
  desc_uk     text        NOT NULL,
  price       text        NOT NULL,
  -- NULL  -> unlimited (e.g. cash / "bring your own")
  -- 1..N  -> hard cap on concurrent reservations
  quantity    integer     CHECK (quantity IS NULL OR quantity >= 1),
  sort_order  integer     NOT NULL DEFAULT 0
);

CREATE TABLE housewarming.reservations (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_id     text        NOT NULL
                          REFERENCES housewarming.gifts(id) ON DELETE CASCADE,
  claimer     text        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  -- one person can only reserve a given gift once
  UNIQUE (gift_id, claimer)
);

CREATE INDEX reservations_gift_idx    ON housewarming.reservations (gift_id);
CREATE INDEX reservations_claimer_idx ON housewarming.reservations (claimer);
