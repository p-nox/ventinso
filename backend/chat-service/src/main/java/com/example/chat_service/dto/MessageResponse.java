package com.example.chat_service.dto;

import lombok.Builder;
import java.time.LocalDateTime;

@Builder
public record MessageResponse(
        Long id,
        Long userId,
        String avatarUrl,
        String previewContent, // used for chat sidebar
        String type,
        Object payload, // actual message content
        boolean isReadByReceiver,
        LocalDateTime timestamp
) {}

