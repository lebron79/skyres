package com.skyres.service;

import com.skyres.dto.request.PaymentRequest;
import com.skyres.dto.response.PaymentResponse;
import com.skyres.model.enums.PaymentStatus;

public interface PaymentService {
    PaymentResponse create(PaymentRequest request);
    PaymentResponse getById(Long id);
    PaymentResponse getByReservationId(Long reservationId);
    PaymentResponse updateStatus(Long id, PaymentStatus status);
}