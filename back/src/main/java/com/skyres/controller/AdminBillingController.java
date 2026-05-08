package com.skyres.controller;

import com.skyres.dto.response.AdminPaymentResponse;
import com.skyres.dto.response.AdminReservationResponse;
import com.skyres.repository.PaymentRepository;
import com.skyres.repository.ReservationRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ADMIN')")
@Tag(name = "Admin Billing")
public class AdminBillingController {

    private final PaymentRepository paymentRepository;
    private final ReservationRepository reservationRepository;

    @GetMapping("/payments")
    public List<AdminPaymentResponse> getAllPayments() {
        return paymentRepository.findAll().stream()
                .sorted(Comparator.comparing(p -> p.getId() == null ? 0L : p.getId(),
                        Comparator.reverseOrder()))
                .map(AdminPaymentResponse::from)
                .toList();
    }

    @GetMapping("/reservations")
    public List<AdminReservationResponse> getAllReservations() {
        return reservationRepository.findAll().stream()
                .sorted(Comparator.comparing(r -> r.getId() == null ? 0L : r.getId(),
                        Comparator.reverseOrder()))
                .map(AdminReservationResponse::from)
                .toList();
    }
}
