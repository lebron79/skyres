package com.skyres.controller;

import com.skyres.dto.request.TravelStoryRequest;
import com.skyres.dto.response.TravelStoryResponse;
import com.skyres.model.entity.User;
import com.skyres.repository.UserRepository;
import com.skyres.service.TravelStoryService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stories")
@RequiredArgsConstructor
@Tag(name = "Travel stories")
public class TravelStoryController {

    private final TravelStoryService travelStoryService;
    private final UserRepository userRepository;

    @GetMapping
    public List<TravelStoryResponse> list() {
        return travelStoryService.findAllPublished();
    }

    @PostMapping
    public ResponseEntity<TravelStoryResponse> create(
            @Valid @RequestBody TravelStoryRequest request,
            Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found."));
        return ResponseEntity.ok(travelStoryService.create(request, user));
    }
}
