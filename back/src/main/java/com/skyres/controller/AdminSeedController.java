package com.skyres.controller;

import com.skyres.config.CatalogSeed;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ADMIN')")
@Tag(name = "Admin Seed")
public class AdminSeedController {

    private final CatalogSeed catalogSeed;

    @PostMapping("/seed-catalog")
    public Map<String, String> seedCatalog() {
        catalogSeed.seedData();
        return Map.of("message", "Catalog seeded successfully.");
    }
}
