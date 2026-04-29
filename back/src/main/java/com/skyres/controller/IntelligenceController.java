package com.skyres.controller;

import com.skyres.dto.request.ChatbotRequest;
import com.skyres.dto.request.RecommendationRequest;
import com.skyres.model.entity.Activity;
import com.skyres.service.IntelligenceService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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
    public Map<String, String> chatbot(@RequestBody ChatbotRequest request) {
        return Map.of("reply", intelligenceService.chatbotReply(request.getMessage()));
    }
}
