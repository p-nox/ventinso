package com.example.chat_service.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class FileChunk {
    private String fileName;     // όνομα αρχείου ή κάποιο id
    private String extension;    // jpg, png, mp4 κλπ.
    private int chunkIndex;      // ποιο κομμάτι είναι (0,1,2...)
    private int totalChunks;     // συνολικά chunks του αρχείου
    private String dataBase64;   // τα bytes του chunk σε Base64
}
