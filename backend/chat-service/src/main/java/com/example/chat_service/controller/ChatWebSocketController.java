package com.example.chat_service.controller;

import com.example.chat_service.dto.*;
import com.example.chat_service.exception.OfferActiveException;
import com.example.chat_service.service.ChatService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
@AllArgsConstructor
@Slf4j
public class ChatWebSocketController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/messages")
    public void sendMessage(WebSocketMessageRequest request) {

        try {
            MessageRequest msgReq = request.getMessage();
            if (msgReq != null && msgReq.getContent() != null && !msgReq.getContent().isEmpty()) {
                WebSocketMessage wsMessage = chatService.sendMessage(request);
                messagingTemplate.convertAndSend("/topic/messages/" + msgReq.getReceiverId(), wsMessage);
                messagingTemplate.convertAndSend("/topic/messages/" + msgReq.getSenderId(), wsMessage);
            }

            List<FileChunk> chunks = request.getChunks();
            if (chunks != null && !chunks.isEmpty()) {
                chatService.saveChunks(chunks, msgReq, request.getTotalChunks(), request.getChatId(), request.getTotalFiles());
            }
        } catch (OfferActiveException e) {
            WebSocketErrorMessage error = WebSocketErrorMessage.builder()
                    .errorType("OFFER_ACTIVE")
                    .message(e.getMessage())
                    .build();

            messagingTemplate.convertAndSend("/topic/messages/" + request.getMessage().getSenderId(), error);
        }
    }

}




