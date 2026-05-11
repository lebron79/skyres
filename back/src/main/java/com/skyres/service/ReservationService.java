package com.skyres.service;

import com.skyres.dto.request.ReservationRequest;
import com.skyres.dto.response.ReservationResponse;
import java.util.List;

public interface ReservationService {
    ReservationResponse create(ReservationRequest request);
    ReservationResponse getById(Long id);
    List<ReservationResponse> getByUserId(Long userId);
    ReservationResponse cancel(Long id);

    /** Removes a cancelled reservation permanently; only the owning user may call this. */
    void deleteCancelledIfOwned(Long reservationId, String ownerEmail);

    byte[] generatePdf(Long id);
    byte[] generateQrCode(Long id);
}