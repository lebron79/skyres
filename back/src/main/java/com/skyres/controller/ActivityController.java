package com.skyres.controller;

import com.skyres.dto.request.ActivityRequest;
import com.skyres.model.entity.Activity;
import com.skyres.service.ActivityService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
@Tag(name = "Activities")
public class ActivityController {

    private final ActivityService activityService;

    @GetMapping
    public List<Activity> getAll(
            @RequestParam(required = false) Long destinationId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String season,
            @RequestParam(required = false) Double maxPrice
    ) {
        return activityService.findAll(destinationId, type, season, maxPrice);
    }

    @GetMapping("/{id}")
    public Activity getOne(@PathVariable Long id) {
        return activityService.findById(id);
    }

    @PostMapping
    public Activity create(@RequestBody ActivityRequest request) {
        return activityService.create(request);
    }

    @PutMapping("/{id}")
    public Activity update(@PathVariable Long id, @RequestBody ActivityRequest request) {
        return activityService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        activityService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
