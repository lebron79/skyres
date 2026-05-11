package com.skyres.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RejectGuideApplicationRequest {

    @Size(max = 1000)
    private String reason;
}
