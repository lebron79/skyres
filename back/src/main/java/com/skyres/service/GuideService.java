package com.skyres.service;

import com.skyres.dto.request.GuideRequest;
import com.skyres.dto.request.ReviewRequest;
import com.skyres.model.entity.Guide;
import com.skyres.model.entity.Review;
import com.skyres.model.entity.User;
import com.skyres.repository.GuideRepository;
import com.skyres.repository.ReviewRepository;
import com.skyres.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GuideService {

    private final GuideRepository guideRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;

    public List<Guide> findAll() {
        return guideRepository.findAll();
    }

    public Guide findById(Long id) {
        return guideRepository.findById(id).orElseThrow(() -> new RuntimeException("Guide not found"));
    }

    public Guide create(GuideRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Guide guide = Guide.builder()
                .user(user)
                .languages(request.getLanguages())
                .hourlyRate(request.getHourlyRate())
                .available(request.getAvailable() == null || request.getAvailable())
                .region(request.getRegion())
                .averageRating(0.0)
                .build();

        return guideRepository.save(guide);
    }

    public Guide update(Long id, GuideRequest request) {
        Guide guide = findById(id);
        if (request.getLanguages() != null) guide.setLanguages(request.getLanguages());
        if (request.getHourlyRate() != null) guide.setHourlyRate(request.getHourlyRate());
        if (request.getAvailable() != null) guide.setAvailable(request.getAvailable());
        if (request.getRegion() != null) guide.setRegion(request.getRegion());
        return guideRepository.save(guide);
    }

    public void delete(Long id) {
        guideRepository.deleteById(id);
    }

    public List<Review> getGuideReviews(Long guideId) {
        return reviewRepository.findByGuideId(guideId);
    }

    public Review addReview(Long guideId, ReviewRequest request) {
        Guide guide = findById(guideId);
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Review review = Review.builder()
                .guide(guide)
                .user(user)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        Review saved = reviewRepository.save(review);
        refreshGuideRating(guideId);
        return saved;
    }

    private void refreshGuideRating(Long guideId) {
        Guide guide = findById(guideId);
        List<Review> reviews = reviewRepository.findByGuideId(guideId);
        double average = reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
        guide.setAverageRating(average);
        guideRepository.save(guide);
    }
}
