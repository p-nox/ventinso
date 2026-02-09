package com.example.notification_service.dto;

import com.example.notification_service.enums.EventAction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class NotificationSettingRequest {
    private EventAction action;
    private String type;
    private boolean enabled;
}
