package com.skyres.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Loads phpMyAdmin JSON export(s) from {@code RAG/skyres_db.json} (or configurable path)
 * and exposes a compact text digest for LLM context (RAG).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RagKnowledgeLoader {

    private final ObjectMapper objectMapper;

    @Value("${skyres.rag.skyres-db-json:}")
    private String configuredPath;

    @Getter
    private String knowledgeDigest = "";
    @Getter
    private boolean loaded;

    @PostConstruct
    public void load() {
        try {
            JsonNode root = readExportRoot();
            if (root == null || root.isMissingNode()) {
                log.warn("RAG: no skyres_db export found — assistant will run without catalog snapshot.");
                knowledgeDigest = "";
                loaded = false;
                return;
            }
            Map<String, ArrayNode> tables = indexTables(root);
            knowledgeDigest = buildDigest(tables);
            loaded = !knowledgeDigest.isBlank();
            log.info("RAG: loaded catalog digest (~{} chars).", knowledgeDigest.length());
        } catch (Exception e) {
            log.error("RAG: failed to load knowledge JSON: {}", e.getMessage());
            knowledgeDigest = "";
            loaded = false;
        }
    }

    private JsonNode readExportRoot() throws Exception {
        if (configuredPath != null && !configuredPath.isBlank()) {
            Path p = Path.of(configuredPath.trim());
            if (Files.isRegularFile(p)) {
                return objectMapper.readTree(Files.newInputStream(p));
            }
            log.warn("RAG: configured path does not exist: {}", p.toAbsolutePath());
        }

        String userDir = System.getProperty("user.dir", ".");
        Path[] candidates = new Path[]{
                Path.of(userDir).resolve("RAG/skyres_db.json").normalize(),
                Path.of(userDir).resolve("../RAG/skyres_db.json").normalize(),
                Path.of(userDir).resolve("../../RAG/skyres_db.json").normalize(),
        };
        for (Path p : candidates) {
            if (Files.isRegularFile(p)) {
                log.info("RAG: using {}", p.toAbsolutePath());
                return objectMapper.readTree(Files.newInputStream(p));
            }
        }

        ClassPathResource cp = new ClassPathResource("rag/skyres_db.json");
        if (cp.exists()) {
            try (InputStream in = cp.getInputStream()) {
                log.info("RAG: using classpath rag/skyres_db.json");
                return objectMapper.readTree(in);
            }
        }
        return null;
    }

    private static Map<String, ArrayNode> indexTables(JsonNode root) {
        Map<String, ArrayNode> tables = new LinkedHashMap<>();
        if (!root.isArray()) {
            return tables;
        }
        for (JsonNode el : root) {
            if (!"table".equals(el.path("type").asText())) {
                continue;
            }
            String name = el.path("name").asText("");
            JsonNode data = el.get("data");
            if (name.isBlank() || data == null || !data.isArray()) {
                continue;
            }
            tables.put(name, (ArrayNode) data);
        }
        return tables;
    }

    private String buildDigest(Map<String, ArrayNode> tables) {
        ObjectNode out = objectMapper.createObjectNode();

        if (tables.containsKey("destinations")) {
            out.set("destinations", truncateRows(sanitizeDestinations(tables.get("destinations")), 24));
        }
        if (tables.containsKey("hotels")) {
            out.set("hotels", truncateRows(sanitizeHotels(tables.get("hotels")), 40));
        }
        if (tables.containsKey("activities")) {
            out.set("activities", truncateRows(sanitizeActivities(tables.get("activities")), 40));
        }
        if (tables.containsKey("guides")) {
            ArrayNode guides = tables.get("guides");
            ArrayNode users = tables.get("users");
            out.set("guides", truncateRows(enrichGuides(guides, users), 36));
        }

        try {
            return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(out);
        } catch (Exception e) {
            return out.toString();
        }
    }

    private ArrayNode sanitizeDestinations(ArrayNode rows) {
        ArrayNode a = objectMapper.createArrayNode();
        for (JsonNode r : rows) {
            ObjectNode o = objectMapper.createObjectNode();
            copyIfPresent(o, r, "id", "city", "country", "climate", "estimated_budget", "average_rating", "trending", "description");
            a.add(o);
        }
        return a;
    }

    private ArrayNode sanitizeHotels(ArrayNode rows) {
        ArrayNode a = objectMapper.createArrayNode();
        for (JsonNode r : rows) {
            ObjectNode o = objectMapper.createObjectNode();
            copyIfPresent(o, r, "id", "name", "destination_id", "stars", "price_per_night", "available",
                    "average_rating", "description", "address");
            a.add(o);
        }
        return a;
    }

    private ArrayNode sanitizeActivities(ArrayNode rows) {
        ArrayNode a = objectMapper.createArrayNode();
        for (JsonNode r : rows) {
            ObjectNode o = objectMapper.createObjectNode();
            copyIfPresent(o, r, "id", "name", "type", "price", "season", "min_age", "destination_id", "description");
            a.add(o);
        }
        return a;
    }

    private ArrayNode enrichGuides(ArrayNode guides, ArrayNode users) {
        Map<String, JsonNode> userById = new LinkedHashMap<>();
        if (users != null) {
            for (JsonNode u : users) {
                String id = u.path("id").asText("");
                if ("GUIDE".equalsIgnoreCase(u.path("role").asText("")) && !id.isBlank()) {
                    ObjectNode slim = objectMapper.createObjectNode();
                    slim.put("id", id);
                    putText(slim, "first_name", u.path("first_name").asText(null));
                    putText(slim, "last_name", u.path("last_name").asText(null));
                    putText(slim, "bio", shorten(u.path("bio").asText(null), 240));
                    userById.put(id, slim);
                }
            }
        }
        ArrayNode a = objectMapper.createArrayNode();
        for (JsonNode g : guides) {
            ObjectNode o = objectMapper.createObjectNode();
            copyIfPresent(o, g, "id", "user_id", "languages", "hourly_rate", "available", "region", "average_rating");
            String uid = g.path("user_id").asText("");
            JsonNode u = userById.get(uid);
            if (u != null) {
                o.set("guide_profile", u);
            }
            a.add(o);
        }
        return a;
    }

    private static void putText(ObjectNode o, String field, String v) {
        if (v != null && !v.isBlank()) {
            o.put(field, v);
        }
    }

    private static String shorten(String s, int max) {
        if (s == null) return null;
        String t = s.trim().replaceAll("\\s+", " ");
        return t.length() <= max ? t : t.substring(0, max - 1) + "…";
    }

    private static void copyIfPresent(ObjectNode dest, JsonNode src, String... fields) {
        for (String f : fields) {
            JsonNode v = src.get(f);
            if (v != null && !v.isNull() && !(v.isTextual() && v.asText().isBlank())) {
                dest.set(f, v);
            }
        }
    }

    private ArrayNode truncateRows(ArrayNode rows, int maxRows) {
        if (rows.size() <= maxRows) {
            return rows;
        }
        ArrayNode a = objectMapper.createArrayNode();
        Iterator<JsonNode> it = rows.elements();
        int n = 0;
        while (it.hasNext() && n < maxRows) {
            a.add(it.next());
            n++;
        }
        return a;
    }
}
