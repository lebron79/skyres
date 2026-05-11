package com.skyres.repository;

import com.skyres.model.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByReservationId(Long reservationId);

    List<Payment> findByReservation_User_IdOrderByIdDesc(Long userId);
}
