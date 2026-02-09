package com.example.notification_service.controller;

import com.example.notification_service.dto.NotificationSettingsResponse;
import com.example.notification_service.dto.NotificationSettingRequest;
import com.example.notification_service.service.notificationSettings.NotificationSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notification-preferences")
@RequiredArgsConstructor
public class NotificationSettingsController {

    private final NotificationSettingsService notificationPreferencesService;

    @GetMapping("/{userId}")
    public ResponseEntity<NotificationSettingsResponse> getPreferences(
            @PathVariable Long userId) {

        NotificationSettingsResponse response = notificationPreferencesService.getSettings(userId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{userId}/toggle")
    public ResponseEntity<Void> toggleNotification(
            @PathVariable Long userId,
            @RequestBody NotificationSettingRequest request) {

        notificationPreferencesService.toggleNotificationPreference(userId, request);
        return ResponseEntity.ok().build();
    }
}
