package com.skyres.service.impl;

import com.skyres.dto.request.ChangePasswordRequest;
import com.skyres.dto.request.UpdateUserRequest;
import com.skyres.dto.response.UserProfileResponse;
import com.skyres.model.entity.User;
import com.skyres.repository.UserRepository;
import com.skyres.security.JwtUtil;
import com.skyres.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
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
        User u = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        String current = request.getCurrentPassword();
        if (!passwordEncoder.matches(current, u.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        u.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(u);
    }
}
