package com.skyres.controller;

import com.skyres.model.entity.User;
import com.skyres.repository.UserRepository;
import com.skyres.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class FileUploadController {

    private final UserRepository userRepository;
    private static final String UPLOAD_DIR = "uploads/profiles/";
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final String[] ALLOWED_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"};

    @PostMapping("/profile-image")
    public ResponseEntity<?> uploadProfileImage(@RequestParam("file") MultipartFile file) {
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File is empty");
            }

            if (file.getSize() > MAX_FILE_SIZE) {
                return ResponseEntity.badRequest().body("File size exceeds 5MB limit");
            }

            String contentType = file.getContentType();
            if (!isAllowedType(contentType)) {
                return ResponseEntity.badRequest().body("File type not allowed. Only images accepted.");
            }

            // Get current user
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Create upload directory if not exists
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String filename = user.getId() + "_" + UUID.randomUUID() + extension;
            Path filePath = uploadPath.resolve(filename);

            // Save file
            Files.write(filePath, file.getBytes());

            // Update user with image path
            String imageUrl = "/api/upload/profile-image/" + filename;
            user.setPhotoUrl(imageUrl);
            userRepository.save(user);

            Map<String, String> response = new HashMap<>();
            response.put("url", imageUrl);
            response.put("message", "Image uploaded successfully");

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body("Error uploading file: " + e.getMessage());
        }
    }

    @GetMapping("/profile-image/{filename}")
    public ResponseEntity<?> getProfileImage(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(UPLOAD_DIR).resolve(filename).normalize();

            // Security check: ensure file is within upload directory
            if (!filePath.toAbsolutePath().startsWith(Paths.get(UPLOAD_DIR).toAbsolutePath())) {
                return ResponseEntity.status(403).body("Access denied");
            }

            if (!Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }

            byte[] fileContent = Files.readAllBytes(filePath);
            String contentType = Files.probeContentType(filePath);

            return ResponseEntity.ok()
                    .header("Content-Type", contentType)
                    .body(fileContent);

        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    private boolean isAllowedType(String contentType) {
        if (contentType == null) return false;
        for (String type : ALLOWED_TYPES) {
            if (contentType.equals(type)) return true;
        }
        return false;
    }
}
