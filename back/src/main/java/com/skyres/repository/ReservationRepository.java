package com.skyres.repository;

import com.skyres.model.entity.Reservation;
import com.skyres.model.enums.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    long countByUser_Id(Long userId);

    List<Reservation> findByUserId(Long userId);
    List<Reservation> findByStatus(ReservationStatus status);
    List<Reservation> findByHotelId(Long hotelId);
}
