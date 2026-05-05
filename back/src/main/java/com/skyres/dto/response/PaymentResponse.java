package com.skyres.dto.response;

import com.skyres.model.enums.PaymentStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class PaymentResponse {
    private Long id;
    private Long reservationId;
    private Double amount;
    private String method;
    private PaymentStatus status;
    private LocalDateTime paidAt;
}