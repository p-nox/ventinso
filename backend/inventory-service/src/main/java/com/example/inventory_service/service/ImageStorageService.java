package com.example.inventory_service.service;

import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface ImageStorageService {


    byte[] loadImage(Long itemId, String filename);

    void deleteImage(Long itemId, String filename);

    void saveImagesForItem(Long itemId, List<MultipartFile> files, String filename);

    void deleteImagesForItem(Long itemId);

    List<String> getImageUrlsForItem(Long itemId);

    String getThumbnailForItem(Long itemId);
}
