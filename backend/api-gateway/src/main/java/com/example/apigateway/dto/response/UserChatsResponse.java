package com.example.apigateway.dto.response;

import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record UserChatsResponse (

    Long chatId,
    Long senderId,
    Long receiverId,
    Long itemId,
    String lastMessage,
    LocalDateTime lastUpdated,
    Long itemOwnerId,



    // User receiver Info
    String username,
    String avatarUrl,

    // Item Info
    String title,
    Float price,
    String thumbnailUrl,
    String condition
) {}