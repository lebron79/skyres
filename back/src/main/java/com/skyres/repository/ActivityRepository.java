package com.skyres.repository;

import com.skyres.model.entity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByDestinationId(Long destinationId);
    List<Activity> findByType(String type);
    List<Activity> findBySeason(String season);
    List<Activity> findByPriceLessThanEqual(Double maxPrice);
}
