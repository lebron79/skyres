package com.skyres.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private String phone;
    private String photoUrl;
    private String bio;
    private LocalDateTime createdAt;

    private Long reservationCount;
}
