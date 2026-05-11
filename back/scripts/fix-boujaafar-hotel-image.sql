-- Run in phpMyAdmin on database skyres_db (adjust DB name if yours differs)
USE skyres_db;

UPDATE hotels
SET photo_url = 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80'
WHERE name LIKE '%Boujaafar%';
