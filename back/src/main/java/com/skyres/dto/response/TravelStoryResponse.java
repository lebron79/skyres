package com.skyres.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TravelStoryResponse {
    private Long id;
    private String displayName;
    private String locationLabel;
    private String storyText;
    private Integer stars;
    private String avatarColor;
    private LocalDateTime createdAt;
}
