package com.example.notification_service.service;

import com.example.notification_service.entity.NotificationPreferences;
import com.example.notification_service.enums.EventAction;
import com.example.notification_service.repository.NotificationPreferencesRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class NotificationPreferencesService {

    private final NotificationPreferencesRepository repository;

    public boolean isEnabled(Long userId, EventAction action) {
        Optional<NotificationPreferences> prefs = repository.findById(userId);

        return prefs
                .map(p -> p.getEnabledNotifications().contains(action))
                .orElse(false);
    }

    public void enableNotification(Long userId, EventAction action) {
        NotificationPreferences prefs = repository.findById(userId)
                .orElseGet(() -> new NotificationPreferences(userId, new java.util.HashSet<>()));

        prefs.getEnabledNotifications().add(action);
        repository.save(prefs);
    }

    public void disableNotification(Long userId, EventAction action) {
        repository.findById(userId).ifPresent(prefs -> {
            prefs.getEnabledNotifications().remove(action);
            repository.save(prefs);
        });
    }
}