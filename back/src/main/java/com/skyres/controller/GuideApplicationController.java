package com.skyres.controller;

import com.skyres.dto.request.SubmitGuideApplicationRequest;
import com.skyres.dto.response.GuideApplicationResponse;
import com.skyres.service.GuideApplicationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/guide-applications")
@RequiredArgsConstructor
@Tag(name = "Guide applications")
public class GuideApplicationController {

    private final GuideApplicationService guideApplicationService;

    @PostMapping
    public ResponseEntity<GuideApplicationResponse> submit(@Valid @RequestBody SubmitGuideApplicationRequest request) {
        return ResponseEntity.ok(guideApplicationService.submit(request));
    }

    @GetMapping("/me")
    public ResponseEntity<GuideApplicationResponse> mine() {
        GuideApplicationResponse r = guideApplicationService.getMine();
        if (r == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(r);
    }
}
