package com.example.apigateway.dto;

import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Builder
public record UserChatsResponse (

    Long chatId,
    Long senderId,
    Long receiverId,
    Long itemId,
    String lastMessage,
    LocalDateTime lastUpdated,


    // User receiver Info
    String username,
    String avatarUrl,

    // Item Info
    String title,
    Float price,
    String thumbnailUrl,
    String condition
) {}