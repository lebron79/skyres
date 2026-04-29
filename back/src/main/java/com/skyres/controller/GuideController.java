package com.skyres.controller;

import com.skyres.dto.request.GuideRequest;
import com.skyres.dto.request.ReviewRequest;
import com.skyres.model.entity.Guide;
import com.skyres.model.entity.Review;
import com.skyres.service.GuideService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/guides")
@RequiredArgsConstructor
@Tag(name = "Guides")
public class GuideController {

    private final GuideService guideService;

    @GetMapping
    public List<Guide> getAll() {
        return guideService.findAll();
    }

    @GetMapping("/{id}")
    public Guide getOne(@PathVariable Long id) {
        return guideService.findById(id);
    }

    @PostMapping
    public Guide create(@RequestBody GuideRequest request) {
        return guideService.create(request);
    }

    @PutMapping("/{id}")
    public Guide update(@PathVariable Long id, @RequestBody GuideRequest request) {
        return guideService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        guideService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/reviews")
    public List<Review> reviews(@PathVariable Long id) {
        return guideService.getGuideReviews(id);
    }

    @PostMapping("/{id}/reviews")
    public Review addReview(@PathVariable Long id, @RequestBody ReviewRequest request) {
        return guideService.addReview(id, request);
    }
}
