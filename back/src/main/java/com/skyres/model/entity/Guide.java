package com.skyres.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "guides")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Guide {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String languages;

    private Double hourlyRate;

    private boolean available = true;

    private String region;

    private Double averageRating;
}
