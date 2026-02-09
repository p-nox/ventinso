package com.example.apigateway.dto.serviceResponse;

import java.time.LocalDateTime;


public record ChatServiceResponse(
        Long chatId,
        Long senderId,
        Long receiverId,
        Long itemId,
        String lastMessage,
        LocalDateTime lastUpdated
) {}