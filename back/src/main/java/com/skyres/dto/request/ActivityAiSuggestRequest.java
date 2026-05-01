package com.skyres.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ActivityAiSuggestRequest {
    @NotBlank(message = "Activity name is required")
    private String name;
}
