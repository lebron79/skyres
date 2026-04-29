package com.skyres.dto.request;

import lombok.Data;

@Data
public class ActivityRequest {
    private String name;
    private String type;
    private String description;
    private Double price;
    private String season;
    private Integer minAge;
    private String imageUrl;
    private Long destinationId;
}
