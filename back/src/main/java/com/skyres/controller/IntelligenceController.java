package com.skyres.controller;

import com.skyres.dto.request.ChatbotRequest;
import com.skyres.dto.request.RecommendationRequest;
import com.skyres.dto.response.ChatbotResponse;
import com.skyres.model.entity.Activity;
import com.skyres.service.IntelligenceService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/intelligence")
@RequiredArgsConstructor
@Tag(name = "Intelligence")
public class IntelligenceController {

    private final IntelligenceService intelligenceService;

    @PostMapping("/recommendations")
    public List<Activity> recommendations(@RequestBody RecommendationRequest request) {
        return intelligenceService.recommendActivities(request);
    }

    @PostMapping("/travel-plan")
    public List<String> travelPlan(@RequestBody RecommendationRequest request) {
        return intelligenceService.generateTravelPlan(request);
    }

    @PostMapping("/chatbot")
    public ChatbotResponse chatbot(@RequestBody ChatbotRequest request) {
        return intelligenceService.ragChat(request);
    }
}
