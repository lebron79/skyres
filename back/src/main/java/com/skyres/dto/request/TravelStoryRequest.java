package com.skyres.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TravelStoryRequest {

    @NotBlank
    @Size(max = 120)
    private String displayName;

    @NotBlank
    @Size(max = 160)
    private String locationLabel;

    @NotBlank
    @Size(min = 20, max = 2000)
    private String storyText;

    @Min(1)
    @Max(5)
    private Integer stars;
}
