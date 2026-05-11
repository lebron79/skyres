-- ═══════════════════════════════════════════════════════════════════════════
-- Seed: guides (with profile photos) + activities (with hero images)
-- ═══════════════════════════════════════════════════════════════════════════
-- Prerequisites:
--   • Database exists (default: skyres_db).
--   • Destinations with ids 1–6 already exist, in this order (same as seed-hotels-by-destination.sql):
--       1 Marrakech  2 Kyoto  3 Reykjavik  4 Tunis  5 Sousse  6 Hammamet
--   • If your destination ids differ, change destination_id in the activities INSERTs.
--
-- Demo guide logins — same password for every row below:
--   Plaintext password:  password
--   (BCrypt $2a$, Spring Security BCryptPasswordEncoder compatible)
--
-- Run:
--   mysql -u root skyres_db < scripts/seed-guides-and-activities.sql
-- ═══════════════════════════════════════════════════════════════════════════

USE skyres_db;

SET @pwd := '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

-- ── Guide users (role GUIDE, photo_url = public HTTPS images) ───────────────
INSERT INTO users (first_name, last_name, email, password, phone, bio, role, photo_url, email_verified, created_at) VALUES
('Youssef', 'Alami', 'guide.youssef.alami@skyres.seed', @pwd, '+212600000001', 'Born in the medina — souks, palaces, and hidden courtyard cafés. History graduate; fluent Darija, French, English.', 'GUIDE', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80', 1, UTC_TIMESTAMP()),
('Amina', 'Benomar', 'guide.amina.benomar@skyres.seed', @pwd, '+212600000002', 'Food & photography walks in Guéliz and the Palmeraie. I focus on craft cooperatives and sunset viewpoints.', 'GUIDE', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80', 1, UTC_TIMESTAMP()),
('Kenji', 'Yamamoto', 'guide.kenji.yamamoto@skyres.seed', @pwd, '+81800000001', 'Licensed Kyoto guide: temples, tea houses, and Philosopher''s Path without the crowds. JP / EN.', 'GUIDE', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80', 1, UTC_TIMESTAMP()),
('Sakura', 'Tanaka', 'guide.sakura.tanaka@skyres.seed', @pwd, '+81800000002', 'Geisha district etiquette, seasonal festivals, and vegetarian shojin ryori introductions.', 'GUIDE', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=600&q=80', 1, UTC_TIMESTAMP()),
('Erik', 'Jónsson', 'guide.erik.jonsson@skyres.seed', @pwd, '+3545000001', 'Glacier guides + northern lights planning. Safety-first 4x4 and photography stops.', 'GUIDE', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80', 1, UTC_TIMESTAMP()),
('Freya', 'Magnusdóttir', 'guide.freya.magnus@skyres.seed', @pwd, '+3545000002', 'Hot springs, whale watching windows, and Reykjanes geology — relaxed pacing for families.', 'GUIDE', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80', 1, UTC_TIMESTAMP()),
('Karim', 'Hached', 'guide.karim.hached@skyres.seed', @pwd, '+21620000001', 'Carthage & Bardo deep dives; Mediterranean street food in La Goulette.', 'GUIDE', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80', 1, UTC_TIMESTAMP()),
('Salma', 'Trabelsi', 'guide.salma.trabelsi@skyres.seed', @pwd, '+21620000002', 'Sidi Bou Said blue lanes, café culture, and contemporary Tunis art spaces.', 'GUIDE', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80', 1, UTC_TIMESTAMP()),
('Mehdi', 'Sassi', 'guide.mehdi.sassi@skyres.seed', @pwd, '+21670000001', 'Port El Kantaoui marina, olive farms, and family-friendly beach logistics.', 'GUIDE', 'https://images.unsplash.com/photo-1519345182560-a3dcb9875fbb?auto=format&fit=crop&w=600&q=80', 1, UTC_TIMESTAMP()),
('Leïla', 'Gharbi', 'guide.leila.gharbi@skyres.seed', @pwd, '+21670000002', 'Yasmine Hammamet medina replica + cartage day-trip combos from the coast.', 'GUIDE', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80', 1, UTC_TIMESTAMP()),
('Marco', 'Rossi', 'guide.marco.rossi@skyres.seed', @pwd, '+39333000001', 'Euro-city walking tours — architecture, espresso bars, and evening aperitivo routes.', 'GUIDE', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80', 1, UTC_TIMESTAMP()),
('Priya', 'Nair', 'guide.priya.nair@skyres.seed', @pwd, '+91980000001', 'Spice markets, heritage walks, and sustainable tourism tips for coastal heritage towns.', 'GUIDE', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a3?auto=format&fit=crop&w=600&q=80', 1, UTC_TIMESTAMP());

-- ── Guide profiles (one row per user above) ─────────────────────────────────
INSERT INTO guides (user_id, languages, hourly_rate, available, region, average_rating)
SELECT id, 'Arabic, French, English', 48.00, 1, 'Marrakech', 4.85 FROM users WHERE email = 'guide.youssef.alami@skyres.seed';
INSERT INTO guides (user_id, languages, hourly_rate, available, region, average_rating)
SELECT id, 'French, English, Spanish', 52.00, 1, 'Marrakech & Atlas', 4.92 FROM users WHERE email = 'guide.amina.benomar@skyres.seed';
INSERT INTO guides (user_id, languages, hourly_rate, available, region, average_rating)
SELECT id, 'Japanese, English', 65.00, 1, 'Kyoto', 4.95 FROM users WHERE email = 'guide.kenji.yamamoto@skyres.seed';
INSERT INTO guides (user_id, languages, hourly_rate, available, region, average_rating)
SELECT id, 'Japanese, English, Korean', 58.00, 1, 'Kyoto & Nara', 4.88 FROM users WHERE email = 'guide.sakura.tanaka@skyres.seed';
INSERT INTO guides (user_id, languages, hourly_rate, available, region, average_rating)
SELECT id, 'Icelandic, English', 72.00, 1, 'Reykjavik & South Coast', 4.90 FROM users WHERE email = 'guide.erik.jonsson@skyres.seed';
INSERT INTO guides (user_id, languages, hourly_rate, available, region, average_rating)
SELECT id, 'Icelandic, English, German', 68.00, 1, 'Reykjavik & Snæfellsnes', 4.87 FROM users WHERE email = 'guide.freya.magnus@skyres.seed';
INSERT INTO guides (user_id, languages, hourly_rate, available, region, average_rating)
SELECT id, 'Arabic, French, English', 42.00, 1, 'Tunis & Carthage', 4.80 FROM users WHERE email = 'guide.karim.hached@skyres.seed';
INSERT INTO guides (user_id, languages, hourly_rate, available, region, average_rating)
SELECT id, 'Arabic, French, English, Italian', 45.00, 1, 'Tunis & Sidi Bou Said', 4.83 FROM users WHERE email = 'guide.salma.trabelsi@skyres.seed';
INSERT INTO guides (user_id, languages, hourly_rate, available, region, average_rating)
SELECT id, 'Arabic, French, English', 38.00, 1, 'Sousse & El Kantaoui', 4.78 FROM users WHERE email = 'guide.mehdi.sassi@skyres.seed';
INSERT INTO guides (user_id, languages, hourly_rate, available, region, average_rating)
SELECT id, 'Arabic, French, English', 40.00, 1, 'Hammamet & Cap Bon', 4.81 FROM users WHERE email = 'guide.leila.gharbi@skyres.seed';
INSERT INTO guides (user_id, languages, hourly_rate, available, region, average_rating)
SELECT id, 'Italian, English, French', 55.00, 1, 'EU city breaks', 4.79 FROM users WHERE email = 'guide.marco.rossi@skyres.seed';
INSERT INTO guides (user_id, languages, hourly_rate, available, region, average_rating)
SELECT id, 'English, Hindi, Tamil', 44.00, 1, 'Coastal heritage', 4.84 FROM users WHERE email = 'guide.priya.nair@skyres.seed';

-- ── Activities (image_url + destination_id) ─────────────────────────────────
-- destination_id: 1 Marrakech, 2 Kyoto, 3 Reykjavik, 4 Tunis, 5 Sousse, 6 Hammamet

INSERT INTO activities (name, type, description, price, season, min_age, image_url, destination_id) VALUES
(
  'Sunrise Hot Air Balloon — Palmeraie',
  'Aerial',
  'Float over palm groves and Atlas foothills at dawn; hotel pickup, Berber breakfast, and champagne toast on landing.',
  185.00,
  'Oct – Apr',
  8,
  'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?auto=format&fit=crop&w=1200&q=80',
  1
),
(
  'Medina Night Food Safari',
  'Culinary',
  'Tagines, snail soup stalls, and honey pastries — small groups, hygiene-forward vendors only.',
  55.00,
  'Year-round',
  12,
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80',
  1
),
(
  'Atlas Mountains Day Trek',
  'Hiking',
  'Villages, waterfalls, and optional mule assist; lunch with a local family.',
  72.00,
  'Mar – Nov',
  10,
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
  1
),
(
  'Agafay Desert Sunset & Stargazing',
  'Excursion',
  'Campfire dinner, live gnawa rhythms, and telescope session when skies are clear.',
  95.00,
  'Year-round',
  6,
  'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1200&q=80',
  1
),
(
  'Fushimi Inari Dawn Walk',
  'Culture',
  'Beat the crowds at the torii gates; history of Inari worship and forest loops.',
  48.00,
  'Year-round',
  8,
  'https://images.unsplash.com/photo-1478436120817-70763b825262?auto=format&fit=crop&w=1200&q=80',
  2
),
(
  'Tea Ceremony & Machiya Visit',
  'Culture',
  'Private whisked matcha in a wooden townhouse; kimono etiquette mini-lesson.',
  95.00,
  'Year-round',
  12,
  'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1200&q=80',
  2
),
(
  'Arashiyama Bamboo & River Boat',
  'Nature',
  'Bamboo grove timing tips, monkey park option, and traditional boat row on Hozu.',
  62.00,
  'Mar – Nov',
  6,
  'https://images.unsplash.com/photo-1624253328446-0cf29d12722c?auto=format&fit=crop&w=1200&q=80',
  2
),
(
  'Golden Pavilion Photography Route',
  'Photography',
  'Mirror pond reflections, quiet garden angles, and nearby Zen rock gardens.',
  42.00,
  'Year-round',
  10,
  'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1200&q=80',
  2
),
(
  'Golden Circle Express',
  'Excursion',
  'Geysir, Gullfoss, and Þingvellir with paced photo stops and local bakeries.',
  119.00,
  'Year-round',
  5,
  'https://images.unsplash.com/photo-1520637836862-4d19769929fa?auto=format&fit=crop&w=1200&q=80',
  3
),
(
  'Blue Lagoon Premium Entry Package',
  'Wellness',
  'Timed entry, silica masks, drink voucher — logistics handled start to finish.',
  135.00,
  'Year-round',
  12,
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
  3
),
(
  'Northern Lights Hunt — Super Jeep',
  'Astronomy',
  'Heated vehicle, tripods, hot chocolate, and flexible routing by forecast.',
  165.00,
  'Sep – Mar',
  8,
  'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1200&q=80',
  3
),
(
  'South Coast Waterfalls & Black Sand Beach',
  'Nature',
  'Skógafoss, Reynisfjara safety briefing, and Vik village stop.',
  149.00,
  'May – Sep',
  6,
  'https://images.unsplash.com/photo-1504893524553-b855314adc06?auto=format&fit=crop&w=1200&q=80',
  3
),
(
  'Carthage Ruins & Byrsa Hill',
  'History',
  'Punic ports, Roman baths, and panoramic views over the Gulf of Tunis.',
  38.00,
  'Year-round',
  10,
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
  4
),
(
  'Tunis Medina Artisan Crawl',
  'Shopping',
  'Copper, perfumes, and textiles — fixed-price allies and fair bargaining coaching.',
  32.00,
  'Year-round',
  14,
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
  4
),
(
  'Sidi Bou Said & Café des Délices',
  'Culture',
  'Blue-and-white lanes, Andalusian gardens, cliffside mint tea.',
  45.00,
  'Year-round',
  8,
  'https://images.unsplash.com/photo-1565008576549-57569a49371d?auto=format&fit=crop&w=1200&q=80',
  4
),
(
  'Sousse Ribat & Archaeological Museum',
  'History',
  'Fortress ramparts, mosaic halls, and medina spice-market finale.',
  28.00,
  'Year-round',
  8,
  'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1200&q=80',
  5
),
(
  'Port El Kantaoui Catamaran Cruise',
  'Boating',
  'Half-day sail with swim stop; snacks and soft drinks included.',
  59.00,
  'May – Sep',
  6,
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
  5
),
(
  'Friguia Park Family Safari Mini-Van',
  'Wildlife',
  'Lions, giraffes, and educational keeper talk — shaded paths for kids.',
  41.00,
  'Year-round',
  4,
  'https://images.unsplash.com/photo-1549366027-029f659908ed?auto=format&fit=crop&w=1200&q=80',
  5
),
(
  'Hammamet Medina Pottery Workshop',
  'Workshop',
  'Hands-on bowl throwing and kiln tour with café breaks.',
  36.00,
  'Year-round',
  10,
  'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80',
  6
),
(
  'Yasmine Beach Horseback at Sunset',
  'Outdoor',
  'Gentle horses for beginners; helmet and guide included.',
  52.00,
  'Apr – Oct',
  12,
  'https://images.unsplash.com/photo-1516026672322-bc52d6a86e84?auto=format&fit=crop&w=1200&q=80',
  6
),
(
  'Cap Bon Winery & Olive Oil Tasting',
  'Culinary',
  'Cellar walk-through, three wines, and olive oil pairing board.',
  47.00,
  'Apr – Oct',
  18,
  'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80',
  6
),
(
  'Jet Ski Circuit — Yasmine Bay',
  'Watersports',
  'Safety briefing, instructor-led circuit, life jackets.',
  68.00,
  'Jun – Sep',
  16,
  'https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=1200&q=80',
  6
);
