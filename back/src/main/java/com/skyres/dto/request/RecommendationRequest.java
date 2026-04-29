package com.skyres.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class RecommendationRequest {
    private Double budget;
    private String season;
    private Integer age;
    private List<String> preferences;
}
