-- Reverses 0003_seed_wishlist.up.sql. Reservations cascade automatically.

DELETE FROM housewarming.gifts WHERE id IN (
  '9e514276-7926-4b0a-baec-317c0c7de1e4',
  'd6844dae-2584-449c-acd3-f7b3b507cf2c',
  '46058ee4-2bdc-4ae9-b821-1789f96c8634',
  '96ac497b-d97c-4789-a8f6-eed490aec348',
  '668cb8e9-2678-4ca2-afff-1119bb190c6c',
  '62357bbc-1196-4684-82dc-4a5acae42477',
  '33db6965-825c-4e1e-85f3-bbc9a8dabb6f',
  'a3dd14af-7189-42e5-b83a-55b18718f5b7',
  '5f6194a9-bf1d-42f8-88e4-d88ec0f34c0e',
  '9914d056-8584-4478-bf91-3a0c5884dbb1',
  '9baef3dc-536f-4f9b-a4af-57966d5b13ce',
  '53e72d60-99a3-4900-94e6-d4fa2160d4bb',
  'beece97d-66d5-42d8-b620-3fdf1bfaba54',
  '76141216-f5d9-48cc-a2ec-dd796eb4adac',
  '2f8a9b93-735e-4820-91a8-0a8a9ea39883',
  '12ee535b-a910-49d1-b621-a6205587d28f',
  'c1ed7dbf-a69b-42e3-9d38-d1cba74141c0',
  '74a63aa6-8105-4432-a90b-4bdb3494804e',
  'c9d91a34-2d64-427e-9475-bb96dcd93395',
  '3904a20e-93f5-4a73-8ff4-126f43ac9390'
);
