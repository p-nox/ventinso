package com.example.chat_service.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.upload.dir}")
    private String uploadDir;


    // Νέα μέθοδος για byte[]
    public String storeFile(byte[] fileData, String originalFilename, Long chatId) throws IOException {
        if (fileData == null || fileData.length == 0) {
            throw new IllegalArgumentException("Cannot store empty file");
        }

        // Δημιουργία φακέλου για το chat
        Path chatFolder = Paths.get(uploadDir, String.valueOf(chatId));
        if (!Files.exists(chatFolder)) {
            Files.createDirectories(chatFolder);
        }

        // Παίρνουμε extension από το originalFilename
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        // Δημιουργία μοναδικού filename
        String filename = UUID.randomUUID().toString() + extension;

        Path destination = chatFolder.resolve(filename).normalize().toAbsolutePath();

        // Αποθήκευση των bytes στο αρχείο
        Files.write(destination, fileData, StandardOpenOption.CREATE);

        return filename;
    }


    public String storeTempFile(byte[] fileBytes, String fileName, Long itemId) throws IOException {
        Path tempDir = Paths.get("uploads/temp", itemId.toString());
        if (!Files.exists(tempDir)) {
            Files.createDirectories(tempDir);
        }
        Path filePath = tempDir.resolve(fileName);
        Files.write(filePath, fileBytes);
        return filePath.toString();
    }


    public Path getStorageLocation() {
        return Paths.get(uploadDir).normalize();
    }
}
