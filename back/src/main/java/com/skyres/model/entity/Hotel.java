package com.skyres.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.util.List;

/**
 * Entité Hotel enrichie avec les champs d'équipements nécessaires aux filtres.
 */
@Entity
@Table(name = "hotels")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Hotel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @NotBlank
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String address;

    @Min(1) @Max(5)
    private int stars;

    @Column(nullable = false)
    private Double pricePerNight;

    private boolean available = true;

    private String photoUrl;

    @DecimalMin("0.0") @DecimalMax("10.0")   // note sur 10
    private Double averageRating;

    // ── Localisation ─────────────────────────────────────────────────────────

    /** Distance au centre-ville en kilomètres. */
    private Double distanceToCenter;

    // ── Équipements (filtres) ─────────────────────────────────────────────────

    /** Piscine extérieure. */
    private boolean hasOutdoorPool;

    /** Piscine intérieure. */
    private boolean hasIndoorPool;

    /** Accès plage. */
    private boolean hasBeach;

    /** Parking disponible. */
    private boolean hasParking;

    /** Spa & centre de bien-être. */
    private boolean hasSpa;

    /** Navette aéroport. */
    private boolean hasAirportShuttle;

    /** Centre de remise en forme / fitness. */
    private boolean hasFitnessCenter;

    /** Bar. */
    private boolean hasBar;

    // ── Relations ─────────────────────────────────────────────────────────────

    @ManyToOne
    @JoinColumn(name = "destination_id")
    private Destination destination;

    @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<RoomType> roomTypes;
}
