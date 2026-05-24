-- A gift can advertise an "alternative" purchase option (cheaper variant, same
-- vibe). Stored inline rather than as its own row because alternatives aren't
-- reservable — they're just a price/link the UI links to.

ALTER TABLE housewarming.gifts
  ADD COLUMN alt_price    text,
  ADD COLUMN alt_shop_url text;
