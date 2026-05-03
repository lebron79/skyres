package com.skyres.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String type; // ex: "Normal", "Suite", "Deluxe"

    @Column(nullable = false)
    private Double pricePerNight;

    // nombre de chambres de ce type (ex: 20 chambres "Suite")
    private Integer capacite;

    // relation avec l’hôtel
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;

}
