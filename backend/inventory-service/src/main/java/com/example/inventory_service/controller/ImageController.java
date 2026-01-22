package com.example.inventory_service.controller;

import com.example.inventory_service.service.ImageStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.concurrent.TimeUnit;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/images")
@Tag(name = "Images", description = "Image storage and retrieval")
public class ImageController {

    @Value("${app.upload.dir}")
    private String uploadDir;
    private final ImageStorageService imageStorageService;

    @GetMapping("/{itemId}/{filename}")
    public ResponseEntity<Resource> getImage(
            @PathVariable Long itemId,
            @PathVariable String filename) throws IOException {

        Path path = Paths.get(uploadDir, String.valueOf(itemId), filename);
        if (!Files.exists(path)) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new InputStreamResource(Files.newInputStream(path));
        MediaType mediaType;
        if (filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg")) {
            mediaType = MediaType.IMAGE_JPEG;
        } else if (filename.toLowerCase().endsWith(".png")) {
            mediaType = MediaType.IMAGE_PNG;
        } else {
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .cacheControl(CacheControl.maxAge(30, TimeUnit.DAYS))
                .body(resource);
    }

    @DeleteMapping("/{itemId}/{filename}")
    @Operation(summary = "Delete image", description = "Delete an image by its filename")
    public ResponseEntity<Void> deleteImage(
            @PathVariable Long itemId,
            @PathVariable String filename) {
        imageStorageService.deleteImage(itemId, filename);
        return ResponseEntity.noContent().build();
    }
}
