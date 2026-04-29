package com.skyres.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "activities")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String type;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Double price;

    private String season;

    private int minAge;

    private String imageUrl;

    @ManyToOne
    @JoinColumn(name = "destination_id")
    private Destination destination;
}
