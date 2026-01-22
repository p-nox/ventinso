package com.example.chat_service.dto;

import com.example.chat_service.enums.MessageType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MessageRequest {
    private Long senderId;
    private String senderUsername;
    private String senderAvatar;
    private Long receiverId;
    private String receiverUsername;
    private String receiverAvatar;
    private Long itemId;
    private String content;
    private MessageType messageType;
}
