package com.skyres.repository;

import com.skyres.model.entity.Destination;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DestinationRepository extends JpaRepository<Destination, Long> {
    List<Destination> findByCountryContainingIgnoreCase(String country);
    List<Destination> findByTrendingTrue();
    List<Destination> findByEstimatedBudgetLessThanEqual(Double maxBudget);
}
