package com.example.chat_service.service;

import com.example.chat_service.dto.*;
import java.util.List;

public interface ChatService {

    List<ChatSummaryResponse> getUserChats(Long userId);

    List<MessageResponse> getChatMessages(Long chatId, Long userId);

    void saveChunks(List<FileChunk> chunks, MessageRequest messageRequest, Integer totalChunks, Long chatId, Integer totalFiles);

    WebSocketMessage sendMessage(WebSocketMessageRequest request);

    ChatSummaryResponse initChat(MessageRequest request);

    void deleteChatForUser(Long chatId, Long userId);

    byte[] loadImage(Long chatId, String filename);
}
