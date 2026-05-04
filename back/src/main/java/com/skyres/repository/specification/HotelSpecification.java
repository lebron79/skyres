package com.skyres.repository.specification;

import com.skyres.model.entity.Hotel;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

/**
 * Specifications dynamiques pour {@link Hotel}.
 *
 * <p>Filtres supportés :</p>
 * <ul>
 *   <li>Hôtel (nom, destination)</li>
 *   <li>Étoiles (min / max)</li>
 *   <li>Note client :
 *     <ul>
 *       <li>Fabuleux      ≥ 9.0</li>
 *       <li>Exceptionnel  ≥ 9.5</li>
 *       <li>Superbe       ≥ 8.0</li>
 *       <li>Très bien     ≥ 8.4</li>
 *       <li>Bien          ≥ 7.5</li>
 *       <li>Agréable      ≥ 6.0</li>
 *     </ul>
 *   </li>
 *   <li>Piscine intérieure / extérieure / plage</li>
 *   <li>Parking</li>
 *   <li>Spa & centre de bien-être</li>
 *   <li>Distance au centre (km)</li>
 *   <li>Navette aéroport</li>
 *   <li>Centre de remise en forme</li>
 *   <li>Bar</li>
 * </ul>
 *
 * <p><strong>Prérequis :</strong> ajoutez les colonnes booléennes et
 * {@code distanceToCenter} à l'entité {@link Hotel} (voir commentaires ci-dessous).</p>
 */
public class HotelSpecification {

    /*
     * =========================================================
     * CHAMPS À AJOUTER dans l'entité Hotel pour les équipements
     * =========================================================
     *
     *   private boolean hasIndoorPool;
     *   private boolean hasOutdoorPool;
     *   private boolean hasBeach;
     *   private boolean hasParking;
     *   private boolean hasSpa;
     *   private boolean hasAirportShuttle;
     *   private boolean hasFitnessCenter;
     *   private boolean hasBar;
     *   private Double  distanceToCenter;   // en kilomètres
     */

    private HotelSpecification() {}

    // ── Catégories de note client ────────────────────────────────────────────

    public enum RatingCategory {
        FABULEUX(9.0),
        EXCEPTIONNEL(9.5),
        SUPERBE(8.0),
        TRES_BIEN(8.4),
        BIEN(7.5),
        AGREABLE(6.0);

        public final double minRating;

        RatingCategory(double minRating) {
            this.minRating = minRating;
        }
    }

    // ── Méthodes de Specification ────────────────────────────────────────────

    public static Specification<Hotel> hasMinStars(Integer minStars) {
        return (root, query, cb) ->
                minStars == null ? null : cb.greaterThanOrEqualTo(root.get("stars"), minStars);
    }

    public static Specification<Hotel> hasMaxStars(Integer maxStars) {
        return (root, query, cb) ->
                maxStars == null ? null : cb.lessThanOrEqualTo(root.get("stars"), maxStars);
    }

    public static Specification<Hotel> hasExactStars(Integer stars) {
        return (root, query, cb) ->
                stars == null ? null : cb.equal(root.get("stars"), stars);
    }

    /** Filtre par catégorie de note (Fabuleux, Exceptionnel, Superbe…) */
    public static Specification<Hotel> hasRatingCategory(RatingCategory category) {
        return (root, query, cb) ->
                category == null ? null
                        : cb.greaterThanOrEqualTo(root.get("averageRating"), category.minRating);
    }

    public static Specification<Hotel> hasMinRating(Double minRating) {
        return (root, query, cb) ->
                minRating == null ? null
                        : cb.greaterThanOrEqualTo(root.get("averageRating"), minRating);
    }

    public static Specification<Hotel> isAvailable() {
        return (root, query, cb) -> cb.isTrue(root.get("available"));
    }

    public static Specification<Hotel> hasDestination(Long destinationId) {
        return (root, query, cb) ->
                destinationId == null ? null
                        : cb.equal(root.get("destination").get("id"), destinationId);
    }

    public static Specification<Hotel> nameLike(String keyword) {
        return (root, query, cb) ->
                keyword == null || keyword.isBlank() ? null
                        : cb.like(cb.lower(root.get("name")), "%" + keyword.toLowerCase() + "%");
    }

    // ── Équipements ──────────────────────────────────────────────────────────

    public static Specification<Hotel> hasIndoorPool(Boolean required) {
        return (root, query, cb) ->
                Boolean.TRUE.equals(required) ? cb.isTrue(root.get("hasIndoorPool")) : null;
    }

    public static Specification<Hotel> hasOutdoorPool(Boolean required) {
        return (root, query, cb) ->
                Boolean.TRUE.equals(required) ? cb.isTrue(root.get("hasOutdoorPool")) : null;
    }

    public static Specification<Hotel> hasBeach(Boolean required) {
        return (root, query, cb) ->
                Boolean.TRUE.equals(required) ? cb.isTrue(root.get("hasBeach")) : null;
    }

    public static Specification<Hotel> hasParking(Boolean required) {
        return (root, query, cb) ->
                Boolean.TRUE.equals(required) ? cb.isTrue(root.get("hasParking")) : null;
    }

    public static Specification<Hotel> hasSpa(Boolean required) {
        return (root, query, cb) ->
                Boolean.TRUE.equals(required) ? cb.isTrue(root.get("hasSpa")) : null;
    }

    public static Specification<Hotel> hasAirportShuttle(Boolean required) {
        return (root, query, cb) ->
                Boolean.TRUE.equals(required) ? cb.isTrue(root.get("hasAirportShuttle")) : null;
    }

    public static Specification<Hotel> hasFitnessCenter(Boolean required) {
        return (root, query, cb) ->
                Boolean.TRUE.equals(required) ? cb.isTrue(root.get("hasFitnessCenter")) : null;
    }

    public static Specification<Hotel> hasBar(Boolean required) {
        return (root, query, cb) ->
                Boolean.TRUE.equals(required) ? cb.isTrue(root.get("hasBar")) : null;
    }

    /** Distance maximale au centre-ville en kilomètres. */
    public static Specification<Hotel> withinDistanceToCenter(Double maxKm) {
        return (root, query, cb) ->
                maxKm == null ? null
                        : cb.lessThanOrEqualTo(root.get("distanceToCenter"), maxKm);
    }

    // ── Fourchette de prix ───────────────────────────────────────────────────

    public static Specification<Hotel> priceBetween(Double minPrice, Double maxPrice) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (minPrice != null) predicates.add(cb.greaterThanOrEqualTo(root.get("pricePerNight"), minPrice));
            if (maxPrice != null) predicates.add(cb.lessThanOrEqualTo(root.get("pricePerNight"), maxPrice));
            return predicates.isEmpty() ? null : cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    // ── Builder de filtre combiné ────────────────────────────────────────────

    /**
     * Construit une {@link Specification} combinant tous les critères de recherche.
     *
     * @param filter objet DTO portant les critères (voir {@link HotelFilterRequest})
     * @return Specification prête à passer dans {@code hotelRepository.findAll(spec)}
     */
    public static Specification<Hotel> build(HotelFilterRequest filter) {
        return Specification.where(isAvailable())
                .and(hasDestination(filter.destinationId()))
                .and(hasMinStars(filter.minStars()))
                .and(hasMaxStars(filter.maxStars()))
                .and(hasMinRating(filter.minRating()))
                .and(hasIndoorPool(filter.indoorPool()))
                .and(hasOutdoorPool(filter.outdoorPool()))
                .and(hasBeach(filter.beach()))
                .and(hasParking(filter.parking()))
                .and(hasSpa(filter.spa()))
                .and(hasAirportShuttle(filter.airportShuttle()))
                .and(hasFitnessCenter(filter.fitnessCenter()))
                .and(hasBar(filter.bar()))
                .and(withinDistanceToCenter(filter.maxDistanceKm()))
                .and(priceBetween(filter.minPrice(), filter.maxPrice()))
                .and(nameLike(filter.keyword()));
    }
}
