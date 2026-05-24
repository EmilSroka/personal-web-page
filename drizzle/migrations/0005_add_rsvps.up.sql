-- Insert-only RSVP log. Each row = one person/group declaring intent for one
-- of three options. No update / delete from the UI; host queries directly.

CREATE TABLE housewarming.rsvps (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  -- 'main'  -> 18.07 (default)
  -- 'alt'   -> 13.06 ("posiadówka parapetowa")
  -- 'no'    -> can't make either, wants individual invite
  choice      text        NOT NULL CHECK (choice IN ('main', 'alt', 'no')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX rsvps_choice_idx     ON housewarming.rsvps (choice);
CREATE INDEX rsvps_created_at_idx ON housewarming.rsvps (created_at);
