package com.skyres.repository;

import com.skyres.model.entity.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HotelRepository
        extends JpaRepository<Hotel, Long>, JpaSpecificationExecutor<Hotel> {

    // ─── Filtre par étoiles ──────────────────────────────────────────────────

    List<Hotel> findByStars(int stars);

    List<Hotel> findByStarsGreaterThanEqual(int minStars);

    List<Hotel> findByStarsBetween(int minStars, int maxStars);

    // ─── Filtre par commentaire client (note moyenne) ────────────────────────
    // Fabuleux  : note >= 9.0
    // Exceptionnel : note >= 9.5
    // Superbe   : note >= 8.0
    // Très bien : note >= 8.4  (chevauchement géré côté service)
    // Bien      : note >= 7.5
    // Agréable  : note >= 6.0

    List<Hotel> findByAverageRatingGreaterThanEqual(Double minRating);

    List<Hotel> findByAverageRatingBetween(Double minRating, Double maxRating);

    // ─── Filtre par destination ──────────────────────────────────────────────

    List<Hotel> findByDestinationId(Long destinationId);

    // ─── Filtre par disponibilité ────────────────────────────────────────────

    List<Hotel> findByAvailable(boolean available);

    // ─── Combinaison étoiles + note ─────────────────────────────────────────

    List<Hotel> findByStarsAndAverageRatingGreaterThanEqual(int stars, Double minRating);

    List<Hotel> findByStarsGreaterThanEqualAndAverageRatingGreaterThanEqual(
            int minStars, Double minRating);

    // ─── Filtres multi-critères via JPQL ─────────────────────────────────────

    /**
     * Filtre complet : destination + étoiles min + note min + disponibilité.
     * Les paramètres facultatifs sont contournés en passant NULL depuis le service.
     */
    @Query("""
            SELECT h FROM Hotel h
            WHERE (:destinationId IS NULL OR h.destination.id = :destinationId)
              AND (:minStars      IS NULL OR h.stars            >= :minStars)
              AND (:maxStars      IS NULL OR h.stars            <= :maxStars)
              AND (:minRating     IS NULL OR h.averageRating    >= :minRating)
              AND (:available     IS NULL OR h.available        = :available)
            ORDER BY h.averageRating DESC
            """)
    List<Hotel> findByFilters(
            @Param("destinationId") Long destinationId,
            @Param("minStars")      Integer minStars,
            @Param("maxStars")      Integer maxStars,
            @Param("minRating")     Double  minRating,
            @Param("available")     Boolean available
    );

    // ─── Prix ────────────────────────────────────────────────────────────────

    List<Hotel> findByPricePerNightBetween(Double minPrice, Double maxPrice);

    List<Hotel> findByPricePerNightLessThanEqual(Double maxPrice);

    // ─── Recherche par nom ───────────────────────────────────────────────────

    List<Hotel> findByNameContainingIgnoreCase(String keyword);

    // ─── Top hôtels d'une destination par note ───────────────────────────────

    @Query("""
            SELECT h FROM Hotel h
            WHERE h.destination.id = :destinationId
              AND h.available = true
            ORDER BY h.averageRating DESC
            """)
    List<Hotel> findTopRatedByDestination(@Param("destinationId") Long destinationId);
}
