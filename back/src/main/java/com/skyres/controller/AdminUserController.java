package com.skyres.controller;

import com.skyres.dto.request.AdminUserCreateRequest;
import com.skyres.dto.request.AdminUserUpdateRequest;
import com.skyres.dto.response.UserProfileResponse;
import com.skyres.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ADMIN')")
@Tag(name = "Admin Users")
public class AdminUserController {

    private final UserService userService;

    @GetMapping
    public List<UserProfileResponse> getAllUsers() {
        return userService.getAllUsers();
    }

    @PostMapping
    public ResponseEntity<UserProfileResponse> create(@Valid @RequestBody AdminUserCreateRequest request) {
        return ResponseEntity.ok(userService.createUserByAdmin(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserProfileResponse> update(@PathVariable Long id, @Valid @RequestBody AdminUserUpdateRequest request) {
        return ResponseEntity.ok(userService.updateUserByAdmin(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
