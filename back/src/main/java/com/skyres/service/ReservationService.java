package com.skyres.service;

import com.skyres.dto.request.ReservationRequest;
import com.skyres.dto.response.ReservationResponse;
import java.util.List;

public interface ReservationService {
    ReservationResponse create(ReservationRequest request);
    ReservationResponse getById(Long id);
    List<ReservationResponse> getByUserId(Long userId);
    ReservationResponse cancel(Long id);
    byte[] generatePdf(Long id);
    byte[] generateQrCode(Long id);
}