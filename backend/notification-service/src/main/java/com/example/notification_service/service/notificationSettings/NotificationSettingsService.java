package com.example.notification_service.service.notificationSettings;

import com.example.notification_service.dto.NotificationSettingsResponse;
import com.example.notification_service.dto.NotificationSettingRequest;
import com.example.notification_service.enums.EventAction;


public interface NotificationSettingsService {

    NotificationSettingsResponse getSettings(Long userId);

    void toggleNotificationPreference(Long userId, NotificationSettingRequest request);

    boolean isEnabled(Long userId, EventAction action, String type);
}
