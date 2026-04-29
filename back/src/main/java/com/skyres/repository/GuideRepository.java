package com.skyres.repository;

import com.skyres.model.entity.Guide;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GuideRepository extends JpaRepository<Guide, Long> {
    List<Guide> findByAvailableTrue();
    List<Guide> findByRegionContainingIgnoreCase(String region);
}
