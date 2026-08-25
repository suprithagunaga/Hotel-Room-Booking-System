ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_amount NUMERIC(12,2);
UPDATE bookings b SET total_amount = (b.check_out_date - b.check_in_date) * r.price_per_night FROM rooms r WHERE b.room_id = r.id AND b.total_amount IS NULL;
ALTER TABLE bookings ALTER COLUMN total_amount SET NOT NULL;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_total_amount_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_total_amount_check CHECK (total_amount >= 0);