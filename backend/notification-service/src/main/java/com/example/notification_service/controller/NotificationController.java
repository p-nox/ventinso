package com.example.notification_service.controller;

import com.example.notification_service.dto.NotificationResponse;
import com.example.notification_service.service.NotificationService;
import com.example.notification_service.service.SseNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Notifications", description = "User notifications management")
public class NotificationController {

    private final NotificationService notificationService;
    private final SseNotificationService sseNotificationService;

    @GetMapping("/stream/{userId}")
    public SseEmitter streamNotifications(@PathVariable long userId) {
        return sseNotificationService.register(userId);
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get user notifications", description = "Retrieve all notifications for a specific user")
    public ResponseEntity<List<NotificationResponse>> getUserNotifications(
            @Parameter(description = "ID of the user") @PathVariable Long userId) {
        List<NotificationResponse> notifications = notificationService.getAllUserNotifications(userId);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/user/{userId}/unread")
    @Operation(summary = "Get unread notifications", description = "Retrieve all unread notifications for a specific user")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotifications(
            @Parameter(description = "ID of the user") @PathVariable Long userId) {
        List<NotificationResponse> unread = notificationService.getUnreadNotifications(userId);
        return ResponseEntity.ok(unread);
    }

    @PatchMapping("/notification/{id}/read")
    @Operation(summary = "Mark notification as read", description = "Mark a specific notification as read")
    public ResponseEntity<Void> markAsRead(
            @Parameter(description = "ID of the notification") @PathVariable String id) {
        notificationService.markAsRead(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/users/{userId}/notifications/read-all")
    @Operation(summary = "Mark all notifications as read", description = "Mark all notifications of a specific user as read")
    public ResponseEntity<Void> markAllAsRead(
            @Parameter(description = "ID of the user") @PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.noContent().build();
    }
}

