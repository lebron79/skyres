package com.skyres.model.entity;

import com.skyres.model.enums.GuideApplicationStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "guide_applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GuideApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 512)
    private String languages;

    @Column(nullable = false)
    private Double hourlyRate;

    @Column(nullable = false, length = 256)
    private String region;

    @Column(length = 2000)
    private String pitch;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private GuideApplicationStatus status = GuideApplicationStatus.PENDING;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime processedAt;

    @Column(length = 1000)
    private String rejectionReason;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
