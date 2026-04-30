package com.skyres.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Backend is running!");
    }

    @GetMapping("")
    public ResponseEntity<String> root() {
        return ResponseEntity.ok("Skyres API - Visit /swagger-ui.html for API documentation");
    }
}
