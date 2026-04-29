package com.skyres.dto.request;

import lombok.Data;

@Data
public class GuideRequest {
    private Long userId;
    private String languages;
    private Double hourlyRate;
    private Boolean available;
    private String region;
}
