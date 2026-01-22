package com.example.apigateway.dto;

import java.time.LocalDateTime;


public record ChatSummaryResponse(
        Long chatId,
        Long senderId,
        Long receiverId,
        Long itemId,
        String lastMessage,
        LocalDateTime lastUpdated
) {}