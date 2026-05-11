-- Hotels assigned to destinations id 1–6 (Marrakech, Kyoto, Reykjavik, Tunis, Sousse, Hammamet).
-- estimated_budget on destinations = EUR; price_per_night here = TND (د.ت) as in the Java app.
-- Run after destinations exist. Adjust USE if your database name differs.

USE skyres_db;

INSERT INTO hotels (
  name,
  description,
  address,
  stars,
  price_per_night,
  available,
  photo_url,
  average_rating,
  distance_to_center,
  has_outdoor_pool,
  has_indoor_pool,
  has_beach,
  has_parking,
  has_spa,
  has_airport_shuttle,
  has_fitness_center,
  has_bar,
  destination_id
) VALUES
-- ========== 1 Marrakech, Morocco ==========
(
  'Riad Dar Medina',
  'Petit riad restauré dans la médina : terrasse vue Koutoubia, petit-déjeuner marocain, à quelques minutes des souks.',
  'Derb Sidi Bouloukate, Médina, Marrakech 40000, Morocco',
  4,
  420.00,
  1,
  'https://images.unsplash.com/photo-1596436889106-bd35c93a3002?auto=format&fit=crop&w=1200&q=80',
  8.6,
  0.4,
  1, 0, 0, 0, 1, 0, 0, 1,
  1
),
(
  'Atlas Garden Hotel & Spa',
  'Hôtel jardin entre Guéliz et Palmeraie : piscine, spa hammam, navette médina.',
  'Avenue du Président Kennedy, Guéliz, Marrakech 40000, Morocco',
  5,
  890.00,
  1,
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
  9.1,
  2.1,
  1, 1, 0, 1, 1, 1, 1, 1,
  1
),
(
  'Kasbah Agafay Lodge',
  'Lodge pierre et terre face au désert d''Agafay : coucher de soleil, cuisine berbère, excursions dromadaires.',
  'Route d''Agafay, Commune Lalla Takerkoust, Marrakech, Morocco',
  4,
  650.00,
  1,
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
  8.8,
  28.0,
  1, 0, 0, 1, 1, 1, 0, 1,
  1
),

-- ========== 2 Kyoto, Japan ==========
(
  'Gion Higashiyama Ryokan',
  'Ryokan traditionnel près de Yasaka : tatami, onsen intérieur, kaiseki le soir.',
  'Gionmachi Minamigawa, Higashiyama Ward, Kyoto 605-0074, Japan',
  5,
  1200.00,
  1,
  'https://images.unsplash.com/photo-1542640244-7e672d6cef4e?auto=format&fit=crop&w=1200&q=80',
  9.4,
  1.2,
  0, 1, 0, 0, 1, 0, 0, 1,
  2
),
(
  'Kyoto Station Tower Hotel',
  'Face à la gare JR Kyoto : idéal shinkansen, chambres modernes, vue ville.',
  'Shimogyo Ward, Higashishiokoji Kamadonocho, Kyoto 600-8216, Japan',
  4,
  780.00,
  1,
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
  8.5,
  0.1,
  0, 0, 0, 1, 0, 0, 1, 1,
  2
),
(
  'Arashiyama Riverside Inn',
  'Boutique hôtel au bord de la rivière Hozu, proche bambouseraie et pont Togetsukyo.',
  'Sagatenryuji Susukinobabacho, Ukyo Ward, Kyoto 616-8385, Japan',
  4,
  920.00,
  1,
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
  9.0,
  7.5,
  0, 1, 0, 1, 1, 0, 1, 1,
  2
),

-- ========== 3 Reykjavik, Iceland ==========
(
  'Reykjavik Marina Residence',
  'Quartier vieux port : design nordique, proche Harpa et excursions baleines.',
  'Myrargata 2, 101 Reykjavik, Iceland',
  4,
  1100.00,
  1,
  'https://images.unsplash.com/photo-1518548419970-58e03baf8559?auto=format&fit=crop&w=1200&q=80',
  8.9,
  0.8,
  0, 1, 0, 1, 1, 1, 1, 1,
  3
),
(
  'Laugavegur Central Hotel',
  'Sur l''artère principale : cafés, boutiques, Hallgrímskirkja à 10 min à pied.',
  'Laugavegur 120, 101 Reykjavik, Iceland',
  3,
  720.00,
  1,
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
  8.3,
  0.3,
  0, 0, 0, 0, 0, 0, 0, 1,
  3
),
(
  'Blue Lagoon Retreat (Grindavik)',
  'Hôtel spa premium attenant aux sources géothermiques (35 min de Reykjavik).',
  'Nordurljosavegur 11, 240 Grindavik, Iceland',
  5,
  1850.00,
  1,
  'https://images.unsplash.com/photo-1501117716987-c8e1ecb210aa?auto=format&fit=crop&w=1200&q=80',
  9.6,
  47.0,
  1, 1, 0, 1, 1, 1, 1, 1,
  3
),

-- ========== 4 Tunis, Tunisia ==========
(
  'Dar El Medina Tunis',
  'Maison d''hôtes dans la médina de Tunis, près de la Zitouna et du souk.',
  '8 Rue du Pacha, Médina, Tunis 1008, Tunisia',
  4,
  280.00,
  1,
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80',
  8.7,
  0.2,
  1, 0, 0, 0, 0, 1, 0, 1,
  4
),
(
  'Lac Tunis Business Hotel',
  'Lac 2 : vue lac, salles de réunion, idéal affaires et aéroport Tunis-Carthage.',
  'Rue du Lac Biwa, Les Berges du Lac, Tunis 1053, Tunisia',
  4,
  380.00,
  1,
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
  8.4,
  6.0,
  1, 0, 0, 1, 1, 1, 1, 1,
  4
),
(
  'Gammarth Sea View Resort',
  'Resort bord de mer au nord de Tunis : plage privée, piscine, spa.',
  'Route de la Corniche, Gammarth, La Marsa 2078, Tunisia',
  5,
  620.00,
  1,
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
  9.0,
  14.0,
  1, 1, 1, 1, 1, 1, 1, 1,
  4
),

-- ========== 5 Sousse, Tunisia ==========
(
  'Port El Kantaoui Marina Hotel',
  'Face au port de plaisance : plage, golf à proximité, familles bienvenues.',
  'Port El Kantaoui, Sousse 4089, Tunisia',
  4,
  340.00,
  1,
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
  8.5,
  8.0,
  1, 0, 1, 1, 1, 0, 1, 1,
  5
),
(
  'Médina de Sousse Boutique',
  'Petit hôtel rénové dans la médina UNESCO, à deux pas du ribat.',
  'Rue de la Kasbah, Médina, Sousse 4000, Tunisia',
  3,
  220.00,
  1,
  'https://images.unsplash.com/photo-1559592419-3b5ca8b1b3c0?auto=format&fit=crop&w=1200&q=80',
  8.2,
  0.3,
  1, 0, 0, 0, 0, 0, 0, 1,
  5
),
(
  'Sousse Pearl Beach Club',
  'All-inclusive front de mer Boujaafar : animations, piscine, spa.',
  'Boulevard du 14 Janvier, Sousse 4000, Tunisia',
  5,
  480.00,
  1,
  'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?auto=format&fit=crop&w=1200&q=80',
  8.8,
  1.5,
  1, 1, 1, 1, 1, 1, 1, 1,
  5
),

-- ========== 6 Hammamet, Tunisia ==========
(
  'Yasmine Hammamet Beach Resort',
  'Marina Yasmine : plage sable fin, piscines, restaurants sur l''eau.',
  'Rue de la Medina, Yasmine Hammamet 8056, Tunisia',
  5,
  520.00,
  1,
  'https://images.unsplash.com/photo-1561501900-3701fa6a0864?auto=format&fit=crop&w=1200&q=80',
  8.9,
  0.5,
  1, 1, 1, 1, 1, 1, 1, 1,
  6
),
(
  'Hammamet Medina Garden',
  'Jardin méditerranéen, proche médina et fort : calme et charme tunisien.',
  'Avenue Habib Bourguiba, Hammamet 8050, Tunisia',
  4,
  310.00,
  1,
  'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80',
  8.4,
  0.6,
  1, 0, 0, 1, 1, 0, 0, 1,
  6
),
(
  'Citrus Golf Hammamet',
  'Hôtel golf Les Citrons : parcours 18 trous, spa, à 10 min du centre.',
  'Route Touristique, Hammamet Nord 8056, Tunisia',
  5,
  450.00,
  1,
  'https://images.unsplash.com/photo-1584132967334-10e2bd62bc30?auto=format&fit=crop&w=1200&q=80',
  8.7,
  6.0,
  1, 0, 0, 1, 1, 1, 1, 1,
  6
);
