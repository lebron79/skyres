package com.skyres.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityAiSuggestionResponse {
    private String type;
    private String description;
    private Double price;
    private String season;
    private Integer minAge;
}
