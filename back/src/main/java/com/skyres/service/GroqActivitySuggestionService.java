package com.skyres.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.skyres.dto.response.ActivityAiSuggestionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class GroqActivitySuggestionService {

    private final ObjectMapper objectMapper;

    private static final URI GROQ_CHAT = URI.create("https://api.groq.com/openai/v1/chat/completions");

    @Value("${groq.api.key:}")
    private String groqApiKey;

    @Value("${groq.model:llama-3.3-70b-versatile}")
    private String groqModel;

    public ActivityAiSuggestionResponse suggestForActivityName(String rawName) {
        String name = rawName == null ? "" : rawName.trim();
        if (name.isEmpty()) {
            throw new IllegalArgumentException("Activity name is required.");
        }
        if (groqApiKey == null || groqApiKey.isBlank()) {
            throw new IllegalStateException(
                    "Groq is not configured. Set environment variable GROQ_API_KEY before starting the backend.");
        }

        String userPrompt = """
                Tourism activity name: "%s"

                Respond with ONLY a single JSON object (no markdown, no code fences, no explanation) using exactly these keys:
                "type" (short English category: e.g. excursion, hiking, diving, safari, cultural),
                "description" (2–4 sentences for travellers),
                "price" (one decimal number, estimated USD per person for a typical booking),
                "season" (one of: spring, summer, autumn, winter, year-round),
                "minAge" (integer, minimum age if relevant, else 0).

                Use realistic values.""".formatted(name.replace("\"", "'"));

        try {
            ObjectNode payload = objectMapper.createObjectNode();
            payload.put("model", groqModel);
            payload.put("temperature", 0.35);
            payload.put("max_tokens", 700);
            ArrayNode messages = objectMapper.createArrayNode();
            ObjectNode sys = objectMapper.createObjectNode();
            sys.put("role", "system");
            sys.put("content", "You output only compact JSON objects for a travel booking API.");
            messages.add(sys);
            ObjectNode userMsg = objectMapper.createObjectNode();
            userMsg.put("role", "user");
            userMsg.put("content", userPrompt);
            messages.add(userMsg);
            payload.set("messages", messages);
            String body = objectMapper.writeValueAsString(payload);

            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(15))
                    .build();

            HttpRequest request = HttpRequest.newBuilder(GROQ_CHAT)
                    .timeout(Duration.ofSeconds(45))
                    .header("Authorization", "Bearer " + groqApiKey.trim())
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                throw new RuntimeException("Groq API error (" + response.statusCode() + "): " + response.body());
            }
            JsonNode root = objectMapper.readTree(response.body());
            String content = root.path("choices").path(0).path("message").path("content").asText("");
            if (content.isBlank()) {
                throw new RuntimeException("Empty response from Groq.");
            }
            String json = extractJsonObject(content);
            JsonNode obj = objectMapper.readTree(json);
            return ActivityAiSuggestionResponse.builder()
                    .type(text(obj, "type"))
                    .description(text(obj, "description"))
                    .price(number(obj, "price"))
                    .season(text(obj, "season"))
                    .minAge(integer(obj, "minAge"))
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("Could not generate activity details: " + e.getMessage(), e);
        }
    }

    private static String extractJsonObject(String content) {
        String s = content.trim();
        Matcher m = Pattern.compile("\\{[\\s\\S]*}").matcher(s);
        if (m.find()) {
            return m.group();
        }
        return s;
    }

    private static String text(JsonNode node, String field) {
        JsonNode n = node.get(field);
        if (n == null || n.isNull()) return null;
        String v = n.asText(null);
        return v != null && !v.isBlank() ? v.trim() : null;
    }

    private static Double number(JsonNode node, String field) {
        JsonNode n = node.get(field);
        if (n == null || n.isNull()) return null;
        if (n.isNumber()) return n.doubleValue();
        try {
            return Double.parseDouble(n.asText().trim());
        } catch (Exception e) {
            return null;
        }
    }

    private static Integer integer(JsonNode node, String field) {
        JsonNode n = node.get(field);
        if (n == null || n.isNull()) return null;
        if (n.isIntegralNumber()) return n.intValue();
        try {
            return Integer.parseInt(n.asText().trim());
        } catch (Exception e) {
            return null;
        }
    }
}
