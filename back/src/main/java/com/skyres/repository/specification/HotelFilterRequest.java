package com.skyres.repository.specification;
/**
 * DTO de filtre passé à {@link HotelSpecification#build(HotelFilterRequest)}.
 *
 * <p>Tous les champs sont optionnels (null = pas de filtre sur ce critère).</p>
 *
 * <h3>Catégories de note client</h3>
 * <pre>
 *   Fabuleux      minRating = 9.0
 *   Exceptionnel  minRating = 9.5
 *   Superbe       minRating = 8.0
 *   Très bien     minRating = 8.4
 *   Bien          minRating = 7.5
 *   Agréable      minRating = 6.0
 * </pre>
 *
 * Exemple d'utilisation depuis le controller :
 * <pre>{@code
 *   HotelFilterRequest filter = new HotelFilterRequest(
 *       1L,    // destinationId
 *       3, 5,  // étoiles 3 à 5
 *       8.0,   // Superbe ou mieux
 *       true,  // piscine extérieure
 *       false, // pas de piscine intérieure
 *       false, // pas de plage
 *       true,  // parking
 *       true,  // spa
 *       false, // pas de navette aéroport
 *       true,  // salle de sport
 *       true,  // bar
 *       5.0,   // max 5 km du centre
 *       null, null, // pas de filtre prix
 *       null        // pas de filtre nom
 *   );
 *   List<Hotel> results = hotelRepository.findAll(HotelSpecification.build(filter));
 * }</pre>
 */

public record HotelFilterRequest(
        // ── Localisation ─────────────────────────────────────────────────────
        Long    destinationId,

        // ── Étoiles ──────────────────────────────────────────────────────────
        Integer minStars,
        Integer maxStars,

        // ── Note client ───────────────────────────────────────────────────────
        // Passer la valeur seuil correspondant à la catégorie choisie :
        //   Fabuleux=9.0 | Exceptionnel=9.5 | Superbe=8.0
        //   Très bien=8.4 | Bien=7.5 | Agréable=6.0
        Double  minRating,

        // ── Équipements ───────────────────────────────────────────────────────
        Boolean outdoorPool,        // Piscine extérieure
        Boolean indoorPool,         // Piscine intérieure
        Boolean beach,              // Plage
        Boolean parking,            // Parking
        Boolean spa,                // Spa & centre de bien-être
        Boolean airportShuttle,     // Navette aéroport
        Boolean fitnessCenter,      // Centre de remise en forme
        Boolean bar,                // Bar

        // ── Distance au centre ────────────────────────────────────────────────
        Double  maxDistanceKm,      // ex : 2.0 → dans un rayon de 2 km

        // ── Prix ─────────────────────────────────────────────────────────────
        Double  minPrice,
        Double  maxPrice,

        // ── Recherche libre ───────────────────────────────────────────────────
        String  keyword
) {}
