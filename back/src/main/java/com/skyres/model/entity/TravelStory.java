package com.skyres.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "travel_stories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TravelStory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String displayName;

    @Column(nullable = false, length = 160)
    private String locationLabel;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String storyText;

    @Column(nullable = false)
    private Integer stars;

    /** Hex colour for avatar ring */
    @Column(length = 16)
    private String avatarColor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
