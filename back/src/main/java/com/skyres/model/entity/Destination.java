package com.skyres.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "destinations")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Destination {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String country;

    @Column(nullable = false)
    private String city;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String imageUrl;

    private String climate;

    private Double estimatedBudget;

    private Double averageRating;

    private boolean trending = false;
}
