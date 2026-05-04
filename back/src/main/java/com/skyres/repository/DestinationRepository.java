package com.skyres.repository;

import com.skyres.model.entity.Destination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DestinationRepository
        extends JpaRepository<Destination, Long>, JpaSpecificationExecutor<Destination> {

    // ── Recherche par pays / ville ────────────────────────────────────────────

    List<Destination> findByCountryIgnoreCase(String country);

    List<Destination> findByCityIgnoreCase(String city);

    Optional<Destination> findByCountryIgnoreCaseAndCityIgnoreCase(String country, String city);

    List<Destination> findByCountryContainingIgnoreCaseOrCityContainingIgnoreCase(
            String country, String city);

    // ── Trending ──────────────────────────────────────────────────────────────

    List<Destination> findByTrendingTrue();

    // ── Note moyenne ─────────────────────────────────────────────────────────

    List<Destination> findByAverageRatingGreaterThanEqual(Double minRating);

    // ── Budget estimé ─────────────────────────────────────────────────────────

    List<Destination> findByEstimatedBudgetLessThanEqual(Double maxBudget);

    List<Destination> findByEstimatedBudgetBetween(Double minBudget, Double maxBudget);

    // ── Climat ────────────────────────────────────────────────────────────────

    List<Destination> findByClimateIgnoreCase(String climate);

    // ── Recherche full-text (pays OU ville OU description) ────────────────────

    @Query("""
            SELECT d FROM Destination d
            WHERE LOWER(d.country)     LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(d.city)        LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(d.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
            """)
    List<Destination> search(@Param("keyword") String keyword);

    // ── Filtre combiné ────────────────────────────────────────────────────────

    @Query("""
            SELECT d FROM Destination d
            WHERE (:country    IS NULL OR LOWER(d.country)  LIKE LOWER(CONCAT('%', :country, '%')))
              AND (:climate    IS NULL OR LOWER(d.climate)  = LOWER(:climate))
              AND (:minRating  IS NULL OR d.averageRating   >= :minRating)
              AND (:maxBudget  IS NULL OR d.estimatedBudget <= :maxBudget)
              AND (:trending   IS NULL OR d.trending        = :trending)
            ORDER BY d.averageRating DESC
            """)
    List<Destination> findByFilters(
            @Param("country")   String  country,
            @Param("climate")   String  climate,
            @Param("minRating") Double  minRating,
            @Param("maxBudget") Double  maxBudget,
            @Param("trending")  Boolean trending
    );

    // ── Top destinations par note ─────────────────────────────────────────────

    @Query("""
            SELECT d FROM Destination d
            ORDER BY d.averageRating DESC
            """)
    List<Destination> findTopRated();
}