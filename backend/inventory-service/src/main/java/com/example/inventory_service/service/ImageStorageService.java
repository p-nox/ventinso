package com.example.inventory_service.service;

import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface ImageStorageService {


    void setThumbnail(Long itemId, String filename);

    byte[] loadImage(String filename);

    void deleteImage(String filename);

    void saveImagesForItem(Long itemId, List<MultipartFile> files, String filename);

    List<String> getImageUrlsForItem(Long itemId);

    String getThumbnailForItem(Long itemId);
}
