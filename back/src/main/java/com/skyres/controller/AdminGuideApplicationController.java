package com.skyres.controller;

import com.skyres.dto.request.RejectGuideApplicationRequest;
import com.skyres.dto.request.SubmitGuideApplicationRequest;
import com.skyres.dto.response.GuideApplicationResponse;
import com.skyres.model.enums.GuideApplicationStatus;
import com.skyres.service.GuideApplicationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/guide-applications")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin — Guide applications")
public class AdminGuideApplicationController {

    private final GuideApplicationService guideApplicationService;

    @GetMapping
    public List<GuideApplicationResponse> list(@RequestParam(defaultValue = "PENDING") GuideApplicationStatus status) {
        return guideApplicationService.listByStatus(status);
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<GuideApplicationResponse> approve(@PathVariable Long id) {
        return ResponseEntity.ok(guideApplicationService.approve(id));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<GuideApplicationResponse> reject(
            @PathVariable Long id,
            @RequestBody(required = false) RejectGuideApplicationRequest body) {
        return ResponseEntity.ok(guideApplicationService.reject(id, body));
    }
}
