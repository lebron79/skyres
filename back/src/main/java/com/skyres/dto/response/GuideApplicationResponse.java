package com.skyres.dto.response;

import com.skyres.model.entity.GuideApplication;
import com.skyres.model.enums.GuideApplicationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class GuideApplicationResponse {
    private Long id;
    private Long userId;
    private String userEmail;
    private String userFirstName;
    private String userLastName;
    private String languages;
    private Double hourlyRate;
    private String region;
    private String pitch;
    private GuideApplicationStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime processedAt;
    private String rejectionReason;

    public static GuideApplicationResponse from(GuideApplication a) {
        var u = a.getUser();
        return GuideApplicationResponse.builder()
                .id(a.getId())
                .userId(u.getId())
                .userEmail(u.getEmail())
                .userFirstName(u.getFirstName())
                .userLastName(u.getLastName())
                .languages(a.getLanguages())
                .hourlyRate(a.getHourlyRate())
                .region(a.getRegion())
                .pitch(a.getPitch())
                .status(a.getStatus())
                .createdAt(a.getCreatedAt())
                .processedAt(a.getProcessedAt())
                .rejectionReason(a.getRejectionReason())
                .build();
    }
}
