package com.example.notification_service.service.notificationSettings;

import com.example.notification_service.dto.NotificationSettingsResponse;
import com.example.notification_service.dto.NotificationSettingRequest;
import com.example.notification_service.entity.NotificationSettings;
import com.example.notification_service.enums.EventAction;
import com.example.notification_service.exception.ResourceNotFoundException;
import com.example.notification_service.repository.NotificationSettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationSettingsServiceImpl implements NotificationSettingsService {

    private final NotificationSettingsRepository notificationSettingsRepository;

    @Override
    public NotificationSettingsResponse getSettings(Long userId) {

        NotificationSettings notificationSettings = notificationSettingsRepository.findByUserId(userId)
                .orElseGet(() -> {
                    log.info("[NotificationPreferencesService] No preferences found for userId={}, creating default", userId);
                    return new NotificationSettings(userId);
                });

        // Map EventAction -> NotificationTypeResponse (desktop/email)
        Map<EventAction, NotificationSettingsResponse.NotificationTypeResponse> notificationsMap =
                notificationSettings.getNotifications().entrySet().stream()
                        .collect(Collectors.toMap(
                                Map.Entry::getKey,
                                e -> new NotificationSettingsResponse.NotificationTypeResponse(
                                        e.getValue().isDesktop(),
                                        e.getValue().isEmail()
                                )
                        ));

        return NotificationSettingsResponse.builder()
                .userId(notificationSettings.getUserId())
                .notificationSettings(notificationsMap)
                .build();
    }

    @Override
    @Transactional
    public void toggleNotificationPreference(Long userId, NotificationSettingRequest request) {

        NotificationSettings notificationSettings = notificationSettingsRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User with id " + userId + " doesn't exist!")
                );

        // Find type for specific EventAction
        NotificationSettings.NotificationType type = notificationSettings.getNotifications()
                .computeIfAbsent(request.getAction(), k -> NotificationSettings.NotificationType.defaultEnabled());


        if ("desktop".equalsIgnoreCase(request.getType())) {
            type.setDesktop(request.isEnabled());
        } else if ("email".equalsIgnoreCase(request.getType())) {
            type.setEmail(request.isEnabled());
        }

        notificationSettingsRepository.save(notificationSettings);
    }

    @Override
    public boolean isEnabled(Long userId, EventAction action, String type) {
        return notificationSettingsRepository.findByUserId(userId)
                .map(prefs -> {
                    NotificationSettings.NotificationType nType = prefs.getNotifications().get(action);
                    if (nType == null) return false;
                    return "desktop".equalsIgnoreCase(type) ? nType.isDesktop() : nType.isEmail();
                })
                .orElse(false);
    }


}