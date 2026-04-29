package com.skyres.service;

import com.skyres.dto.request.ActivityRequest;
import com.skyres.model.entity.Activity;
import com.skyres.model.entity.Destination;
import com.skyres.repository.ActivityRepository;
import com.skyres.repository.DestinationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final DestinationRepository destinationRepository;

    public List<Activity> findAll(Long destinationId, String type, String season, Double maxPrice) {
        if (destinationId != null) return activityRepository.findByDestinationId(destinationId);
        if (type != null) return activityRepository.findByType(type);
        if (season != null) return activityRepository.findBySeason(season);
        if (maxPrice != null) return activityRepository.findByPriceLessThanEqual(maxPrice);
        return activityRepository.findAll();
    }

    public Activity findById(Long id) {
        return activityRepository.findById(id).orElseThrow(() -> new RuntimeException("Activity not found"));
    }

    public Activity create(ActivityRequest request) {
        Destination destination = null;
        if (request.getDestinationId() != null) {
            destination = destinationRepository.findById(request.getDestinationId())
                    .orElseThrow(() -> new RuntimeException("Destination not found"));
        }

        Activity activity = Activity.builder()
                .name(request.getName())
                .type(request.getType())
                .description(request.getDescription())
                .price(request.getPrice())
                .season(request.getSeason())
                .minAge(request.getMinAge() == null ? 0 : request.getMinAge())
                .imageUrl(request.getImageUrl())
                .destination(destination)
                .build();

        return activityRepository.save(activity);
    }

    public Activity update(Long id, ActivityRequest request) {
        Activity activity = findById(id);
        if (request.getName() != null) activity.setName(request.getName());
        if (request.getType() != null) activity.setType(request.getType());
        if (request.getDescription() != null) activity.setDescription(request.getDescription());
        if (request.getPrice() != null) activity.setPrice(request.getPrice());
        if (request.getSeason() != null) activity.setSeason(request.getSeason());
        if (request.getMinAge() != null) activity.setMinAge(request.getMinAge());
        if (request.getImageUrl() != null) activity.setImageUrl(request.getImageUrl());
        return activityRepository.save(activity);
    }

    public void delete(Long id) {
        activityRepository.deleteById(id);
    }
}
