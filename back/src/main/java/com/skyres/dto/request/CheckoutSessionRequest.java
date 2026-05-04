package com.skyres.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CheckoutSessionRequest {

    @NotBlank
    @Pattern(regexp = "activity|guide", flags = Pattern.Flag.CASE_INSENSITIVE, message = "type must be activity or guide")
    private String type;

    /** Display / catalogue reference (activity id, guide id, etc.) */
    @Size(max = 64)
    private String refId;

    @NotBlank
    @Size(max = 200)
    private String name;

    /** Total or unit price in USD (Stripe minimum ~$0.50). */
    @NotNull
    @DecimalMin(value = "0.5", message = "amountUsd must be at least 0.5")
    private BigDecimal amountUsd;
}
