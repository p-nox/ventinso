package com.example.chat_service.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class WebSocketMessageRequest {
    private MessageRequest message; // ήδη υπάρχει
    private List<FileChunk> chunks;
    private String fileExtension; // extension ολόκληρου αρχείου
    private Integer totalFiles;
    private Integer totalChunks;   // συνολικός αριθμός chunks για το αρχείο
    private Long chatId;
}