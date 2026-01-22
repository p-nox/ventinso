package com.example.user_service.controller;

import com.example.user_service.dto.*;
import com.example.user_service.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.concurrent.TimeUnit;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Users", description = "User profile, watchlist and avatar management")
public class UserController {


    private final UserService userService;

    @GetMapping("/{userId}/summary")
    @Operation(summary = "Get user summary", description = "Retrieve summary info for a specific user")
    public ResponseEntity<UserSummaryResponse> getUserSummary(
            @Parameter(description = "ID of the user") @PathVariable Long userId) {
        UserSummaryResponse response = userService.getUserSummary(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{userId}/profile")
    @Operation(summary = "Get user profile", description = "Retrieve detailed profile info of a user")
    public ResponseEntity<UserResponse> getUserProfile(
            @Parameter(description = "ID of the user") @PathVariable Long userId) {
        UserResponse response = userService.getUserById(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{userId}/watchlist")
    @Operation(summary = "Get user watchlist", description = "Retrieve the watchlist (favorites) of a user")
    public ResponseEntity<List<FavoriteResponse>> getUserWatchlist(
            @Parameter(description = "ID of the user") @PathVariable Long userId) {
        List<FavoriteResponse> response = userService.getUsersFavorites(userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/{userId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Update user profile", description = "Update user profile details and avatar image")
    public ResponseEntity<UpdateUserAvatarResponse> updateUserProfile(
            @Parameter(description = "ID of the user") @PathVariable Long userId,
            @RequestPart(value = "data", required = false) UpdateProfileRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        UpdateUserAvatarResponse response = userService.updateUserProfile(userId, request, image);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{userId}/watchlist/{itemId}")
    @Operation(summary = "Toggle watchlist item", description = "Add or remove an item from the user's watchlist")
    public ResponseEntity<Void> toggleFavorite(
            @Parameter(description = "ID of the user") @PathVariable Long userId,
            @Parameter(description = "ID of the item") @PathVariable Long itemId) {
        userService.toggleFavorite(userId, itemId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{filename}")
    @Operation(summary = "Get user image", description = "Retrieve a stored user profile image by filename")
    public ResponseEntity<byte[]> getImage(
            @Parameter(description = "Filename of the image") @PathVariable String filename) {

        byte[] imageData = userService.loadImage(filename);
        MediaType mediaType;
        if (filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg")) {
            mediaType = MediaType.IMAGE_JPEG;
        } else if (filename.toLowerCase().endsWith(".png")) {
            mediaType = MediaType.IMAGE_PNG;
        } else {
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(mediaType);
        headers.setCacheControl(CacheControl.maxAge(30, TimeUnit.DAYS));

        return new ResponseEntity<>(imageData, headers, HttpStatus.OK);
    }
}

