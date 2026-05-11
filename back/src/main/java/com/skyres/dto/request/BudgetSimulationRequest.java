package com.skyres.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class BudgetSimulationRequest {

    @NotNull
    private Long hotelId;

    @NotNull
    private LocalDate checkIn;

    @NotNull
    private LocalDate checkOut;

    @Min(1)
    private int numberOfPersons;

    private String couponCode;

    /** Optional second code — allowed in simulation only when userId has zero prior reservations. */
    private String secondCouponCode;

    /** When set, used with reservation count to allow stacking two codes in the preview. */
    private Long userId;
}