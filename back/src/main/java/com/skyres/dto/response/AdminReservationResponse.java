package com.skyres.dto.response;

import com.skyres.model.entity.Reservation;
import com.skyres.model.entity.User;
import com.skyres.model.enums.ReservationStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record AdminReservationResponse(
        Long id,
        ReservationStatus status,
        LocalDate checkIn,
        LocalDate checkOut,
        int numberOfPersons,
        LocalDateTime createdAt,
        Long userId,
        String userFirstName,
        String userLastName,
        String userEmail,
        Long hotelId,
        String hotelName
) {
    public static AdminReservationResponse from(Reservation r) {
        User u = r.getUser();
        return new AdminReservationResponse(
                r.getId(),
                r.getStatus(),
                r.getCheckIn(),
                r.getCheckOut(),
                r.getNumberOfPersons(),
                r.getCreatedAt(),
                u != null ? u.getId() : null,
                u != null ? u.getFirstName() : null,
                u != null ? u.getLastName() : null,
                u != null ? u.getEmail() : null,
                r.getHotel() != null ? r.getHotel().getId() : null,
                r.getHotel() != null ? r.getHotel().getName() : null
        );
    }
}
