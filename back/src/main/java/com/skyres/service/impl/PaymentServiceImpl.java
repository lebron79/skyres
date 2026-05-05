package com.skyres.service.impl;

import com.skyres.dto.request.PaymentRequest;
import com.skyres.dto.response.PaymentResponse;
import com.skyres.model.entity.Payment;
import com.skyres.model.entity.Reservation;
import com.skyres.model.enums.PaymentStatus;
import com.skyres.model.enums.ReservationStatus;
import com.skyres.repository.PaymentRepository;
import com.skyres.repository.ReservationRepository;
import com.skyres.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final ReservationRepository reservationRepository;

    @Override
    @Transactional
    public PaymentResponse create(PaymentRequest request) {
        Reservation reservation = reservationRepository.findById(request.getReservationId())
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new IllegalArgumentException("Cannot pay for a cancelled reservation");
        }

        // check if payment already exists
        paymentRepository.findByReservationId(request.getReservationId())
                .ifPresent(p -> { throw new IllegalArgumentException("Payment already exists for this reservation"); });

        Payment payment = Payment.builder()
                .reservation(reservation)
                .amount(request.getAmount())
                .method(request.getMethod())
                .status(PaymentStatus.PAID)
                .paidAt(LocalDateTime.now())
                .build();

        Payment saved = paymentRepository.save(payment);

        // update reservation status to CONFIRMED
        reservation.setStatus(ReservationStatus.CONFIRMED);
        reservationRepository.save(reservation);

        return toResponse(saved);
    }

    @Override
    public PaymentResponse getById(Long id) {
        return toResponse(findById(id));
    }

    @Override
    public PaymentResponse getByReservationId(Long reservationId) {
        Payment p = paymentRepository.findByReservationId(reservationId)
                .orElseThrow(() -> new RuntimeException("Payment not found for this reservation"));
        return toResponse(p);
    }

    @Override
    @Transactional
    public PaymentResponse updateStatus(Long id, PaymentStatus status) {
        Payment p = findById(id);
        p.setStatus(status);
        return toResponse(paymentRepository.save(p));
    }

    // ── helpers ──────────────────────────────────────────

    private Payment findById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
    }

    private PaymentResponse toResponse(Payment p) {
        return PaymentResponse.builder()
                .id(p.getId())
                .reservationId(p.getReservation().getId())
                .amount(p.getAmount())
                .method(p.getMethod())
                .status(p.getStatus())
                .paidAt(p.getPaidAt())
                .build();
    }
}