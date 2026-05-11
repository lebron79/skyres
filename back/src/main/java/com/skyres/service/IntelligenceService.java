package com.skyres.service;

import com.skyres.dto.request.ChatbotRequest;
import com.skyres.dto.request.RecommendationRequest;
import com.skyres.dto.response.ChatbotResponse;
import com.skyres.model.entity.Activity;
import com.skyres.repository.ActivityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IntelligenceService {

    private final ActivityRepository activityRepository;
    private final GroqRagChatService groqRagChatService;

    public List<Activity> recommendActivities(RecommendationRequest request) {
        List<Activity> activities = new ArrayList<>(activityRepository.findAll());

        if (request.getSeason() != null && !request.getSeason().isBlank()) {
            activities.removeIf(a -> a.getSeason() == null || !a.getSeason().equalsIgnoreCase(request.getSeason()));
        }

        if (request.getBudget() != null) {
            activities.removeIf(a -> a.getPrice() != null && a.getPrice() > request.getBudget());
        }

        if (request.getAge() != null) {
            activities.removeIf(a -> a.getMinAge() > request.getAge());
        }

        if (request.getPreferences() != null && !request.getPreferences().isEmpty()) {
            List<String> preferences = request.getPreferences().stream()
                    .map(String::toLowerCase)
                    .toList();
            activities.removeIf(a -> a.getType() == null || preferences.stream().noneMatch(p -> a.getType().toLowerCase().contains(p)));
        }

        activities.sort(Comparator.comparing(Activity::getPrice, Comparator.nullsLast(Double::compareTo)));
        return activities.stream().limit(10).toList();
    }

    public List<String> generateTravelPlan(RecommendationRequest request) {
        List<Activity> recommendations = recommendActivities(request);
        List<String> plan = new ArrayList<>();

        if (recommendations.isEmpty()) {
            plan.add("Day 1: Explore the city center");
            plan.add("Day 2: Free day for local discovery");
            plan.add("Day 3: Cultural activity and shopping");
            return plan;
        }

        for (int i = 0; i < Math.min(3, recommendations.size()); i++) {
            Activity a = recommendations.get(i);
            plan.add("Day " + (i + 1) + ": " + a.getName() + " (" + a.getType() + ")");
        }

        return plan;
    }

    public ChatbotResponse ragChat(ChatbotRequest request) {
        return groqRagChatService.chat(request);
    }
}
