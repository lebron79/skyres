package com.skyres.repository;

import com.skyres.model.entity.GuideApplication;
import com.skyres.model.enums.GuideApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GuideApplicationRepository extends JpaRepository<GuideApplication, Long> {

    boolean existsByUserIdAndStatus(Long userId, GuideApplicationStatus status);

    Optional<GuideApplication> findTopByUserIdOrderByCreatedAtDesc(Long userId);

    List<GuideApplication> findByStatusOrderByCreatedAtAsc(GuideApplicationStatus status);
}
