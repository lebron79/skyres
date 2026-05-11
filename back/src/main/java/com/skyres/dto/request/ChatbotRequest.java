package com.skyres.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class ChatbotRequest {
    /** Latest user message (may be empty if only submitting preferences). */
    private String message;
    /** Prior turns: role = user | assistant */
    private List<ChatMessage> history;
    /** Optional structured trip hints (merged into the prompt). */
    private RagTripPreferences preferences;
}
