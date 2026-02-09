package com.example.notification_service.entity;

import com.example.notification_service.enums.EventAction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Document(collection = "notification_settings")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NotificationSettings {

    @Id
    private String id;
    private Long userId;
    private Map<EventAction, NotificationType> notifications = new HashMap<>();

    public NotificationSettings(Long userId) {
        this.userId = userId;

        for (EventAction action : EventAction.values()) {
            notifications.put(action, NotificationType.defaultEnabled());
        }
    }

    // Inner class for flags Desktop(SSE) & Email
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class NotificationType {
        private boolean desktop;
        private boolean email;

        public static NotificationType defaultEnabled() {
            return new NotificationType(true, true);
        }
    }

    public static NotificationSettings withDefaults(Long userId) {
        NotificationSettings settings = new NotificationSettings();
        settings.setUserId(userId);

        Set<EventAction> defaults = Set.of(
                EventAction.ITEM_SOLD,
                EventAction.EMAIL_UPDATE,
                EventAction.PASSWORD_UPDATE,
                EventAction.ORDER_COMPLETED,
                EventAction.ORDER_CANCELLED,
                EventAction.ORDER_CONFIRMED
        );

        for (EventAction action : EventAction.values()) {
            if (defaults.contains(action)) {
                settings.getNotifications().put(action, NotificationType.defaultEnabled());
            } else {
                settings.getNotifications().put(action, new NotificationType(false, false));
            }
        }

        return settings;
    }

}



