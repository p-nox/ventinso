package com.example.chat_service.dto;

import lombok.Builder;
import java.time.LocalDateTime;

@Builder
public record ChatSummaryResponse(
        Long chatId,
        Long senderId,
        Long receiverId,
        Long itemId,
        String lastMessage,
        LocalDateTime lastUpdated
) {}