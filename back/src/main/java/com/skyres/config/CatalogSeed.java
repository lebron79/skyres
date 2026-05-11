package com.skyres.config;

import com.skyres.model.entity.Activity;
import com.skyres.model.entity.Destination;
import com.skyres.model.entity.Guide;
import com.skyres.model.entity.User;
import com.skyres.model.enums.Role;
import com.skyres.repository.ActivityRepository;
import com.skyres.repository.DestinationRepository;
import com.skyres.repository.GuideRepository;
import com.skyres.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class CatalogSeed implements ApplicationRunner {

    private final DestinationRepository destinationRepository;
    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;
    private final GuideRepository guideRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        seedData();
        upsertTourist();
    }

    public void seedData() {
        Destination marrakech = upsertDestination(
                "Morocco",
                "Marrakech",
                "Historic medina city known for souks, riads, and easy access to Atlas excursions.",
                "https://images.unsplash.com/photo-1597212618440-806262de4f6b?auto=format&fit=crop&w=1200&q=80",
                "semi-arid",
                820.0,
                4.7,
                true
        );
        Destination kyoto = upsertDestination(
                "Japan",
                "Kyoto",
                "Cultural capital with temples, tea houses, seasonal gardens, and traditional neighborhoods.",
                "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1200&q=80",
                "temperate",
                1500.0,
                4.8,
                true
        );
        Destination reykjavik = upsertDestination(
                "Iceland",
                "Reykjavik",
                "Gateway to Icelandic nature: glaciers, geysers, lava fields, and northern lights tours.",
                "https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&w=1200&q=80",
                "subpolar oceanic",
                2100.0,
                4.9,
                false
        );

        upsertActivity(
                "Atlas Mountains Day Trek",
                "Hiking",
                "Guided highland hike through Berber villages with panoramic views and local lunch.",
                72.0,
                "Spring and autumn",
                12,
                "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
                marrakech
        );
        upsertActivity(
                "Arashiyama Bamboo & Temples Tour",
                "Cultural",
                "Small-group walking tour through Arashiyama bamboo grove, Tenryu-ji temple, and scenic river district.",
                95.0,
                "Year-round",
                8,
                "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
                kyoto
        );
        upsertActivity(
                "Northern Lights Hunt by Minibus",
                "Aurora",
                "Night tour outside city light pollution with pro guide, weather tracking, and hot drinks.",
                128.0,
                "September to March",
                10,
                "https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&w=1200&q=80",
                reykjavik
        );

        upsertGuide(
                "Leila",
                "Bennani",
                "guide.leila@skyres.app",
                "+212600100200",
                "Licensed Marrakech guide focused on architecture, artisan workshops, and family-friendly itineraries.",
                "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80",
                "Arabic, French, English",
                34.0,
                true,
                "Marrakech",
                4.8
        );
        upsertGuide(
                "Hiro",
                "Tanaka",
                "guide.hiro@skyres.app",
                "+819011223344",
                "Kyoto local specialist for train-day planning, temple routes, and authentic food neighborhoods.",
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
                "Japanese, English",
                42.0,
                true,
                "Kyoto",
                4.9
        );
        upsertGuide(
                "Elin",
                "Jonsdottir",
                "guide.elin@skyres.app",
                "+3547778899",
                "Adventure guide for Iceland road routes, aurora chasing, and safety-first winter travel.",
                "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=800&q=80",
                "Icelandic, English, Danish",
                58.0,
                true,
                "Reykjavik",
                4.9
        );
    }

    private void upsertTourist() {
        userRepository.findByEmail("tourist@skyres.demo").ifPresentOrElse(
            u -> {
                u.setPassword(passwordEncoder.encode("Tourist123"));
                u.setEmailVerified(true);
                userRepository.save(u);
            },
            () -> userRepository.save(
                User.builder()
                    .firstName("Alex").lastName("Tourist")
                    .email("tourist@skyres.demo")
                    .password(passwordEncoder.encode("Tourist123"))
                    .bio("Avid explorer, budget traveller and amateur food photographer.")
                    .photoUrl("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80")
                    .role(Role.TOURIST).emailVerified(true)
                    .build()
            )
        );
    }

    private Destination upsertDestination(
            String country,
            String city,
            String description,
            String imageUrl,
            String climate,
            Double estimatedBudget,
            Double averageRating,
            boolean trending
    ) {
        Destination destination = destinationRepository
                .findByCountryIgnoreCaseAndCityIgnoreCase(country, city)
                .orElseGet(Destination::new);
        destination.setCountry(country);
        destination.setCity(city);
        destination.setDescription(description);
        destination.setImageUrl(imageUrl);
        destination.setClimate(climate);
        destination.setEstimatedBudget(estimatedBudget);
        destination.setAverageRating(averageRating);
        destination.setTrending(trending);
        return destinationRepository.save(destination);
    }

    private void upsertActivity(
            String name,
            String type,
            String description,
            Double price,
            String season,
            int minAge,
            String imageUrl,
            Destination destination
    ) {
        List<Activity> matches =
                activityRepository.findAllByNameIgnoreCaseAndDestinationIdOrderByIdAsc(name, destination.getId());
        Activity activity = matches.isEmpty() ? new Activity() : matches.get(0);
        if (matches.size() > 1) {
            for (int i = 1; i < matches.size(); i++) {
                activityRepository.deleteById(matches.get(i).getId());
            }
        }
        activity.setName(name);
        activity.setType(type);
        activity.setDescription(description);
        activity.setPrice(price);
        activity.setSeason(season);
        activity.setMinAge(minAge);
        activity.setImageUrl(imageUrl);
        activity.setDestination(destination);
        activityRepository.save(activity);
    }

    private void upsertGuide(
            String firstName,
            String lastName,
            String email,
            String phone,
            String bio,
            String photoUrl,
            String languages,
            Double hourlyRate,
            boolean available,
            String region,
            Double averageRating
    ) {
        User user = userRepository.findByEmail(email).orElseGet(User::new);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        if (user.getPassword() == null || user.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode("GuidePass#2026"));
        }
        user.setRole(Role.GUIDE);
        user.setPhone(phone);
        user.setBio(bio);
        user.setPhotoUrl(photoUrl);
        User savedUser = userRepository.save(user);

        Guide guide = guideRepository.findByUserId(savedUser.getId()).orElseGet(Guide::new);
        guide.setUser(savedUser);
        guide.setLanguages(languages);
        guide.setHourlyRate(hourlyRate);
        guide.setAvailable(available);
        guide.setRegion(region);
        guide.setAverageRating(averageRating);
        guideRepository.save(guide);
    }
}