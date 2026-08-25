INSERT INTO rooms (room_number, room_type, capacity, price_per_night, description, image_url)
VALUES
  ('101', 'Coastal King', 2, 2850.00, 'A calm, sunlit retreat with a king bed, linen textures, and a private terrace overlooking the gardens.', 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=85'),
  ('202', 'Garden Suite', 3, 3900.00, 'An expansive suite with a separate lounge, deep soaking tub, and views across the quiet courtyard.', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=85'),
  ('303', 'Skyline Studio', 2, 3250.00, 'A high-floor studio designed for slow mornings, with a generous work nook and city-facing windows.', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85'),
  ('404', 'Family Residence', 5, 4750.00, 'A generous two-zone residence for longer stays, with flexible sleeping space and a warm, residential feel.', 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=85')
ON CONFLICT (room_number) DO NOTHING;
