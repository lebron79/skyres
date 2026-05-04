package com.skyres.service;

import com.skyres.dto.request.TravelStoryRequest;
import com.skyres.dto.response.TravelStoryResponse;
import com.skyres.model.entity.TravelStory;
import com.skyres.model.entity.User;
import com.skyres.repository.TravelStoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TravelStoryService {

    private static final String[] AVATAR_COLORS = {
            "#7C3AED", "#0C7A6E", "#E8601A", "#059669", "#2563eb", "#db2777", "#ca8a04", "#4f46e5"
    };

    private final TravelStoryRepository travelStoryRepository;

    public List<TravelStoryResponse> findAllPublished() {
        return travelStoryRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public TravelStoryResponse create(TravelStoryRequest request, User author) {
        String color = pickAvatarColor(request.getDisplayName());
        TravelStory story = TravelStory.builder()
                .displayName(request.getDisplayName().trim())
                .locationLabel(request.getLocationLabel().trim())
                .storyText(request.getStoryText().trim())
                .stars(request.getStars())
                .avatarColor(color)
                .user(author)
                .build();
        return toResponse(travelStoryRepository.save(story));
    }

    private TravelStoryResponse toResponse(TravelStory s) {
        return TravelStoryResponse.builder()
                .id(s.getId())
                .displayName(s.getDisplayName())
                .locationLabel(s.getLocationLabel())
                .storyText(s.getStoryText())
                .stars(s.getStars())
                .avatarColor(s.getAvatarColor() != null ? s.getAvatarColor() : pickAvatarColor(s.getDisplayName()))
                .createdAt(s.getCreatedAt())
                .build();
    }

    private static String pickAvatarColor(String name) {
        int idx = Math.floorMod(name == null ? 0 : name.hashCode(), AVATAR_COLORS.length);
        return AVATAR_COLORS[idx];
    }
}
