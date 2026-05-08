package com.skyres.repository;

import com.skyres.model.entity.Guide;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GuideRepository extends JpaRepository<Guide, Long> {
    List<Guide> findByAvailableTrue();
    List<Guide> findByRegionContainingIgnoreCase(String region);
    Optional<Guide> findByUserId(Long userId);
}
