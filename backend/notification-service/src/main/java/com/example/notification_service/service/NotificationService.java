package com.example.notification_service.service;

import com.example.notification_service.dto.NotificationResponse;
import com.example.notification_service.entity.Notification;

import java.util.List;

public interface NotificationService {

    NotificationResponse saveNotification(Notification notifications);

    List<NotificationResponse> saveNotifications(List<Notification> notifications);

    List<NotificationResponse> getAllUserNotifications(Long  userId);

    List<NotificationResponse> getUnreadNotifications(Long userId);

    void markAsRead(String notificationId);

    void markAllAsRead(Long userId);

}