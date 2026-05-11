package com.skyres.service.impl;

import com.skyres.dto.request.AdminUserCreateRequest;
import com.skyres.dto.request.AdminUserUpdateRequest;
import com.skyres.dto.request.ChangePasswordRequest;
import com.skyres.dto.request.UpdateUserRequest;
import com.skyres.dto.response.UserProfileResponse;
import com.skyres.model.entity.User;
import com.skyres.model.enums.Role;
import com.skyres.repository.ReservationRepository;
import com.skyres.repository.UserRepository;
import com.skyres.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import org.springframework.http.HttpStatus;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final ReservationRepository reservationRepository;
    private final PasswordEncoder passwordEncoder;

    private String getCurrentEmail() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return null;
        return auth.getName();
    }

    private UserProfileResponse toDto(User u) {
        if (u == null) return null;
        return UserProfileResponse.builder()
                .id(u.getId())
                .firstName(u.getFirstName())
                .lastName(u.getLastName())
                .email(u.getEmail())
                .role(u.getRole())
                .photoUrl(u.getPhotoUrl())
                .phone(u.getPhone())
                .bio(u.getBio())
                .createdAt(u.getCreatedAt())
                .reservationCount(reservationRepository.countByUser_Id(u.getId()))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getById(Long id) {
        User u = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        return toDto(u);
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUser() {
        String email = getCurrentEmail();
        if (email == null) throw new RuntimeException("Not authenticated");
        User u = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        return toDto(u);
    }

    @Override
    @Transactional
    public UserProfileResponse updateUser(Long id, UpdateUserRequest dto) {
        User u = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        u.setFirstName(dto.getFirstName());
        u.setLastName(dto.getLastName());
        u.setPhone(dto.getPhone());
        u.setPhotoUrl(dto.getPhotoUrl());
        u.setBio(dto.getBio());
        userRepository.save(u);
        return toDto(u);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void changePassword(Long id, ChangePasswordRequest request) {
        String actorEmail = getCurrentEmail();
        if (actorEmail == null || actorEmail.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        User u = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (!u.getEmail().equalsIgnoreCase(actorEmail.trim())) {
            throw new IllegalArgumentException("You can only change your own password");
        }
        if (!passwordEncoder.matches(request.getCurrentPassword(), u.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        u.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(u);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserProfileResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    @Transactional
    public UserProfileResponse createUserByAdmin(AdminUserCreateRequest dto) {
        String email = dto.getEmail() == null ? "" : dto.getEmail().trim().toLowerCase();
        if (email.isBlank()) throw new IllegalArgumentException("Email is required");
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already in use.");
        }
        User user = User.builder()
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .email(email)
                .password(passwordEncoder.encode(dto.getPassword()))
                .phone(dto.getPhone())
                .photoUrl(dto.getPhotoUrl())
                .bio(dto.getBio())
                .role(parseRole(dto.getRole()))
                .build();
        return toDto(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserProfileResponse updateUserByAdmin(Long id, AdminUserUpdateRequest dto) {
        User u = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        String email = dto.getEmail() == null ? "" : dto.getEmail().trim().toLowerCase();
        if (email.isBlank()) throw new IllegalArgumentException("Email is required");
        if (!email.equalsIgnoreCase(u.getEmail()) && userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already in use.");
        }
        u.setFirstName(dto.getFirstName());
        u.setLastName(dto.getLastName());
        u.setEmail(email);
        u.setPhone(dto.getPhone());
        u.setPhotoUrl(dto.getPhotoUrl());
        u.setBio(dto.getBio());
        u.setRole(parseRole(dto.getRole()));
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            u.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        return toDto(userRepository.save(u));
    }

    private Role parseRole(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Role is required");
        }
        try {
            return Role.valueOf(value.trim().toUpperCase());
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid role. Allowed roles: TOURIST, GUIDE, ADMIN");
        }
    }
}
