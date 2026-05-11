package com.skyres.dto.response;

import com.skyres.model.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private Role role;
    private String photoUrl;
    private String phone;
    private String bio;
    private LocalDateTime createdAt;

    /** Used for UI: first-time bookers may stack two distinct promo codes. */
    private Long reservationCount;
}
