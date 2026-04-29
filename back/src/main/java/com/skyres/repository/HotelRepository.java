package com.skyres.repository;

import com.skyres.model.entity.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HotelRepository extends JpaRepository<Hotel, Long> {
    List<Hotel> findByDestinationId(Long destinationId);
    List<Hotel> findByAvailableTrue();
    List<Hotel> findByStarsGreaterThanEqual(int stars);
    List<Hotel> findByPricePerNightLessThanEqual(Double maxPrice);
}
