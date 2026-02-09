package com.example.user_service.service.implementation;

import com.example.auth_service.event.NewUserEvent;
import com.example.user_service.dto.request.UpdateProfileRequest;
import com.example.user_service.dto.response.*;
import com.example.user_service.entity.Favorite;
import com.example.user_service.entity.User;
import com.example.user_service.enums.UserStatus;
import com.example.user_service.event.UserWatchersUpdateEvent;
import com.example.user_service.exception.ResourceNotFoundException;
import com.example.user_service.repository.FavoriteRepository;
import com.example.user_service.repository.UserRepository;
import com.example.user_service.service.UserService;
import com.example.user_service.utils.Mapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.BiConsumer;
import java.util.function.Function;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    private final UserRepository userRepository;
    private final RatingService ratingService;
    private final FavoriteRepository favoriteRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final Mapper mapper;


    @Override
    public UserBootstrapResponse getUserBootstrap(Long userId) {
        User user = findUserById(userId);
        List<FavoriteResponse> watchlist = getUsersFavorites(user.getId());
        return UserBootstrapResponse.builder()
                .username(user.getUsername())
                .avatarUrl(user.getAvatarUrl())
                .watchlist(watchlist)
                .build();

    }

    @Override
    public UserResponse getUserById(Long userId) {
        return mapper.toDto(findUserById(userId));
    }

    @Override
    public UserSummaryResponse getUserSummary(Long userId) {
        User user = findUserById(userId);
        UserSummaryResponse response = mapper.toUserSummaryView(user);
        response.setRatings(ratingService.getRatingsForUser(userId));
        return response;
    }

    @Override
    public List<FavoriteResponse> getUsersFavorites(Long userId) {
        List<Favorite> watchlist = favoriteRepository.findAllByUserId(userId);
        return convertToDtoList(watchlist, mapper::toDto);
    }

    @Override
    public UpdateUserAvatarResponse updateUserProfile(Long userId, UpdateProfileRequest updatedUser, MultipartFile image) {
        User existingUser = findUserById(userId);
        if (image != null) {
            if (existingUser.getAvatarUrl() != null && !existingUser.getAvatarUrl().equals("default.png")) {
                deleteImage(existingUser.getAvatarUrl());
            }
            String avatarUrl = saveUserAvatar(userId, image);
            existingUser.setAvatarUrl(avatarUrl);
        }

        mapper.updateUserFromDto(updatedUser, existingUser);
        User user = userRepository.save(existingUser);
        return UpdateUserAvatarResponse.builder()
                .avatarUrl(user.getAvatarUrl()).build();
    }

    @Override
    public void updateUserField(Long userId, String newValue,
                                Function<User, String> getter,
                                BiConsumer<User, String> setter) {

        if (newValue == null) return;

        User user = findUserById(userId);
        if (!newValue.equals(getter.apply(user))) {
            setter.accept(user, newValue);
            userRepository.save(user);
        }
    }

    @Override
    public void toggleFavorite(Long userId, Long itemId) {
        User user = findUserById(userId);
        Optional<Favorite> existingFavorite =
                favoriteRepository.findByUserIdAndItemId(userId, itemId);

        UserWatchersUpdateEvent event = UserWatchersUpdateEvent.builder()
                .itemId(itemId)
                .build();

        if (existingFavorite.isPresent()) {
            favoriteRepository.delete(existingFavorite.get());
            event.setDelta(-1);
        } else {
            Favorite favorite = Favorite.builder()
                    .user(user)
                    .itemId(itemId)
                    .build();
            favoriteRepository.save(favorite);
            event.setDelta(+1);
        }
        kafkaTemplate.send("user.item.watchers.update", event);
    }

    @Override
    public void deleteUser(Long userId) {
        userRepository.deleteByIdDirectly(userId);
    }

    @Override
    public void createNewUserProfile(NewUserEvent newUserEvent) {
        User newUserProfile = User.builder()
                .id(newUserEvent.getUserId())
                .name(newUserEvent.getName())
                .username(newUserEvent.getUsername())
                .email(newUserEvent.getEmail())
                .status(UserStatus.valueOf(newUserEvent.getStatus()))
                .registeredAt(newUserEvent.getRegisteredAt())
                .build();
        userRepository.save(newUserProfile);
    }

    @Override
    public List<Long> getWatchersForItem(Long itemId) {
        return Optional.ofNullable(
                favoriteRepository.findUserIdsByItemId(itemId)
        ).orElse(Collections.emptyList());
    }

    @Transactional
    @Override
    public void updateSaleStats(Long userId, LocalDateTime sentAt, LocalDateTime arrivedAt) {
        User user = findUserById(userId);
        int oldTotalSales = user.getTotalSales();
        long oldAvgDeliveryTime = user.getAverageDeliveryTime() != null ? user.getAverageDeliveryTime() : 0L;

        long newDeliveryTime = java.time.Duration.between(sentAt, arrivedAt).getSeconds();
        long totalDeliveryTime = oldAvgDeliveryTime * oldTotalSales + newDeliveryTime;
        int newTotalSales = oldTotalSales + 1;
        long newAvgDeliveryTime = totalDeliveryTime / newTotalSales;

        user.setTotalSales(newTotalSales);
        user.setAverageDeliveryTime(newAvgDeliveryTime);
        userRepository.save(user);
    }

    @Override
    public User findUserById(Long userId) {
        return userRepository.findById(userId).orElseThrow(
                () -> new ResourceNotFoundException("User with id " + userId + " doesn't exist!")
        );
    }

    @Override
    public byte[] loadImage(String filename) {
        try {
            Path storageLocation = getStorageLocation();
            log.info("Storage location: {}", storageLocation);

            log.info("Filename received: {}", filename);

            Path resolvedPath = storageLocation.resolve(filename).normalize();
            log.info("Resolved path: {}", resolvedPath);

            byte[] fileBytes = Files.readAllBytes(resolvedPath);
            log.info("Read {} bytes from file", fileBytes.length);

            return fileBytes;
        } catch (IOException e) {
            log.error("Failed to load image '{}'", filename, e);
            throw new RuntimeException("Could not read image file: " + filename, e);
        }
    }

    public String saveUserAvatar(Long userId, MultipartFile image) {
        String originalFilename = image.getOriginalFilename();
        String extension = FilenameUtils.getExtension(originalFilename);
        String filename = userId + "." + extension;

        try (InputStream is = image.getInputStream()) {
            Path storageLocation = getStorageLocation();
            if (!Files.exists(storageLocation)) {
                Files.createDirectories(storageLocation);
                log.info("Created storage directory at {}", storageLocation);
            }
            Path targetPath = storageLocation.resolve(filename);
            log.info("Saving image. Original filename: {}, generated filename: {}, target path: {}",
                    originalFilename, filename, targetPath);

            Files.copy(is, targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            log.error("Failed to store image '{}'", originalFilename, e);
            throw new RuntimeException("Failed to store image " + originalFilename, e);
        }
        return filename;
    }


    public void deleteImage(String filename) {
        Path filePath = getStorageLocation().resolve(filename).normalize();
        try {
            Files.deleteIfExists(filePath);
            log.info("Deleted image file from disk: {}", filePath);
        } catch (IOException e) {
            log.error("Failed to delete image file {}", filePath, e);
            throw new RuntimeException("Failed to delete image file " + filename, e);
        }
    }

    private <T, R> List<R> convertToDtoList(List<T> entities, Function<T, R> mapper) {
        return entities.stream().map(mapper).toList();
    }

    private Path getStorageLocation() {
        return Paths.get(uploadDir).normalize();
    }

}
