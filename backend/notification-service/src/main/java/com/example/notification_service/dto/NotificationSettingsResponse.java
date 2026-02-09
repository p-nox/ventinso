package com.example.notification_service.dto;

import com.example.notification_service.enums.EventAction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NotificationSettingsResponse {

    private Long userId;
    private Map<EventAction, NotificationTypeResponse> notificationSettings;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class NotificationTypeResponse {
        private boolean desktop;
        private boolean email;
    }
}
