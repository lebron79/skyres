package com.skyres.controller;

import com.skyres.dto.request.ActivityAiSuggestRequest;
import com.skyres.dto.response.ActivityAiSuggestionResponse;
import com.skyres.model.enums.Role;
import com.skyres.service.GroqActivitySuggestionService;
import com.skyres.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin AI")
public class AdminAiController {

    private final GroqActivitySuggestionService groqActivitySuggestionService;
    private final UserService userService;

    /**
     * Same role source as GET /api/users/me (DB lookup by authenticated email).
     */
    @PostMapping("/activities/suggest-details")
    public ResponseEntity<ActivityAiSuggestionResponse> suggestActivityDetails(
            @Valid @RequestBody ActivityAiSuggestRequest request,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        var me = userService.getCurrentUser();
        if (me.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Admin role required; current role is " + me.getRole());
        }
        return ResponseEntity.ok(groqActivitySuggestionService.suggestForActivityName(request.getName()));
    }
}
