package com.skyres.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BudgetSimulationResponse {
    private String hotelName;
    private String destinationCity;
    private String destinationCountry;
    private int numberOfNights;
    private int numberOfPersons;
    private Double pricePerNight;
    /** Hotel nights × price × persons (TND). */
    private Double hotelStaySubtotal;
    /** Destination package from profile (TND, converted from EUR budget once per stay). */
    private Double destinationPackageFee;
    /** hotelStaySubtotal + destinationPackageFee (TND). */
    private Double subtotal;
    private Double discount;
    private Double total;
    private String couponApplied;
}