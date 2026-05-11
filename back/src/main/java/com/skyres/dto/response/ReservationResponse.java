package com.skyres.dto.response;

import com.skyres.model.enums.ReservationStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class ReservationResponse {
    private Long id;
    private Long userId;
    private String userFullName;
    private Long hotelId;
    private String hotelName;
    /** City from hotel's destination (for UI summaries). */
    private String destinationCity;
    /** Country from hotel's destination (for UI summaries). */
    private String destinationCountry;
    /** Hotel's destination id when linked. */
    private Long destinationId;
    /** Nights × (hotel TND rate → EUR) × persons (EUR). */
    private Double hotelStaySubtotal;
    /** Destination profile budget, once per stay (EUR). */
    private Double destinationPackageFee;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private int numberOfPersons;
    private ReservationStatus status;
    private Double totalPrice;
    private String qrCode;
    private LocalDateTime createdAt;
}