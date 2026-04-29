package com.skyres.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "hotels")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Hotel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String address;

    private int stars;

    private Double pricePerNight;

    private boolean available = true;

    private String photoUrl;

    private Double averageRating;

    @ManyToOne
    @JoinColumn(name = "destination_id")
    private Destination destination;
}
