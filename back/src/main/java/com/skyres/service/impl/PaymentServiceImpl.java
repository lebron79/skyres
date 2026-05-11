package com.skyres.service.impl;

import com.skyres.dto.request.PaymentRequest;
import com.skyres.dto.response.PaymentResponse;
import com.skyres.model.entity.Payment;
import com.skyres.model.entity.Reservation;
import com.skyres.model.entity.User;
import com.skyres.model.enums.PaymentStatus;
import com.skyres.model.enums.ReservationStatus;
import com.skyres.repository.PaymentRepository;
import com.skyres.repository.ReservationRepository;
import com.skyres.repository.UserRepository;
import com.skyres.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;

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
    @Transactional(readOnly = true)
    public List<PaymentResponse> listByUserId(Long userId) {
        Long meId = requireCurrentUserId();
        if (!meId.equals(userId)) {
            throw new IllegalArgumentException("You can only view your own payments");
        }
        return paymentRepository.findByReservation_User_IdOrderByIdDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> listForCurrentUser() {
        Long meId = requireCurrentUserId();
        return paymentRepository.findByReservation_User_IdOrderByIdDesc(meId).stream()
                .map(this::toResponse)
                .toList();
    }

    private Long requireCurrentUserId() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new IllegalArgumentException("Authentication required");
        }
        String email = auth.getName();
        User me = userRepository.findByEmailIgnoreCase(email.trim())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return me.getId();
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
        Reservation r = p.getReservation();
        String hotelName = null;
        if (r != null && r.getHotel() != null) {
            hotelName = r.getHotel().getName();
        }
        return PaymentResponse.builder()
                .id(p.getId())
                .reservationId(r != null ? r.getId() : null)
                .amount(p.getAmount())
                .method(p.getMethod())
                .status(p.getStatus())
                .paidAt(p.getPaidAt())
                .hotelName(hotelName)
                .build();
    }
}