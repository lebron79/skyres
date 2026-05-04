package com.skyres.repository;

import com.skyres.model.entity.TravelStory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TravelStoryRepository extends JpaRepository<TravelStory, Long> {

    List<TravelStory> findAllByOrderByCreatedAtDesc();
}
