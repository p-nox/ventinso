package com.example.notification_service.entity;

import com.example.notification_service.enums.EventAction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.HashSet;
import java.util.Set;

@Document(collection = "notification_preferences")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NotificationPreferences {

    @Id
    private Long userId;

    private Set<EventAction> enabledNotifications = new HashSet<>();
}
