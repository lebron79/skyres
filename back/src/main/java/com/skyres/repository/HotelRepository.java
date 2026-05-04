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

    // ─── Filtre par étoiles ─────────────────────────────────────────
    List<Hotel> findByStars(int stars);
    List<Hotel> findByStarsGreaterThanEqual(int minStars);
    List<Hotel> findByStarsBetween(int minStars, int maxStars);

    // ─── Filtre par note (averageRating) ───────────────────────────
    List<Hotel> findByAverageRatingGreaterThanEqual(Double minRating);
    List<Hotel> findByAverageRatingBetween(Double minRating, Double maxRating);

    // ─── Filtre par destination ────────────────────────────────────
    List<Hotel> findByDestinationId(Long destinationId);

    @Query("SELECT h FROM Hotel h WHERE h.destination.id = :destinationId ORDER BY h.averageRating DESC")
    List<Hotel> findTopRatedByDestination(@Param("destinationId") Long destinationId);

    // ─── Filtre par disponibilité ─────────────────────────────────
    List<Hotel> findByAvailable(boolean available);

    // ─── Combinaison étoiles + note ───────────────────────────────
    List<Hotel> findByStarsAndAverageRatingGreaterThanEqual(int stars, Double minRating);
    List<Hotel> findByStarsGreaterThanEqualAndAverageRatingGreaterThanEqual(int minStars, Double minRating);

    // ─── Filtre multi‑critères (JPQL) ─────────────────────────────
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

    // ─── Recherche par prix ───────────────────────────────────────
    List<Hotel> findByPricePerNightBetween(Double minPrice, Double maxPrice);
    List<Hotel> findByPricePerNightLessThanEqual(Double maxPrice);

    // ─── Recherche par nom (insensible à la casse) ────────────────
    List<Hotel> findByNameContainingIgnoreCase(String keyword);
}