package com.example.chat_service.controller;

import com.example.chat_service.dto.MessageRequest;
import com.example.chat_service.dto.MessageResponse;
import com.example.chat_service.dto.ChatSummaryResponse;
import com.example.chat_service.service.ChatServiceImpl;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.concurrent.TimeUnit;

@RestController
@AllArgsConstructor
@RequestMapping("/api/chat")
@Slf4j
public class ChatController {

    private final ChatServiceImpl chatService;

    @GetMapping("/user-chats/{userId}")
    public ResponseEntity<List<ChatSummaryResponse>> getUserChats(@PathVariable("userId") Long userId) {
        List<ChatSummaryResponse> chats = chatService.getUserChats(userId);
        return ResponseEntity.ok(chats);
    }

    @GetMapping("/chat-messages/{chatId}")
    public ResponseEntity<List<MessageResponse>> getChatMessages(
            @PathVariable Long chatId,
            @RequestParam Long userId
    ) {
        List<MessageResponse> messages = chatService.getChatMessages(chatId, userId);
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/init-chat")
    public ResponseEntity<ChatSummaryResponse> initChat(@RequestBody MessageRequest request) {
        ChatSummaryResponse response = chatService.initChat(request);
        return ResponseEntity.ok(response);
    }


    @DeleteMapping("/{chatId}/{userId}")
    public ResponseEntity<Void> deleteChat(@PathVariable Long chatId, @PathVariable Long userId) {
        chatService.deleteChatForUser(chatId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/uploads/chat/media/{chatId}/{filename}")
    public ResponseEntity<byte[]> getImage(
            @PathVariable Long chatId,
            @PathVariable String filename) {

        byte[] imageData = chatService.loadImage(chatId, filename);

        MediaType mediaType;
        if (filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg")) {
            mediaType = MediaType.IMAGE_JPEG;
        } else if (filename.toLowerCase().endsWith(".png")) {
            mediaType = MediaType.IMAGE_PNG;
        } else {
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
        }
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(mediaType);
        headers.setCacheControl(CacheControl.maxAge(30, TimeUnit.DAYS));

        return new ResponseEntity<>(imageData, headers, HttpStatus.OK);
    }
}

