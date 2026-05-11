package com.skyres.service;

import com.skyres.dto.request.GuideRequest;
import com.skyres.dto.request.RejectGuideApplicationRequest;
import com.skyres.dto.request.SubmitGuideApplicationRequest;
import com.skyres.dto.response.GuideApplicationResponse;
import com.skyres.model.entity.GuideApplication;
import com.skyres.model.entity.User;
import com.skyres.model.enums.GuideApplicationStatus;
import com.skyres.model.enums.Role;
import com.skyres.repository.GuideApplicationRepository;
import com.skyres.repository.GuideRepository;
import com.skyres.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GuideApplicationService {

    private final GuideApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final GuideRepository guideRepository;
    private final GuideService guideService;

    private String currentUserEmail() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new IllegalStateException("Not authenticated");
        }
        return auth.getName();
    }

    private User requireCurrentUser() {
        String email = currentUserEmail();
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public GuideApplicationResponse submit(SubmitGuideApplicationRequest dto) {
        User user = requireCurrentUser();
        if (user.getRole() == Role.ADMIN) {
            throw new IllegalArgumentException("Administrators cannot apply as guides.");
        }
        if (user.getRole() == Role.GUIDE) {
            throw new IllegalArgumentException("You are already registered as a guide.");
        }
        if (guideRepository.findByUserId(user.getId()).isPresent()) {
            throw new IllegalArgumentException("You already have a guide profile.");
        }
        if (applicationRepository.existsByUserIdAndStatus(user.getId(), GuideApplicationStatus.PENDING)) {
            throw new IllegalArgumentException("You already have a pending application. Please wait for admin review.");
        }

        GuideApplication app = GuideApplication.builder()
                .user(user)
                .languages(dto.getLanguages().trim())
                .hourlyRate(dto.getHourlyRate())
                .region(dto.getRegion().trim())
                .pitch(dto.getPitch() != null ? dto.getPitch().trim() : null)
                .status(GuideApplicationStatus.PENDING)
                .build();
        return GuideApplicationResponse.from(applicationRepository.save(app));
    }

    @Transactional(readOnly = true)
    public GuideApplicationResponse getMine() {
        User user = requireCurrentUser();
        return applicationRepository.findTopByUserIdOrderByCreatedAtDesc(user.getId())
                .map(GuideApplicationResponse::from)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<GuideApplicationResponse> listByStatus(GuideApplicationStatus status) {
        return applicationRepository.findByStatusOrderByCreatedAtAsc(status).stream()
                .map(GuideApplicationResponse::from)
                .toList();
    }

    @Transactional
    public GuideApplicationResponse approve(Long applicationId) {
        GuideApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        if (app.getStatus() != GuideApplicationStatus.PENDING) {
            throw new IllegalArgumentException("Only pending applications can be approved.");
        }
        User user = app.getUser();
        if (user.getRole() == Role.ADMIN) {
            throw new IllegalArgumentException("Cannot approve an admin account as guide.");
        }

        if (guideRepository.findByUserId(user.getId()).isEmpty()) {
            GuideRequest gr = new GuideRequest();
            gr.setUserId(user.getId());
            gr.setLanguages(app.getLanguages());
            gr.setHourlyRate(app.getHourlyRate());
            gr.setRegion(app.getRegion());
            gr.setAvailable(true);
            guideService.create(gr);
        }

        user.setRole(Role.GUIDE);
        userRepository.save(user);

        app.setStatus(GuideApplicationStatus.APPROVED);
        app.setProcessedAt(LocalDateTime.now());
        app.setRejectionReason(null);
        return GuideApplicationResponse.from(applicationRepository.save(app));
    }

    @Transactional
    public GuideApplicationResponse reject(Long applicationId, RejectGuideApplicationRequest dto) {
        GuideApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        if (app.getStatus() != GuideApplicationStatus.PENDING) {
            throw new IllegalArgumentException("Only pending applications can be rejected.");
        }
        app.setStatus(GuideApplicationStatus.REJECTED);
        app.setProcessedAt(LocalDateTime.now());
        app.setRejectionReason(dto != null && dto.getReason() != null ? dto.getReason().trim() : null);
        return GuideApplicationResponse.from(applicationRepository.save(app));
    }
}
