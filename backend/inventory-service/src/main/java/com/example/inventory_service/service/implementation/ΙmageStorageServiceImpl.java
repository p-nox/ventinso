package com.example.inventory_service.service.implementation;

import com.example.inventory_service.entity.ItemImage;
import com.example.inventory_service.repository.ItemImageRepository;
import com.example.inventory_service.service.ImageStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FilenameUtils;
import org.apache.logging.log4j.util.PropertySource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;


@Slf4j
@Service
@RequiredArgsConstructor
public class ΙmageStorageServiceImpl implements ImageStorageService {

    private final ItemImageRepository itemImageRepository;

    @Value("${app.upload.dir}")
    private String uploadDir;


    @Transactional
    public void setThumbnail(Long itemId, String filename) {
        itemImageRepository.clearThumbnailForItem(itemId);
        ItemImage image = itemImageRepository.findByItemIdAndFilename(itemId, filename)
                .orElseThrow(() -> new RuntimeException("Image not found"));

        if (!image.getItemId().equals(itemId)) {
            throw new RuntimeException("Image does not belong to the specified item");
        }

        image.setThumbnail(true);
        itemImageRepository.save(image);
    }

    @Override
    public byte[] loadImage(Long itemId, String filename) {
        ItemImage itemImage = itemImageRepository.findByItemIdAndFilename(itemId, filename)
                .orElseThrow(() -> new RuntimeException("Image not found"));

        try {
            Path resolvedPath = Paths.get(itemImage.getPath()); // χρησιμοποιείς το full path
            return Files.readAllBytes(resolvedPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not read image file: " + filename, e);
        }
    }

    @Override
    @Transactional
    public void deleteImage(Long itemId, String filename) {
        ItemImage image = itemImageRepository
                .findByItemIdAndFilename(itemId, filename)
                .orElseThrow(() ->
                        new RuntimeException("Image not found for itemId=" + itemId));

        itemImageRepository.delete(image);

        Path filePath = Paths.get(image.getPath());
        try {
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete image file " + filename, e);
        }
    }


    @Override
    public void saveImagesForItem(Long itemId, List<MultipartFile> files, String thumbnailFilename) {


        if (files == null || files.isEmpty()) {
            List<ItemImage> existingImages = itemImageRepository.findAllByItemId(itemId);
            for (ItemImage image : existingImages) {
                image.setThumbnail(image.getFilename().equals(thumbnailFilename));
            }
            itemImageRepository.saveAll(existingImages);
            return;
        }

        for (MultipartFile file : files) {
            String originalFilename = file.getOriginalFilename();
            String extension = FilenameUtils.getExtension(originalFilename);
            String filename = UUID.randomUUID() + "." + extension;

            try (InputStream is = file.getInputStream()) {
                Path storageLocation = Paths.get(uploadDir);
                Path itemFolder = storageLocation.resolve(String.valueOf(itemId));
                if (!Files.exists(itemFolder)) {
                    Files.createDirectories(itemFolder);
                }
                Path targetPath = itemFolder.resolve(filename);
                Files.copy(is, targetPath, StandardCopyOption.REPLACE_EXISTING);

                boolean isThumbnail = originalFilename.equals(thumbnailFilename);

                ItemImage itemImage = ItemImage.builder()
                        .itemId(itemId)
                        .filename(filename)
                        .path(targetPath.toString())
                        .thumbnail(isThumbnail)
                        .build();

                itemImageRepository.save(itemImage);

            } catch (IOException e) {
                throw new RuntimeException("Failed to store image " + originalFilename, e);
            }
        }
    }


    @Override
    public void deleteImagesForItem(Long itemId){

        Path storageLocation = Paths.get(uploadDir);
        Path itemFolder = storageLocation.resolve(String.valueOf(itemId));

        try (Stream<Path> walk = Files.walk(itemFolder)) {
            walk
                    .sorted(Comparator.reverseOrder()) // files first, then dir
                    .forEach(path -> {
                        try {
                            Files.deleteIfExists(path);
                        } catch (IOException e) {
                            throw new UncheckedIOException(e);
                        }
                    });
        } catch (IOException e) {
            throw new RuntimeException(
                    "Failed to delete upload directory for itemId=" + itemId, e
            );
        }

    }

    @Override
    public List<String> getImageUrlsForItem(Long itemId) {
        return itemImageRepository.findAllByItemId(itemId).stream()
                .map(image -> "/api/images/" + image.getItemId() + "/" + image.getFilename())
                .toList();
    }

    @Override
    public String getThumbnailForItem(Long itemId) {
        ItemImage thumbnail = itemImageRepository.findByItemIdAndThumbnailTrue(itemId)
                .orElseThrow(() -> new RuntimeException("No thumbnail found"));
        return "/api/images/" + itemId + "/" + thumbnail.getFilename();
    }


}
