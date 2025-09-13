package com.example.user_service.service;

import com.example.auth_service.event.NewUserEvent;
import com.example.user_service.dto.*;
import com.example.user_service.entity.User;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.function.BiConsumer;
import java.util.function.Function;

public interface UserService {

    UserResponse getUserById(Long userId);

    UserSummaryResponse getUserSummary(Long userId);

    List<FavoriteResponse> getUsersFavorites(Long userId);

    UpdateUserAvatarResponse updateUserProfile(Long userId, UpdateProfileRequest updatedUser, MultipartFile image);

    void updateUserField(Long userId, String newValue,
                         Function<User, String> getter,
                         BiConsumer<User, String> setter);

    void toggleFavorite(Long userId, Long itemId);

    void deleteUser(Long userId);

    void createNewUserProfile(NewUserEvent event);

    List<Long> getWatchersForItem(Long itemId);

    void updateSaleStats(Long userId, LocalDateTime sentAt, LocalDateTime arrivedAt);

    User findUserById(Long userId);

    byte[] loadImage(String filename);


}
