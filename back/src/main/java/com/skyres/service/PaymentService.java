package com.skyres.service;

import com.skyres.dto.request.PaymentRequest;
import com.skyres.dto.response.PaymentResponse;
import com.skyres.model.enums.PaymentStatus;

import java.util.List;

public interface PaymentService {
    PaymentResponse create(PaymentRequest request);
    PaymentResponse getById(Long id);
    PaymentResponse getByReservationId(Long reservationId);
    PaymentResponse updateStatus(Long id, PaymentStatus status);

    List<PaymentResponse> listByUserId(Long userId);

    /** Payments for the currently authenticated user (from JWT / security context). */
    List<PaymentResponse> listForCurrentUser();
}