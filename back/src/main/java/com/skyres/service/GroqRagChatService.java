package com.skyres.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.skyres.dto.request.ChatbotRequest;
import com.skyres.dto.request.ChatMessage;
import com.skyres.dto.request.RagTripPreferences;
import com.skyres.dto.response.ChatbotResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GroqRagChatService {

    private static final URI GROQ_CHAT = URI.create("https://api.groq.com/openai/v1/chat/completions");

    private final ObjectMapper objectMapper;
    private final RagKnowledgeLoader ragKnowledgeLoader;

    @Value("${groq.api.key:}")
    private String groqApiKey;

    @Value("${groq.model:llama-3.3-70b-versatile}")
    private String groqModel;

    public ChatbotResponse chat(ChatbotRequest request) {
        if (groqApiKey == null || groqApiKey.isBlank()) {
            return ChatbotResponse.builder()
                    .reply("Sky Assistant needs a Groq API key. Set GROQ_API_KEY or groq.api.key in .groq.properties, then restart the backend.")
                    .ragLoaded(ragKnowledgeLoader.isLoaded())
                    .build();
        }

        String ragChunk = ragKnowledgeLoader.getKnowledgeDigest();
        boolean rag = ragKnowledgeLoader.isLoaded() && !ragChunk.isBlank();
        if (ragChunk.length() > 14000) {
            ragChunk = ragChunk.substring(0, 14000) + "\n… [catalog truncated for token limits]";
        }

        String systemPrompt = buildSystemPrompt(ragChunk, rag);

        try {
            ObjectNode payload = objectMapper.createObjectNode();
            payload.put("model", groqModel);
            payload.put("temperature", 0.45);
            payload.put("max_tokens", 1800);

            ArrayNode messages = objectMapper.createArrayNode();

            ObjectNode sys = objectMapper.createObjectNode();
            sys.put("role", "system");
            sys.put("content", systemPrompt);
            messages.add(sys);

            List<ChatMessage> history = request.getHistory();
            if (history != null) {
                int start = Math.max(0, history.size() - 12);
                for (int i = start; i < history.size(); i++) {
                    ChatMessage turn = history.get(i);
                    if (turn == null || turn.getRole() == null || turn.getContent() == null) continue;
                    String role = turn.getRole().trim().toLowerCase();
                    if (!role.equals("user") && !role.equals("assistant")) continue;
                    ObjectNode m = objectMapper.createObjectNode();
                    m.put("role", role);
                    m.put("content", truncate(turn.getContent(), 4000));
                    messages.add(m);
                }
            }

            ObjectNode userMsg = objectMapper.createObjectNode();
            userMsg.put("role", "user");
            userMsg.put("content", buildUserContent(request));
            messages.add(userMsg);

            payload.set("messages", messages);
            String body = objectMapper.writeValueAsString(payload);

            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(15))
                    .build();

            HttpRequest httpReq = HttpRequest.newBuilder(GROQ_CHAT)
                    .timeout(Duration.ofSeconds(75))
                    .header("Authorization", "Bearer " + groqApiKey.trim())
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = client.send(httpReq, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                return ChatbotResponse.builder()
                        .reply("Assistant error (" + response.statusCode() + "). Check Groq quota and model name.")
                        .ragLoaded(rag)
                        .build();
            }

            var root = objectMapper.readTree(response.body());
            String content = root.path("choices").path(0).path("message").path("content").asText("");
            if (content.isBlank()) {
                return ChatbotResponse.builder()
                        .reply("Empty response from the model. Try again.")
                        .ragLoaded(rag)
                        .build();
            }

            return ChatbotResponse.builder()
                    .reply(content.trim())
                    .ragLoaded(rag)
                    .build();
        } catch (Exception e) {
            return ChatbotResponse.builder()
                    .reply("Could not reach Sky Assistant: " + e.getMessage())
                    .ragLoaded(rag)
                    .build();
        }
    }

    private static String buildSystemPrompt(String catalogJson, boolean ragLoaded) {
        StringBuilder sb = new StringBuilder();
        sb.append("""
                You are Sky Assistant for the SkyRes travel platform. You help users choose destinations, hotels, \
                activities, and local guides using ONLY the catalog JSON below plus reasonable travel reasoning \
                (safety, pacing, seasonality). Never invent hotel names, prices, or guide IDs that are not implied \
                by the catalog. If something is missing from the catalog, say so and suggest how to refine the search.

                Response style:
                - Short sections with bullet lists when comparing options.
                - Mention destination city/country, approximate budget fit (EUR estimated_budget on destinations), \
                hotel stars and nightly rate where relevant (price_per_night is in TND in this dataset — say so).
                - For guides: languages, region, hourly_rate, and availability when present.
                - For activities: respect min_age vs traveler ages when preferences mention children.
                """);

        if (ragLoaded) {
            sb.append("\n\n--- CATALOG JSON (authoritative) ---\n");
            sb.append(catalogJson);
        } else {
            sb.append("\n\n(No embedded catalog was loaded on the server — give general guidance and ask clarifying questions.)");
        }
        return sb.toString();
    }

    private String buildUserContent(ChatbotRequest request) {
        StringBuilder sb = new StringBuilder();
        RagTripPreferences p = request.getPreferences();
        if (p != null) {
            sb.append("Structured trip preferences:\n");
            if (p.getBudgetEur() != null) sb.append("- Budget (EUR ballpark): ").append(p.getBudgetEur()).append('\n');
            if (p.getSeason() != null && !p.getSeason().isBlank()) sb.append("- Season: ").append(p.getSeason().trim()).append('\n');
            if (p.getDestinationHint() != null && !p.getDestinationHint().isBlank()) {
                sb.append("- Destination / region hint: ").append(p.getDestinationHint().trim()).append('\n');
            }
            if (p.getAdults() != null) sb.append("- Adults: ").append(p.getAdults()).append('\n');
            if (p.getYoungestChildAge() != null) sb.append("- Youngest child age: ").append(p.getYoungestChildAge()).append('\n');
            if (p.getInterests() != null && !p.getInterests().isBlank()) {
                sb.append("- Interests: ").append(p.getInterests().trim()).append('\n');
            }
            sb.append('\n');
        }
        String msg = request.getMessage();
        if (msg != null && !msg.isBlank()) {
            sb.append("User message:\n").append(msg.trim());
        } else {
            sb.append("User message:\nPlease recommend the best destinations, hotels, activities, and guides from the catalog based on my preferences above.");
        }
        return sb.toString();
    }

    private static String truncate(String s, int max) {
        if (s == null) return "";
        return s.length() <= max ? s : s.substring(0, max - 1) + "…";
    }
}
