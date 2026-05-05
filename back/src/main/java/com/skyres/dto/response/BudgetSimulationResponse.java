package com.skyres.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BudgetSimulationResponse {
    private String hotelName;
    private int numberOfNights;
    private int numberOfPersons;
    private Double pricePerNight;
    private Double subtotal;
    private Double discount;
    private Double total;
    private String couponApplied;
}