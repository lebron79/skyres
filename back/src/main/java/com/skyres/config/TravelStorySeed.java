package com.skyres.config;

import com.skyres.model.entity.TravelStory;
import com.skyres.repository.TravelStoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * Seeds homepage travel stories when the table is empty (matches former static copy).
 */
@Component
@RequiredArgsConstructor
public class TravelStorySeed implements ApplicationRunner {

    private final TravelStoryRepository travelStoryRepository;

    @Override
    public void run(ApplicationArguments args) {
        if (travelStoryRepository.count() > 0) {
            return;
        }
        travelStoryRepository.save(TravelStory.builder()
                .displayName("Sophie Martin")
                .locationLabel("Paris, France")
                .storyText("Booked three hotels in one afternoon. The AI suggestions nailed it — Bali matched every preference I had. Will never plan a trip the old way again.")
                .stars(5)
                .avatarColor("#7C3AED")
                .build());
        travelStoryRepository.save(TravelStory.builder()
                .displayName("Kenji Nakamura")
                .locationLabel("Tokyo, Japan")
                .storyText("The PDF invoice with a QR code came through instantly. The guide I found spoke fluent Japanese and knew every hidden gem in Kyoto.")
                .stars(5)
                .avatarColor("#0C7A6E")
                .build());
        travelStoryRepository.save(TravelStory.builder()
                .displayName("Amara Diallo")
                .locationLabel("Dakar, Senegal")
                .storyText("I used the budget filter and found a 5-star resort in Marrakech for half what I expected. The experience was absolutely surreal.")
                .stars(5)
                .avatarColor("#E8601A")
                .build());
        travelStoryRepository.save(TravelStory.builder()
                .displayName("Luca Ferretti")
                .locationLabel("Rome, Italy")
                .storyText("The interactive map made it so easy to spot which hotels were close to the Amalfi coastline. Booked in 5 minutes flat.")
                .stars(5)
                .avatarColor("#059669")
                .build());
    }
}
