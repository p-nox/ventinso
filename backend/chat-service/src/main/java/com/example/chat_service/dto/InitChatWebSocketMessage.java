package com.example.chat_service.dto;

import lombok.Builder;

@Builder
public record InitChatWebSocketMessage (
        ChatSummaryResponse chatSummaryResponse,
        String senderUsername,
        String senderAvatarUrl
) {}
