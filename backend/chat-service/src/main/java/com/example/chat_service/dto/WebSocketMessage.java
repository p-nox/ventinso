package com.example.chat_service.dto;

import lombok.Builder;

@Builder
public record WebSocketMessage (
    Long chatId,
    MessageResponse messageResponse
){}
