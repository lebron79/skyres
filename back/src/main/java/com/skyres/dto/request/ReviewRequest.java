package com.skyres.dto.request;

import lombok.Data;

@Data
public class ReviewRequest {
    private Long userId;
    private Integer rating;
    private String comment;
}
