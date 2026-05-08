package com.skyres.dto.response;

import com.skyres.model.entity.Payment;
import com.skyres.model.entity.Reservation;
import com.skyres.model.entity.User;
import com.skyres.model.enums.PaymentStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record AdminPaymentResponse(
        Long id,
        Double amount,
        String method,
        PaymentStatus status,
        LocalDateTime paidAt,
        Long reservationId,
        LocalDate checkIn,
        LocalDate checkOut,
        Long userId,
        String userFirstName,
        String userLastName,
        String userEmail,
        Long hotelId,
        String hotelName
) {
    public static AdminPaymentResponse from(Payment p) {
        Reservation r = p.getReservation();
        User u = r != null ? r.getUser() : null;
        return new AdminPaymentResponse(
                p.getId(),
                p.getAmount(),
                p.getMethod(),
                p.getStatus(),
                p.getPaidAt(),
                r != null ? r.getId() : null,
                r != null ? r.getCheckIn() : null,
                r != null ? r.getCheckOut() : null,
                u != null ? u.getId() : null,
                u != null ? u.getFirstName() : null,
                u != null ? u.getLastName() : null,
                u != null ? u.getEmail() : null,
                r != null && r.getHotel() != null ? r.getHotel().getId() : null,
                r != null && r.getHotel() != null ? r.getHotel().getName() : null
        );
    }
}
