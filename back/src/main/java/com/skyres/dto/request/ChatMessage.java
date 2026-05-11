package com.skyres.dto.request;

import lombok.Data;

@Data
public class ChatMessage {
    private String role;
    private String content;
}
