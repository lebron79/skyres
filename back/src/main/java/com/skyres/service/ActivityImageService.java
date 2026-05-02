package com.skyres.service;

import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

@Service
public class ActivityImageService {

    private static final String FALLBACK_BASE = "https://source.unsplash.com/1600x900/?";

    public String resolveImageUrl(String activityName) {
        String query = (activityName == null || activityName.isBlank())
                ? "travel,activity"
                : activityName.trim() + ",travel,activity";
        String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);
        String sourceUrl = FALLBACK_BASE + encodedQuery;

        try {
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(8))
                    .followRedirects(HttpClient.Redirect.NORMAL)
                    .build();
            HttpRequest request = HttpRequest.newBuilder(URI.create(sourceUrl))
                    .timeout(Duration.ofSeconds(12))
                    .GET()
                    .build();
            HttpResponse<Void> response = client.send(request, HttpResponse.BodyHandlers.discarding());
            URI finalUri = response.uri();
            return finalUri != null ? finalUri.toString() : sourceUrl;
        } catch (Exception e) {
            return sourceUrl;
        }
    }
}
