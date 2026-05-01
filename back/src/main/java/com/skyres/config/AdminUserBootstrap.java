package com.skyres.config;

import com.skyres.model.enums.Role;
import com.skyres.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

/**
 * Promotes listed accounts to ADMIN on startup (comma-separated emails).
 * Override with env {@code SKYRES_ADMIN_EMAILS} or property {@code skyres.admin.bootstrap-emails}.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AdminUserBootstrap implements ApplicationRunner {

    @Value("${skyres.admin.bootstrap-emails:yassinenemri@gmail.com}")
    private String adminEmails;

    private final UserRepository userRepository;

    @Override
    public void run(ApplicationArguments args) {
        Arrays.stream(adminEmails.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .forEach(email -> userRepository.findByEmail(email).ifPresent(user -> {
                    if (user.getRole() != Role.ADMIN) {
                        user.setRole(Role.ADMIN);
                        userRepository.save(user);
                        log.info("Role set to ADMIN for {}", email);
                    }
                }));
    }
}
