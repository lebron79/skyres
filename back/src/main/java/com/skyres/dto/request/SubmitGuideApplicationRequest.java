package com.skyres.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SubmitGuideApplicationRequest {

    @NotBlank
    @Size(max = 512)
    private String languages;

    @NotNull
    @Positive
    private Double hourlyRate;

    @NotBlank
    @Size(max = 256)
    private String region;

    @Size(max = 2000)
    private String pitch;
}
