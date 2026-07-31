/*
# Places: add sub_type column for sub-categories

1. Changes
   - Add sub_type (text) column to places. Default 'Others'.
   - Existing places get sub_type 'Attractions' (their previous category).

2. Security
   - No RLS changes. Existing policies remain.

3. Notes
   - The main category column (Kuala Lumpur / Langkawi / Others) is unchanged.
   - sub_type holds: Cafes, Malls, Attractions, Parks, Hotels, Others.
*/

ALTER TABLE places ADD COLUMN IF NOT EXISTS sub_type text NOT NULL DEFAULT 'Others';

UPDATE places SET sub_type = 'Attractions' WHERE sub_type = 'Others';
